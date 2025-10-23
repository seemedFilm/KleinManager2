from fastapi import APIRouter, FastAPI, Request, UploadFile, File, Form
from fastapi.responses import JSONResponse
from pathlib import Path
import shutil
import json
import os

router = APIRouter()
app = FastAPI()

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
    print(f"Uploading images for ad title: {title}")
    print(f"Number of files received: {files}")
    ad_directory = SHARED_PICS / title
    ad_directory.mkdir(parents=True, exist_ok=True)
    saved_images = []
    print(f"saved_images initialized: {saved_images}")
    for file in files:
        file_path = ad_directory / file.filename

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        saved_images.append(file.filename)

    return JSONResponse({
        "images": saved_images,
        "ad_directory": str(ad_directory)
        })