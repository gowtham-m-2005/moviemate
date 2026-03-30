from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.sql import func
from database import Base


class Movie(Base):
    __tablename__ = "movies"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    director = Column(String)
    genre = Column(String)
    platform = Column(String)
    content_type = Column(String)
    status = Column(String)
    episodes_watched = Column(Integer, default=0)
    total_episodes = Column(Integer, default=0)
    seasons_data = Column(
        Text, default="{}"
    )  # JSON string: {"1": {"watched": 5, "total": 10}}
    rating = Column(Float, default=0)
    review = Column(String, default="")
    poster_url = Column(String, default="")
    tmdb_id = Column(String, default="")
    watch_minutes = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_synced_at = Column(
        DateTime(timezone=True), nullable=True
    )  # Backend-only: TMDB data last updated
