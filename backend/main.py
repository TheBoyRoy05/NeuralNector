from pathlib import Path
from typing import List

from fastapi import Depends, FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from images import ImageInfo, get_images_from_zip

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
