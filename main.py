import os, sys
import os


from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.templating import Jinja2Templates

from app.core.config import settings
from app.core.database import engine, Base
from app.api.routes import router
from app.services.notification_service import Notification
from app.services.background_tasks import background_task_manager

# pl custom
from app.api.load_ads import router as load_ads
from app.api.routes_bot import router as bot
from app.api.adbuilder import router as adbuilder
from app.api.adbuilder import mount_images
from pathlib import Path

# Create database tables
Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Starting KleinManager...")
    print("📋 Starting background monitoring tasks...")
    await background_task_manager.start_all_tasks()
    yield
    print("🛑 Stopping background monitoring tasks...")
    await background_task_manager.stop_all_tasks()
    print("👋 KleinManager shutdown complete")

if getattr(sys, 'frozen', False):
    base_path = sys._MEIPASS
else:
    base_path = os.path.abspath(".")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
    lifespan=lifespan
)

# Static files
static_dir = os.path.join(base_path, "static")
app.mount("/static", StaticFiles(directory=static_dir), name="static")
# Ad files
SHARED_PICS = Path(os.getenv("SHARED_PIC", "/mnt/ads/pics"))
app.mount("/ads/pics", StaticFiles(directory=str(SHARED_PICS)), name="ads_pics")
# Mount für dein Addon (HTML, JS, CSS)
addon_path = "/app/addons/adbuilder"
app.mount("/app/addons/adbuilder", StaticFiles(directory=addon_path), name="adbuilder")
# Route für das Haupt-HTML deines Addons (falls direkt geladen werden soll)
@app.get("/addons/adbuilder/adbuilder.html")
def serve_adbuilder_html():
    file_path = os.path.join(addon_path, "adbuilder.html")
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type="text/html")
    return {"detail": "adbuilder.html not found"}


# Templates
templates = Jinja2Templates(directory=os.path.join(base_path, "templates"))

app.include_router(router)
app.include_router(load_ads, prefix="/api/v1", tags=["ads"])
app.include_router(bot, prefix="/api/v1", tags=["bot"])
app.include_router(adbuilder, prefix="/api/v1", tags=["adbuilder"])
mount_images(app)

@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/images/{filename}")
async def get_image(filename: str):
    file_path = os.path.join(settings.IMAGE_STORAGE_PATH, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    return {"error": "Image not found"}

if __name__ == "__main__":
    import uvicorn, webbrowser, threading, time

    def open_browser():
        time.sleep(1)
        webbrowser.open("http://localhost:8000")

    threading.Thread(target=open_browser).start()
    
    print(f"🚀 {settings.APP_NAME} v{settings.APP_VERSION} starting...")
    print(f"📱 Open http://localhost:8000")
    print(f"📚 API docs: http://localhost:8000/docs")

    reload_mode = os.getenv("DEBUG", "false").lower() == "true"
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=reload_mode,
        log_config=None  # <<< verhindert doppelte Logs
    )



@app.get("/version")
def version():
    return {
        "gitCommit": os.getenv("GIT_COMMIT", "unknown"),
        "gitDate": os.getenv("GIT_DATE", "unknown"),
        "buildDate": os.getenv("BUILD_DATE", "unknown"),
        "appVersion": os.getenv("APP_VERSION", "unknown"),
        "branchName": os.getenv("BRANCH_NAME", "unknown")
    }