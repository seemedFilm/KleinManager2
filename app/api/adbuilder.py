from fastapi import APIRouter, FastAPI, Request
from pathlib import Path

router = APIRouter()
app = FastAPI()

@router.get("/adbuilder/builder")
def build(request: Request):
    data = request.json()       # 👈 JSON-Body auslesen
    ad_title = data.get("ad_title")   # Zugriff auf dein Feld
    print(ad_title)                   # z.B. "Irgendein Titel"

    return {"status": "ok", "received_title": ad_title}
    