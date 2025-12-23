"""
Script to load flowers dataset, compress images to 64x64, and save to zip file
"""
import io
import os
import zipfile
from pathlib import Path
from PIL import Image


def process_flowers_dataset():
    # Define paths
    source_dir = Path("../../../ImageGen/GAN/data/flowers-102")
    output_dir = Path(__file__).parent.parent / "data"
    zip_path = output_dir / "real.zip"
    
    # Check if zip file already exists
    if zip_path.exists():
        print(f"Zip file already exists at {zip_path}. Delete it to regenerate.")
        return
    
    # Check if source directory exists
    if not source_dir.exists():
        print(f"Error: Source directory '{source_dir}' does not exist.")
        return
    
    output_dir.mkdir(parents=True, exist_ok=True)
    image_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.gif', '.tiff', '.webp'}
    
    processed_count = 0
    error_count = 0
    
    print(f"Processing images and writing directly to {zip_path}...")
    
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(source_dir):
            for file in files:
                file_path = Path(root) / file
                
                if file_path.suffix.lower() not in image_extensions:
                    continue
                
                try:
                    with Image.open(file_path) as img:
                        if img.mode != 'RGB':
                            img = img.convert('RGB')
                        img_resized = img.resize((64, 64), Image.Resampling.LANCZOS)
                        
                        # Write directly to zip in memory
                        img_bytes = io.BytesIO()
                        img_resized.save(img_bytes, 'JPEG', quality=85)
                        img_bytes.seek(0)
                        
                        # Get relative path for zip entry
                        relative_path = file_path.relative_to(source_dir)
                        zipf.writestr(str(relative_path), img_bytes.read())
                        
                        processed_count += 1
                        if processed_count % 100 == 0:
                            print(f"Processed {processed_count} images...")
                
                except Exception as e:
                    print(f"Error processing {file_path}: {e}")
                    error_count += 1
    
    zip_size_mb = zip_path.stat().st_size / (1024 * 1024)
    print(f"\nComplete! Processed {processed_count} images, {error_count} errors")
    print(f"Zip file: {zip_path} ({zip_size_mb:.2f} MB)")

if __name__ == "__main__":
    process_flowers_dataset()

