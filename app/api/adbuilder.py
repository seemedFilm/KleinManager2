from fastapi import APIRouter, FastAPI, Request, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import shutil
import json
import os
import re

router = APIRouter()

SHARED_ADS = Path(os.getenv("SHARED_ADS"))
SHARED_PICS = Path(os.getenv("SHARED_PIC"))


@router.post("/adbuilder/builder")
async def build(request: Request):
    try:
        data = await request.json()  
        title = data.get("title")
        filename = shared_ads / f"ad_{title}.json"
        
        with open(filename, "w", encoding="utf-8") as adFile:
                json.dump(data, adFile, indent=2, ensure_ascii=False)
        
        print(f"Ad Title: {title}")                   # z.B. "Irgendein Titel"

        print(f"✅ Ad-Daten gespeichert in: {filename}")
        return {"status": "ok", "saved_file": str(filename), "received_data": data}
    
    except Exception as ex:
        print(f"❌ Fehler beim Speichern der Ad-Datei: {ex}")
        return {"status": "error", "message": str(ex)}
   
#Fills the category html list from categories.txt 
@router.get("/adbuilder/categories")
async def get_categories():
    try:
        file_path = Path("/mnt/data/categories.txt")

        if not file_path.exists():
            return {"error": "categories.txt not found"}

        with open(file_path, "r", encoding="utf-8") as f:
            # Zeilen lesen, leere entfernen
            categories = [line.strip() for line in f.readlines() if line.strip()]

        return {"categories": categories}

    except Exception as ex:
        return {"error": str(ex)}
    
@router.post("/adbuilder/upload_images")
async def upload_images(
    title: str = Form(...),
    files: list[UploadFile] = File(...)
):
    safe_title = re.sub(r'[^a-zA-Z0-9_\-]', '_', title)
    
    ad_directory = SHARED_PICS / safe_title
    ad_directory.mkdir(parents=True, exist_ok=True)
    saved_images = []
    if len(files) > 16:
        return JSONResponse({"error": "Maximal 16 Bilder erlaubt!"}, status_code=400)

    for file in files:
        file_path = ad_directory / file.filename
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        saved_images.append(file.filename)

    print(f"✅ {len(saved_images)} Bilder gespeichert unter {ad_directory}")

    return JSONResponse({
        "uploaded": saved_images,
        "target_dir": str(ad_directory)
    })
def mount_images(app):
    app.mount("/ads/pics", StaticFiles(directory=str(SHARED_PICS)), name="ads_pics")
    
@router.get("/adbuilder/images")
async def list_images(title: str):
    safe_title = re.sub(r'[^a-zA-Z0-9_\-]', '_', title)
    ad_dir = SHARED_PICS / safe_title

    if not ad_dir.exists():
        return JSONResponse({"images": []})

    # Nur Bilddateien auflisten (jpg, jpeg, png, webp)
    valid_ext = [".jpg", ".jpeg", ".png", ".webp"]
    files = [
        f.name for f in ad_dir.iterdir()
        if f.is_file() and f.suffix.lower() in valid_ext
    ]

    return JSONResponse({
        "title": safe_title,
        "images": files
    })
