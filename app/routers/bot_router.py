from fastapi import APIRouter
import subprocess

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
