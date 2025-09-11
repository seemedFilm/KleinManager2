from fastapi import APIRouter
from pathlib import Path
import logging

router = APIRouter()

ADS_DIR = Path("/app/ads")

# Logging konfigurieren
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ads_loader")
logger.info(f"in ads verzeichnis!")

@router.get("/ads/files")
def list_ads_files():
    if not ADS_DIR.exists():
        logger.error(f"Directory {ADS_DIR} not found!")
        return {"error": "ADS directory not found"}

    files = []
    for f in ADS_DIR.iterdir():
        logger.info(f"Found file: {f.name} | suffix: {f.suffix}")
        if f.is_file() and f.suffix.lower() in [".json", ".yaml", ".yml"]:
            files.append(f.name)

    logger.info(f"Returning files: {files}")
    return {"files": files}
