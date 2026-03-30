from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import movies, tmdb
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Base.metadata.create_all(bind=engine)
app = FastAPI(title="MovieMate")

# In backend/main.py, replace lines 11-12:
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "https://moviemate-five.vercel.app",  # Your Vercel frontend
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

app.include_router(movies.router)
app.include_router(tmdb.router)
