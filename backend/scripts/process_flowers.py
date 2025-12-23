"""
Script to load flowers dataset, compress images to 64x64, and save to zip file
Includes images from both training and validation sets.
"""
import io
import zipfile
from pathlib import Path

import torchvision.datasets as datasets
from PIL import Image


def process_flowers_dataset():
    output_dir = Path(__file__).parent.parent / "data"
    zip_path = output_dir / "real.zip"
    
    if zip_path.exists():
        print(f"Zip file already exists at {zip_path}. Delete it to regenerate.")
        return
    
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print("Loading training and validation sets from Flowers102 dataset...")
    try:
        flowers_train = datasets.Flowers102(
            root="../../../ImageGen/GAN/data",
            split="train",
            download=False,
            transform=None
        )
        flowers_val = datasets.Flowers102(
            root="../../../ImageGen/GAN/data",
            split="val",
            download=False,
            transform=None
        )
        print(f"Found {len(flowers_train)} training images and {len(flowers_val)} validation images")
    except Exception as e:
        print(f"Error loading dataset: {e}")
        print("Make sure the Flowers102 dataset is downloaded and available.")
        return
    
    processed_count = 0
    error_count = 0
    total_images = len(flowers_train) + len(flowers_val)
    
    print(f"Processing training and validation images and writing directly to {zip_path}...")
    
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for dataset, prefix in [(flowers_train, "train"), (flowers_val, "val")]:
            for idx in range(len(dataset)):
                try:
                    img, _ = dataset[idx]
                    if img.mode != 'RGB':
                        img = img.convert('RGB')
                    img_resized = img.resize((64, 64), Image.Resampling.LANCZOS)
                    
                    img_bytes = io.BytesIO()
                    img_resized.save(img_bytes, 'JPEG', quality=85)
                    img_bytes.seek(0)
                    
                    zipf.writestr(f"{prefix}_{idx:05d}.jpg", img_bytes.read())
                    processed_count += 1
                    if processed_count % 100 == 0:
                        print(f"Processed {processed_count}/{total_images} images...")
                except Exception as e:
                    print(f"Error processing {prefix} image {idx}: {e}")
                    error_count += 1
    
    zip_size_mb = zip_path.stat().st_size / (1024 * 1024)
    print(f"\nComplete! Processed {processed_count} images (train + val), {error_count} errors")
    print(f"Zip file: {zip_path} ({zip_size_mb:.2f} MB)")

if __name__ == "__main__":
    process_flowers_dataset()

