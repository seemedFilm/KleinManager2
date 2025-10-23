from fastapi import APIRouter, FastAPI, Request
from pathlib import Path
import json
import os

router = APIRouter()
app = FastAPI()

shared_ads = Path(os.getenv("SHARED_ADS"))
shared_pics = Path(os.getenv("SHARED_PIC"))


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
