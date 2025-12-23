"""
Script to generate flower images using the trained GAN and keep only the most realistic ones.
Usage: python generate.py --count 2000 --keep 200
"""

import argparse
import io
import zipfile
from pathlib import Path
from typing import List, Tuple, Optional

import torch
import torchvision.transforms as transforms
from PIL import Image
from models import GAN, load_gan_model

MODELS_DIR = Path(__file__).parent.parent / "models"
DATA_DIR = Path(__file__).parent.parent / "data"

LATENT_DIM = 100
IMAGE_SIZE = 64
BATCH_SIZE = 32
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp"}

transform = transforms.Compose(
    [
        transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5]),
    ]
)


def score_batch(model: GAN, tensors: List[torch.Tensor]) -> List[float]:
    """Score a batch of image tensors."""
    if not tensors:
        return []
    batch = torch.stack(tensors).to(DEVICE)
    scores = model.discriminator(batch).squeeze().cpu()
    if scores.dim() == 0:
        scores = scores.unsqueeze(0)
    return [s.item() if scores.dim() > 0 else scores.item() for s in scores]


def generate_and_score(model: GAN, count: int) -> List[Tuple[torch.Tensor, float]]:
    """Generate images and score them."""
    model.generator.eval()
    model.discriminator.eval()
    images_with_scores = []

    with torch.no_grad():
        for i in range(0, count, BATCH_SIZE):
            batch_count = min(BATCH_SIZE, count - len(images_with_scores))
            z = torch.randn(batch_count, LATENT_DIM, device=DEVICE)
            fake_images = model.generator(z)
            scores = score_batch(model, [fake_images[j] for j in range(batch_count)])
            images_with_scores.extend(
                [(fake_images[j].cpu(), scores[j]) for j in range(batch_count)]
            )
            if (i // BATCH_SIZE + 1) % 10 == 0:
                print(f"  Generated {len(images_with_scores)}/{count}...")

    print(f"Generated {len(images_with_scores)} images")
    return images_with_scores


def load_and_score_existing(
    model: GAN, zip_path: Path
) -> List[Tuple[torch.Tensor, float]]:
    """Load and score existing images from zip file."""
    model.discriminator.eval()
    images_with_scores = []

    if not zip_path.exists():
        return []

    try:
        with zipfile.ZipFile(zip_path, "r") as z:
            zip_images = [n for n in z.namelist() if Path(n).suffix.lower() in EXTENSIONS]
    except:
        return []

    if not zip_images:
        return []

    print(f"Found {len(zip_images)} images in zip. Scoring...")

    with torch.no_grad():
        with zipfile.ZipFile(zip_path, "r") as z:
            for i in range(0, len(zip_images), BATCH_SIZE):
                batch_names = zip_images[i : i + BATCH_SIZE]
                tensors = []
                for n in batch_names:
                    try:
                        tensors.append(
                            transform(Image.open(io.BytesIO(z.read(n))).convert("RGB"))
                        )
                    except:
                        pass
                if tensors:
                    scores = score_batch(model, tensors)
                    images_with_scores.extend(
                        [(t.cpu(), s) for t, s in zip(tensors, scores)]
                    )

    print(f"Scored {len(images_with_scores)} existing images")
    return images_with_scores


def save_to_zip(tensors: List[torch.Tensor], scores: List[float], zip_path: Path):
    """Save images directly to zip file."""
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as z:
        for i, (tensor, score) in enumerate(zip(tensors, scores)):
            img = torch.clamp((tensor + 1) / 2.0, 0, 1)
            img_np = (img.permute(1, 2, 0).numpy() * 255).astype("uint8")
            pil_img = Image.fromarray(img_np)
            
            img_bytes = io.BytesIO()
            pil_img.save(img_bytes, "JPEG", quality=95)
            img_bytes.seek(0)
            
            z.writestr(f"gen_top_{i+1:05d}_score_{score:.4f}.jpg", img_bytes.read())
    
    size_mb = zip_path.stat().st_size / (1024 * 1024)
    print(f"Saved {len(tensors)} images to {zip_path.name} ({size_mb:.2f} MB)")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--count", type=int, default=2000, help="Images to generate")
    parser.add_argument("--keep", type=int, default=200, help="Images to keep")
    parser.add_argument("--batch_size", type=int, default=BATCH_SIZE)
    args = parser.parse_args()

    model = load_gan_model(DEVICE)
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    zip_path = DATA_DIR / "fake.zip"

    # Load existing and generate new
    existing = load_and_score_existing(model, zip_path)
    new = generate_and_score(model, args.count)

    # Combine and sort
    all_images = new + existing
    all_images.sort(key=lambda x: x[1], reverse=True)

    keep_count = min(args.keep, len(all_images))
    print(f"\nKeeping top {keep_count} of {len(all_images)} images")

    # Save directly to zip
    kept_tensors = [t for t, _ in all_images[:keep_count]]
    kept_scores = [s for _, s in all_images[:keep_count]]
    save_to_zip(kept_tensors, kept_scores, zip_path)

    # Stats
    print(f"\nComplete! Kept {keep_count} images")
    print(
        f"Score range: {min(kept_scores):.4f} - {max(kept_scores):.4f} (mean: {sum(kept_scores)/len(kept_scores):.4f})"
    )


if __name__ == "__main__":
    main()
