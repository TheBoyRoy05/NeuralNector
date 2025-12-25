from pathlib import Path
from typing import List

from fastapi import Depends, FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from images import ImageInfo, get_images_from_zip
from leaderboard import (
    LeaderboardResponse,
    LeaderboardEntryCreate,
    get_leaderboard,
    create_leaderboard_entry,
    get_db,
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = Path("data")
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
async def get_leaderboard(
    difficulty: str = Query(..., description="Difficulty level"),
    top_n: int = Query(..., ge=1, le=100, description="Number of top leaderboard rows to view"),
    user_score: float = Query(..., ge=0, description="User's score"),
    db: Session = Depends(get_db),
):
    """Get leaderboard entries with user's score inserted appropriately."""
    return get_leaderboard(db, difficulty, top_n, user_score)


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
