from fastapi import APIRouter
from pathlib import Path
import os

router = APIRouter()
shared_ads = Path(os.getenv("SHARED_ADS"))
shared_pics = Path(os.getenv("SHARED_PIC"))

@router.get("/ads/files")
def list_ads_files():
    if not shared_ads.exists():
        return {"error": "ADS directory not found"}
    else:
       print(f" Directory {shared_ads} found.")
    files = []
    for f in shared_ads.iterdir():
        print(f" Found file: {f.name}")
        if f.is_file() and f.suffix.lower() in [".json", ".yaml", ".yml"]:
            files.append(f.name)

    print(f" Returning files: {files}")   
    
    return {"files": files}