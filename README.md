# 🎬 MovieMate

A full-stack app to track and manage your personal movie and TV show collection — with AI-powered reviews, smart recommendations, and TMDB integration.

🌐 **Live Demo**: https://moviemate-five.vercel.app  
📦 **GitHub**: https://github.com/gowtham-m-2005/moviemate

---

## ✨ Features

- **TMDB Integration** — search any movie or show and auto-fill title, poster, genre, director, runtime, and season details
- **Season Progress Tracking** — track episodes watched per season with visual sliders and progress bars
- **Filter & Search** — filter your collection by genre, platform, and status
- **AI Review Generator** — write rough notes and Groq AI expands them into a full review
- **AI Recommendations** — personalized suggestions based on your watch history and ratings
- **Watch Time Stats** — bar charts showing watch time by genre and platform
- **Detail Modals** — click any title to see full details including review, progress, and rating
- **Duplicate Detection** — prevents adding the same title twice
- **Deployed** — live on Vercel (frontend) + Railway (backend + PostgreSQL)

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, Framer Motion |
| Backend | FastAPI, SQLAlchemy, PostgreSQL |
| Package Management | uv (modern Python package manager) |
| Database Migrations | Alembic |
| Containerization | Docker & Docker Compose |
| AI | Groq API (Llama 3.3 70B) |
| External API | TMDB API |
| Deployment | Vercel + Railway |

---

## 🚀 Setup

### Prerequisites
- Python 3.14+
- Node.js 16+
- uv (Python package manager) → [install uv](https://docs.astral.sh/uv/getting-started/installation/)
- PostgreSQL
- TMDB API key → [themoviedb.org](https://www.themoviedb.org/settings/api)
- Groq API key → [console.groq.com](https://console.groq.com)

### Backend
```bash
cd backend
uv sync
```

Create `backend/.env`:
```
DATABASE_URL=postgresql://username:password@localhost/moviemate
TMDB_API_KEY=your_tmdb_api_key
GROQ_API_KEY=your_groq_api_key
IS_LOCAL=true
```

Create the database:
```bash
psql -U postgres -c "CREATE DATABASE moviemate;"
```

Run database migrations:
```bash
alembic upgrade head
```

Run the server:
```bash
uv run uvicorn main:app --reload
```

API docs available at `http://localhost:8000/docs`

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Create `frontend/.env`:
```
VITE_API_URL=http://localhost:8000
```

---

## 🐳 Docker Setup

```bash
# Start everything with Docker Compose
docker-compose up --build
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 🔄 Database Migrations

The project uses Alembic for database schema management.

```bash
# Generate new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/movies/` | Get all movies (supports genre, platform, status filters) |
| POST | `/movies/` | Add a new movie |
| PUT | `/movies/{id}` | Update movie details |
| DELETE | `/movies/{id}` | Remove from collection |
| GET | `/movies/stats/watch-time` | Watch time stats by genre and platform |
| GET | `/movies/ai/recommendations` | AI-powered recommendations |
| POST | `/movies/ai/review/{id}` | Generate AI review from notes |
| GET | `/tmdb/search` | Search TMDB |
| GET | `/tmdb/detail` | Get full movie/show details from TMDB |

---

## 🗄 Database Schema

| Field | Type | Description |
|---|---|---|
| id | Integer | Primary key |
| title | String | Movie/show title |
| director | String | Director or creator |
| genre | String | Comma-separated genres |
| platform | String | Streaming platform |
| content_type | String | `movie` or `tv` |
| status | String | `wishlist`, `watching`, `completed` |
| episodes_watched | Integer | Episodes watched |
| total_episodes | Integer | Total episodes |
| seasons_data | Text | JSON — per-season progress |
| rating | Float | User rating (0–10) |
| review | String | User or AI-generated review |
| poster_url | String | TMDB poster URL |
| tmdb_id | String | TMDB reference ID |
| watch_minutes | Integer | Runtime in minutes |
| created_at | DateTime | Date added |

---

## 📁 Project Structure
```
moviemate/
├── backend/
│   ├── alembic/              # Database migrations
│   │   ├── versions/
│   │   ├── env.py
│   │   └── script.py.mako
│   ├── alembic.ini
│   ├── Dockerfile.local
│   ├── pyproject.toml        # uv package configuration
│   ├── uv.lock              # Dependency lock file
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── database.py
│   ├── Procfile
│   └── routes/
│       ├── movies.py
│       └── tmdb.py
├── docker-compose.yml        # Docker orchestration
├── .dockerignore
└── frontend/
    └── src/
        ├── api/
        │   └── axios.js
        ├── components/
        │   ├── Navbar.jsx
        │   ├── MovieCard.jsx
        │   ├── MovieModal.jsx
        │   └── Toast.jsx
        └── pages/
            ├── Home.jsx
            ├── AddMovie.jsx
            └── Stats.jsx
```

---

## 🌐 Deployment

- **Frontend** → Vercel (auto-deploys on push to main)
- **Backend + DB** → Railway (FastAPI + PostgreSQL)