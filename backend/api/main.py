from pathlib import Path
from typing import List, Optional

from fastapi import Depends, FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from api.images import ImageInfo, get_images_from_zip
from api.leaderboard import (
    LeaderboardResponse,
    LeaderboardEntryCreate,
    get_leaderboard,
    create_leaderboard_entry,
    get_db,
)

app = FastAPI()

# CORS - Update with your production frontend URL
import os
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files from backend/static (copied from frontend/dist during build)
STATIC_DIR = Path(__file__).parent.parent / "static"
if STATIC_DIR.exists():
    # Serve static assets (JS, CSS, images, etc.)
    assets_dir = STATIC_DIR / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")
    
    @app.get("/")
    async def serve_frontend():
        """Serve the frontend index.html"""
        index_path = STATIC_DIR / "index.html"
        if index_path.exists():
            return FileResponse(index_path)
        return {"message": "Frontend not built. Run 'npm run build'."}

# Data directory is one level up from api/
DATA_DIR = Path(__file__).parent.parent / "data"
REAL_ZIP = DATA_DIR / "real.zip"
FAKE_ZIP = DATA_DIR / "fake.zip"


@app.get("/api/v1/health")
async def health():
    return {"status": "healthy"}


@app.get("/api/v1/images", response_model=List[ImageInfo])
async def get_images(
    count: int = Query(default=8, ge=1, le=100, description="Number of images to return"),
    real: bool = Query(default=True, description="Whether to return real images"),
):
    """Get a specified number of real and fake flower images from zip files."""
    zip_path = REAL_ZIP if real else FAKE_ZIP
    return get_images_from_zip(zip_path, count, real)


@app.get("/api/v1/leaderboard", response_model=List[LeaderboardResponse])
async def get_leaderboard_endpoint(
    difficulty: str = Query(..., description="Difficulty level"),
    top_n: int = Query(..., ge=1, le=100, description="Number of top leaderboard rows to view"),
    user_score: Optional[float] = Query(None, ge=0, description="User's score, None if refetch"),
    user_id: Optional[int] = Query(None, description="User's id, None if refetch"),
    db: Session = Depends(get_db),
):
    """Get leaderboard entries with user's score inserted appropriately."""
    return get_leaderboard(db, difficulty, top_n, user_score, user_id)


@app.post("/api/v1/leaderboard", response_model=dict)
async def post_score(
    entry: LeaderboardEntryCreate,
    db: Session = Depends(get_db),
):
    """Submit a score to the leaderboard."""
    db_entry = create_leaderboard_entry(db, entry)
    return {
        "id": db_entry.id,
        "name": db_entry.name,
        "score": db_entry.score,
        "difficulty": db_entry.difficulty,
        "message": "Score submitted successfully",
    }

