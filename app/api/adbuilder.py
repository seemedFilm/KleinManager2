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
max_images_per_ad = 16


@router.post("/adbuilder/builder")
async def build(request: Request):
    try:
        print(f'router.post("/adbuilder/builder"')
        data = await request.json()  
        title = data.get("title")
        title = re.sub(r'[^a-zA-Z0-9_\-]', '_', title)
        #title = "".join(c if c.isalnum() or c in "-_" else "_" for c in title)
        description = data.get("description")
        category= data.get("category")
        price = data.get("price")
        price_type = data.get("price_type")
        sell_directly = data.get("sell_directly")
        shipping_options = data.get("shipping_options")
        images = images = data.get("images", [])
        ad_filename = SHARED_ADS / f"ad_{title}.json"
       
        updated_images = []
        for img in images:
            image_name = Path(img).name
            updated_images.append(f"./{title}/{image_name}")
        data["images"] = updated_images
        
        with open(ad_filename, "w", encoding="utf-8") as adFile:
                json.dump(data, adFile, indent=2, ensure_ascii=False)
                
        print(f"✅ Ad-Daten gespeichert in: {ad_filename}")
        return {"status": "ok", "saved_file": str(ad_filename), "received_data": data}
    
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
    images

@router.post("/adbuilder/upload_images")
async def upload_images(
    title: str = Form(...),
    files: list[UploadFile] = File(...)
):
    try:
        title = re.sub(r'[^a-zA-Z0-9_\-]', '_', title)
        ad_pic_dir = SHARED_PICS / title
        ad_pic_dir.mkdir(parents=True, exist_ok=True)

        if len(files) > max_images_per_ad:
            return JSONResponse({"error": "Maximal 16 Bilder erlaubt!"}, status_code=400)

        saved_images = []
        for image in files:
            # ensure filename safe
            filename = Path(image.filename).name
            targetFolder = ad_pic_dir / filename
            with open(targetFolder, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)
            saved_images.append(filename)

        return JSONResponse({
            "uploaded": saved_images,
            "target_dir": str(ad_pic_dir)
        })
    except Exception as ex:
        print("upload_images error:", ex)
        return JSONResponse({"error": str(ex)}, status_code=500)

@router.get("/adbuilder/list_files")
def list_ads_files():
    if not SHARED_ADS.exists():
        return {"error": "ADS directory not found"}
    else:
       print(f" Directory {SHARED_ADS} found.")
    files = []
    for f in SHARED_ADS.iterdir():
        print(f" Found file: {f.name}")
        if f.is_file() and f.suffix.lower() in [".json", ".yaml", ".yml"]:
            files.append(f.name)

    print(f" Returning files: {files}")   
    
    return {"files": files}

@router.post("/adbuilder/load_ad")
async def load_ad(request: Request):
    data = await request.json()  
    title = data.get("title")

    
    for f in SHARED_ADS.iterdir():
        print(f" Found file: {f.name}")
        if f.is_file() and f.suffix.lower() in [".json", ".yaml", ".yml"]:
            if f.name == title:
                print(f" Loading file: {f.name}")
                with open(SHARED_ADS/f.name, "r", encoding="utf-8") as file:
                    ad_data = json.load(file)
                    print(f"Return ad data: {ad_data}")
                return JSONResponse(ad_data)

    print(f" Returning files: {title}")   
    
    return {"files": title}


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
