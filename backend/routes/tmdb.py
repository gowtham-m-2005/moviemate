from fastapi import APIRouter
import requests
import os
import ssl
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/tmdb", tags=["tmdb"])
TMDB_KEY = os.getenv("TMDB_API_KEY")
BASE = "https://api.themoviedb.org/3"
IS_LOCAL = os.getenv("IS_LOCAL", "false").lower() == "true"

if IS_LOCAL:
    from requests.adapters import HTTPAdapter

    class TLSAdapter(HTTPAdapter):
        def init_poolmanager(self, *args, **kwargs):
            ctx = ssl.create_default_context()
            ctx.set_ciphers("DEFAULT")
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
            kwargs["ssl_context"] = ctx
            return super().init_poolmanager(*args, **kwargs)

    session = requests.Session()
    session.mount("https://", TLSAdapter())
else:
    session = requests.Session()

session.headers.update({"User-Agent": "MovieMate/1.0", "Accept": "application/json"})


def tmdb_get(url):
    verify = not IS_LOCAL
    res = session.get(url, timeout=10, verify=verify)
    res.raise_for_status()
    return res.json()


@router.get("/search")
def search_tmdb(query: str, type: str = "movie"):
    results = tmdb_get(f"{BASE}/search/{type}?api_key={TMDB_KEY}&query={query}").get(
        "results", []
    )[:6]
    return [
        {
            "tmdb_id": str(r["id"]),
            "title": r.get("title") or r.get("name"),
            "poster_url": (
                f"https://image.tmdb.org/t/p/w92{r['poster_path']}"
                if r.get("poster_path")
                else ""
            ),
            "genre": "",
        }
        for r in results
    ]


@router.get("/detail")
def get_detail(tmdb_id: str, type: str = "movie"):
    detail = tmdb_get(f"{BASE}/{type}/{tmdb_id}?api_key={TMDB_KEY}")
    genres = ", ".join([g["name"] for g in detail.get("genres", [])])

    director = ""
    if type == "movie":
        credits = tmdb_get(f"{BASE}/movie/{tmdb_id}/credits?api_key={TMDB_KEY}")
        director = next(
            (c["name"] for c in credits.get("crew", []) if c["job"] == "Director"), ""
        )
    elif type == "tv":
        creators = detail.get("created_by", [])
        director = ", ".join([c["name"] for c in creators]) if creators else ""

    return {
        "tmdb_id": str(tmdb_id),
        "title": detail.get("title") or detail.get("name"),
        "poster_url": (
            f"https://image.tmdb.org/t/p/w300{detail['poster_path']}"
            if detail.get("poster_path")
            else ""
        ),
        "genre": genres,
        "director": director,
        "total_episodes": detail.get("number_of_episodes", 0) if type == "tv" else 0,
        "runtime": detail.get("runtime") or (detail.get("episode_run_time") or [0])[0],
        "seasons": (
            [
                {
                    "season_number": s["season_number"],
                    "episode_count": s["episode_count"],
                    "name": s["name"],
                }
                for s in detail.get("seasons", [])
                if s["season_number"] > 0
            ]
            if type == "tv"
            else []
        ),
    }
