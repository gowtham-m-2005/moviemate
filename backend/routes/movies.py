from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Movie
from schemas import MovieCreate, MovieUpdate, MovieOut
from typing import List, Optional
from groq import Groq
from pydantic import BaseModel
import os, json
from dotenv import load_dotenv
load_dotenv()

class ReviewRequest(BaseModel):
    review: Optional[str] = None

router = APIRouter(prefix="/movies", tags=["movies"])

@router.get("/", response_model=List[MovieOut])
def get_movies(genre: Optional[str] = None, platform: Optional[str] = None,
               status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Movie)
    if genre:    query = query.filter(Movie.genre.ilike(f"%{genre}%"))
    if platform: query = query.filter(Movie.platform == platform)
    if status:   query = query.filter(Movie.status == status)
    return query.all()

@router.post("/", response_model=MovieOut)
def add_movie(movie: MovieCreate, db: Session = Depends(get_db)):
    if movie.tmdb_id:
        existing = db.query(Movie).filter(Movie.tmdb_id == movie.tmdb_id).first()
        if existing:
            raise HTTPException(status_code=409, detail="Already in your collection")
    db_movie = Movie(**movie.dict())
    db.add(db_movie)
    db.commit()
    db.refresh(db_movie)
    return db_movie

@router.put("/{movie_id}", response_model=MovieOut)
def update_movie(movie_id: int, movie: MovieUpdate, db: Session = Depends(get_db)):
    db_movie = db.query(Movie).filter(Movie.id == movie_id).first()
    for key, value in movie.dict().items():
        setattr(db_movie, key, value)
    db.commit()
    db.refresh(db_movie)
    return db_movie

@router.delete("/{movie_id}")
def delete_movie(movie_id: int, db: Session = Depends(get_db)):
    db.query(Movie).filter(Movie.id == movie_id).delete()
    db.commit()
    return {"message": "Deleted"}

@router.get("/stats/watch-time")
def watch_time_stats(db: Session = Depends(get_db)):
    movies = db.query(Movie).all()
    by_genre = {}
    by_platform = {}
    for m in movies:
        by_genre[m.genre] = by_genre.get(m.genre, 0) + (m.watch_minutes or 0)
        by_platform[m.platform] = by_platform.get(m.platform, 0) + (m.watch_minutes or 0)
    return {"by_genre": by_genre, "by_platform": by_platform}

@router.get("/ai/recommendations")
def get_recommendations(db: Session = Depends(get_db)):
    movies = db.query(Movie).all()
    if not movies:
        return {"recommendations": []}

    watched = [m for m in movies if m.status in ["completed", "watching"]]
    if not watched:
        return {"recommendations": []}

    history = [{"title": m.title, "genre": m.genre, "rating": m.rating, "status": m.status} for m in watched]

    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{
            "role": "user",
            "content": f"""Based on this user's watch history and ratings, recommend 5 movies or TV shows.

Watch history: {json.dumps(history, indent=2)}

Respond ONLY with a JSON array, no markdown, no backticks, no explanation:
[
  {{
    "title": "Title",
    "type": "movie or tv",
    "genre": "Genre",
    "reason": "One sentence why they'd like it",
    "similarity": "Similar to X which they rated Y/10"
  }}
]"""
        }],
        temperature=0.7,
        max_tokens=1024,
    )

    try:
        text = response.choices[0].message.content.strip()
        recs = json.loads(text)
        # fetch poster for each recommendation from TMDB
        from routes.tmdb import session as tmdb_session, BASE, TMDB_KEY
        for rec in recs:
            try:
                kind = "tv" if rec.get("type") == "tv" else "movie"
                res = tmdb_session.get(f"{BASE}/search/{kind}?api_key={TMDB_KEY}&query={rec['title']}", timeout=5, verify=False)
                results = res.json().get("results", [])
                if results and results[0].get("poster_path"):
                    rec["poster_url"] = f"https://image.tmdb.org/t/p/w300{results[0]['poster_path']}"
                    rec["overview"] = results[0].get("overview", "")
                    rec["tmdb_id"] = str(results[0]["id"])
                else:
                    rec["poster_url"] = ""
                    rec["overview"] = ""
                    rec["tmdb_id"] = ""
            except:
                rec["poster_url"] = ""
                rec["overview"] = ""
                rec["tmdb_id"] = ""
        return {"recommendations": recs}
    except:
        return {"recommendations": []}


@router.post("/ai/review/{movie_id}")
def generate_review(movie_id: int, body: ReviewRequest, db: Session = Depends(get_db)):
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    # use notes from request body if provided, else fall back to DB
    notes = (body.review if body and body.review else movie.review or "").strip()

    if not notes:
        raise HTTPException(status_code=400, detail="Add some notes first")

    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{
            "role": "user",
            "content": f"""You are a movie critic. Expand these rough notes into a short, engaging 3-4 sentence review.

Movie: {movie.title}
Genre: {movie.genre}
User rating: {movie.rating}/10
Rough notes: {notes}

Write a natural, personal review in first person. Keep it concise and honest. No filler phrases. Just the review, nothing else."""
        }],
        temperature=0.8,
        max_tokens=300,
    )

    generated = response.choices[0].message.content.strip()
    movie.review = generated
    db.commit()
    db.refresh(movie)
    return {"review": generated}