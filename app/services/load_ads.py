from fastapi import APIRouter
from pathlib import Path

router = APIRouter()

ADS_DIR = Path("/app/ads")

@router.get("/ads/files")
def list_ads_files():
    if not ADS_DIR.exists():
        return "false directory"
    files = [f.name for f in ADS_DIR.iterdir() if f.suffix in [".json", ".yaml", ".yml"]]
    return files
