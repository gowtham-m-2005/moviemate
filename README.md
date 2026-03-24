# MovieMate

A comprehensive movie and TV series tracking application built with FastAPI backend and React frontend. MovieMate helps you organize your entertainment collection, track viewing progress, and discover new content.

## Features

### Core Functionality
- **Movie & TV Series Management**: Add, edit, and delete movies and TV shows from your personal collection
- **Progress Tracking**: Track episodes watched for TV series with season-wise progress monitoring
- **Rating System**: Rate and review movies with personalized feedback
- **Smart Filtering**: Filter content by genre, platform, and viewing status
- **TMDB Integration**: Search and import movies directly from The Movie Database (TMDB)
- **AI-Powered Reviews**: Generate intelligent reviews using Groq AI integration

### Analytics & Statistics
- **Viewing Statistics**: Track total watch time and viewing patterns
- **Genre Distribution**: Visual breakdown of your content by genre
- **Platform Analytics**: See which streaming platforms you use most
- **Progress Visualization**: Charts and graphs for your viewing data

## Tech Stack

### Backend
- **FastAPI**: Modern, fast web framework for building APIs
- **SQLAlchemy**: SQL toolkit and ORM for database operations
- **PostgreSQL**: Robust relational database
- **Groq**: AI integration for intelligent review generation
- **TMDB API**: External movie database integration

### Frontend
- **React 19**: Modern React framework with latest features
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **Axios**: HTTP client for API communication
- **Framer Motion**: Animation library
- **Lucide React**: Icon library
- **Recharts**: Data visualization library

## Setup Steps

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL database
- TMDB API key
- Groq API key

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd moviemate
   ```

2. **Set up Python environment**
   ```bash
   cd backend
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   Create a `.env` file in the backend directory:
   ```env
   DATABASE_URL=postgresql://username:password@localhost/moviemate
   TMDB_API_KEY=your_tmdb_api_key
   GROQ_API_KEY=your_groq_api_key
   ```

5. **Run database migrations**
   ```bash
   python main.py
   ```

6. **Start the backend server**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## Project Documentation

### API Endpoints

#### Movies
- `GET /movies/` - Get all movies with optional filtering
- `POST /movies/` - Add a new movie to collection
- `PUT /movies/{movie_id}` - Update movie details
- `DELETE /movies/{movie_id}` - Remove movie from collection
- `POST /movies/{movie_id}/review` - Generate AI review for movie

#### TMDB Integration
- `GET /tmdb/search` - Search movies on TMDB
- `GET /tmdb/movie/{id}` - Get movie details from TMDB

### Database Schema

#### Movie Model
- `id`: Primary key
- `title`: Movie/Series title
- `director`: Director name
- `genre`: Content genre
- `platform`: Streaming platform
- `content_type`: Type (Movie/Series)
- `status`: Viewing status
- `episodes_watched`: Number of episodes watched
- `total_episodes`: Total episodes in series
- `seasons_data`: JSON data for season-wise progress
- `rating`: Personal rating (1-10)
- `review`: Personal or AI-generated review
- `poster_url`: Movie poster image URL
- `tmdb_id`: TMDB database ID
- `watch_minutes`: Total watch time in minutes
- `created_at`: Timestamp when added

### Frontend Components Structure

```
src/
├── components/
│   ├── Navbar.jsx
│   ├── MovieCard.jsx
│   ├── StatsCard.jsx
│   └── ...
├── pages/
│   ├── Home.jsx
│   ├── AddMovie.jsx
│   └── Stats.jsx
├── hooks/
│   └── useMovies.js
├── services/
│   └── api.js
└── utils/
    └── helpers.js
```

### Environment Variables

#### Backend (.env)
- `DATABASE_URL`: PostgreSQL connection string
- `TMDB_API_KEY`: TMDB API key for movie data
- `GROQ_API_KEY`: Groq API key for AI reviews

#### Deployment
- Backend & PostgreSQL Database deployed on Railway
- Frontend deployed on Vercel