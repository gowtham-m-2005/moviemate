from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import movies, tmdb
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

Base.metadata.create_all(bind=engine)
app = FastAPI(title="MovieMate")

app.add_middleware(CORSMiddleware, allow_origins=["*"],
                   allow_methods=["*"], allow_headers=["*"])

app.include_router(movies.router)
app.include_router(tmdb.router)