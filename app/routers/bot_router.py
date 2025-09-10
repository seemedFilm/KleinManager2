from fastapi import APIRouter
import subprocess
from app.services.ka_bot_ads import save_job, load_job, list_jobs

router = APIRouter(
    prefix="/bot",
    tags=["Bot"]
)

CONTAINER_NAME = "kleinbot"
PROCESS_NAME = "main.py"  # Name des Botskripts im Container


@router.post("/start")
def start_bot():
    """
    Startet den Bot im Container im Hintergrund.
    """
    try:
        subprocess.run(
            ["docker", "exec", "-d", CONTAINER_NAME, "python", PROCESS_NAME],
            check=True
        )
        return {"status": "Bot gestartet"}
    except subprocess.CalledProcessError as e:
        return {"error": f"Fehler beim Starten: {e}"}


@router.post("/stop")
def stop_bot():
    """
    Stoppt den Bot-Prozess im Container.
    """
    try:
        subprocess.run(
            ["docker", "exec", CONTAINER_NAME, "pkill", "-f", PROCESS_NAME],
            check=True
        )
        return {"status": "Bot gestoppt"}
    except subprocess.CalledProcessError:
        return {"status": "Bot war nicht aktiv"}


@router.get("/status")
def status_bot():
    """
    Prüft, ob der Bot im Container läuft.
    """
    try:
        result = subprocess.run(
            ["docker", "exec", CONTAINER_NAME, "pgrep", "-f", PROCESS_NAME],
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            return {"status": "running"}
        else:
            return {"status": "stopped"}
    except subprocess.CalledProcessError as e:
        return {"error": f"Fehler bei Statusprüfung: {e}"}

@router.post("/bot/save")
def save_bot_job(job_id: str, data: dict):
    save_job(job_id, data)
    return {"message": f"Job {job_id} gespeichert"}

@router.get("/bot/load/{job_id}")
def load_bot_job(job_id: str):
    return load_job(job_id)

@router.get("/bot/jobs")
def get_all_jobs():
    return list_jobs()