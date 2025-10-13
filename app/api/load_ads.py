from fastapi import APIRouter
from pathlib import Path

router = APIRouter()

ADS_DIR = Path("/app/ads")


@router.get("/ads/files")
def list_ads_files():
    if not ADS_DIR.exists():
        return {"error": "ADS directory not found"}
    else:
       print(f" Directory {ADS_DIR} found.")
    files = []
    for f in ADS_DIR.iterdir():
        print(f" Found file: {f.name}")
        if f.is_file() and f.suffix.lower() in [".json", ".yaml", ".yml"]:
            files.append(f.name)

    print(f" Returning files: {files}")
    
    
    return {"files": files}