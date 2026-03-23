from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Movie
from schemas import MovieCreate, MovieUpdate, MovieOut
from typing import List, Optional

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