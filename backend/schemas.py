from pydantic import BaseModel
from typing import Optional

class MovieCreate(BaseModel):
    title: str
    director: Optional[str] = ""
    genre: Optional[str] = ""
    platform: Optional[str] = ""
    content_type: Optional[str] = "movie"
    status: Optional[str] = "wishlist"
    episodes_watched: Optional[int] = 0
    total_episodes: Optional[int] = 0
    seasons_data: Optional[str] = "{}"
    rating: Optional[float] = 0
    review: Optional[str] = ""
    poster_url: Optional[str] = ""
    tmdb_id: Optional[str] = ""
    watch_minutes: Optional[int] = 0

class MovieUpdate(MovieCreate):
    pass

class MovieOut(MovieCreate):
    id: int
    class Config:
        from_attributes = True