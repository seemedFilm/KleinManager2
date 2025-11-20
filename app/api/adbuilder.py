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


@router.post("/adbuilder/save_ad")
async def save_ad(
    title: str = Form(...),
    description: str = Form(""),
    category: str = Form(""),
    price: str = Form(""),
    price_type: str = Form(""),
    sell_directly: str = Form("0"),
    shipping_type: str = Form(""),
    shipping_option: list[str] = Form([]),
    images: list[UploadFile] = File([]),
):
    try:
        ad_filename = SHARED_ADS / f"ad_{title}.json"
        img_dir = SHARED_PICS / title
        img_dir.mkdir(parents=True, exist_ok=True)
        
        saved_images = []
        for img in images:
            filename = Path(img.filename).name
            target = img_dir / filename
            with open(target, "wb") as buffer:
                shutil.copyfileobj(img.file, buffer)
            saved_images.append(f"./{title}/{filename}")
            
        ad_data = {
            "title": title,
            "description": description,
            "category": category,
            "price": price,
            "price_type": price_type,
            "sell_directly": sell_directly,
            "shipping_type": shipping_type,
            "shipping_options": shipping_option,
            "images": saved_images,
        }
        with open(ad_filename, "w", encoding="utf-8") as f:
            json.dump(ad_data, f, indent=2, ensure_ascii=False)
        return {"success": True, "file": str(ad_filename)}
    except Exception as ex:
        return {"success": False, "error": str(ex)}

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
    try:
        print("/adbuilder/list_files()")        
        if not SHARED_ADS.exists():
            return {"error": "ADS directory not found"}
        else:
            print(f" Directory {SHARED_ADS} found.")        
        files = []
        for f in SHARED_ADS.iterdir():            
            if f.is_file() and f.suffix.lower() in [".json", ".yaml", ".yml"]:
                print(f" Found file: {f.name}")
                files.append(f.name)  
        return {"success": True, "files": files}
        
    except Exception as ex:
        return {"success": False, "error": str(ex)}
   
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
