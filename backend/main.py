import base64
import random
import sys
from pathlib import Path
from typing import List

import torch
import torchvision.transforms as transforms
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from pydantic import BaseModel

# Add scripts directory to path to import models
sys.path.insert(0, str(Path(__file__).parent / "scripts"))
from models import GAN, load_gan_model

app = FastAPI()

# Add CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths
DATA_DIR = Path("data")
REAL_DIR = DATA_DIR / "real"
GENERATED_DIR = DATA_DIR / "generated"
MODELS_DIR = Path("models")

# Model parameters (should match training config)
CHANNELS = 3
LATENT_DIM = 100
IMAGE_SIZE = 64
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
gan_model: GAN = load_gan_model(DEVICE)


class ImageInfo(BaseModel):
    image_id: str
    image_data: str
    is_real: bool
    score: float


@app.get("/api/v1/health")
async def health():
    return {"status": "healthy"}


def score_image(model: GAN, image_path: Path) -> float:
    """Score an image using the discriminator."""
    # Load and transform image
    transform = transforms.Compose(
        [
            transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5]),  # Normalize to [-1, 1]
        ]
    )

    img = Image.open(image_path).convert("RGB")
    tensor = transform(img).unsqueeze(0).to(DEVICE)  # Add batch dimension

    model.discriminator.eval()
    with torch.no_grad():
        score = model.discriminator(tensor)
        return score.squeeze().cpu().item()


@app.get("/api/v1/images", response_model=List[ImageInfo])
async def get_images(
    count: int = Query(default=8, ge=1, le=100, description="Number of images to return"),
    real: bool = Query(default=True, description="Whether to return real images"),
):
    """
    Get a specified number of real and fake flower images.

    Args:
        count: Number of images to return (default: 8)
        real: Whether to return real images (default: True)

    Returns:
        List of images with base64-encoded data and discriminator scores
    """
    image_files = list((REAL_DIR if real else GENERATED_DIR).glob("*.jpg"))
    if len(image_files) < count:
        raise HTTPException(
            status_code=500,
            detail=f"Not enough images available. Found {len(image_files)}, requested {count}",
        )

    selected_files = random.sample(image_files, count)

    images = []
    for img_path in selected_files:
        # Read and encode image
        with open(img_path, "rb") as img_file:
            img_bytes = img_file.read()
            img_base64 = base64.b64encode(img_bytes).decode("utf-8")
            image_data = f"data:image/jpeg;base64,{img_base64}"

        images.append(
            ImageInfo(
                image_id=f"{'real' if real else 'fake'}_{img_path.stem}",
                image_data=image_data,
                is_real=real,
                score=round(score_image(gan_model, img_path), 4),
            )
        )

    return images
