import base64
import random
import zipfile
from pathlib import Path
from typing import List

from fastapi import HTTPException
from pydantic import BaseModel


class ImageInfo(BaseModel):
    image_id: str
    image_data: str
    is_real: bool


def get_images_from_zip(
    zip_path: Path,
    count: int,
    real: bool,
) -> List[ImageInfo]:
    """Get images from zip file."""
    if not zip_path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Zip file not found: {zip_path}",
        )

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

                images.append(
                    ImageInfo(
                        image_id=f"{'real' if real else 'fake'}_{Path(img_name).stem}",
                        image_data=image_data,
                        is_real=real,
                    )
                )
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"Error processing image {img_name}: {str(e)}",
                )

    return images

