from fastapi import APIRouter
from pathlib import Path
import os

router = APIRouter()
shared_ads = Path(os.getenv("SHARED_ADS"))
shared_pics = Path(os.getenv("SHARED_PIC"))

