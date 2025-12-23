import base64
import io
import random
import sys
import zipfile
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
REAL_ZIP = DATA_DIR / "real.zip"
FAKE_ZIP = DATA_DIR / "fake.zip"
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


def score_image_from_bytes(model: GAN, img_bytes: bytes) -> float:
    """Score an image from bytes using the discriminator."""
    transform = transforms.Compose(
        [
            transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5]),
        ]
    )

    img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    tensor = transform(img).unsqueeze(0).to(DEVICE)

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
    Get a specified number of real and fake flower images from zip files.

    Args:
        count: Number of images to return (default: 8)
        real: Whether to return real images (default: True)

    Returns:
        List of images with base64-encoded data and discriminator scores
    """
    zip_path = REAL_ZIP if real else FAKE_ZIP
    
    if not zip_path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Zip file not found: {zip_path}",
        )

    # Get list of images from zip
    try:
        with zipfile.ZipFile(zip_path, "r") as z:
            image_names = [
                name for name in z.namelist()
                if Path(name).suffix.lower() in {".jpg", ".jpeg", ".png"}
            ]
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error reading zip file: {str(e)}",
        )

    if len(image_names) < count:
        raise HTTPException(
            status_code=500,
            detail=f"Not enough images available. Found {len(image_names)}, requested {count}",
        )

    selected_names = random.sample(image_names, count)

    images = []
    with zipfile.ZipFile(zip_path, "r") as z:
        for img_name in selected_names:
            try:
                img_bytes = z.read(img_name)
                img_base64 = base64.b64encode(img_bytes).decode("utf-8")
                image_data = f"data:image/jpeg;base64,{img_base64}"
                
                score = round(score_image_from_bytes(gan_model, img_bytes), 4)
                
                images.append(
                    ImageInfo(
                        image_id=f"{'real' if real else 'fake'}_{Path(img_name).stem}",
                        image_data=image_data,
                        is_real=real,
                        score=score,
                    )
                )
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"Error processing image {img_name}: {str(e)}",
                )

    return images
