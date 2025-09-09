from fastapi import APIRouter
import subprocess

router = APIRouter(prefix="/bot", tags=["Bot"])

CONTAINER_NAME = "kleinbot"
PROCESS_NAME = "main.py"  # Skriptname des Bots innerhalb des kleinbot-Containers

@router.post("/start")
def start_bot():
    """
    Startet im Hintergrund: docker exec -d kleinbot python main.py
    """
    try:
        subprocess.run(
            ["docker", "exec", "-d", CONTAINER_NAME, "python", PROCESS_NAME],
            check=True,
            capture_output=True,
            text=True
        )
        return {"status": "started"}
    except subprocess.CalledProcessError as e:
        return {"error": f"Fehler beim Starten: {e.stderr or e}"}

@router.post("/stop")
def stop_bot():
    """
    Stoppt Bot-Prozess im Container (pkill -f main.py).
    """
    try:
        subprocess.run(
            ["docker", "exec", CONTAINER_NAME, "pkill", "-f", PROCESS_NAME],
            check=True,
            capture_output=True,
            text=True
        )
        return {"status": "stopped"}
    except subprocess.CalledProcessError as e:
        # pkill liefert non-zero wenn nichts gefunden wurde
        return {"status": "not-running", "detail": (e.stderr or str(e))}

@router.get("/status")
def status_bot():
    """
    Prüft per pgrep, ob der Prozess läuft.
    """
    try:
        result = subprocess.run(
            ["docker", "exec", CONTAINER_NAME, "pgrep", "-f", PROCESS_NAME],
            capture_output=True,
            text=True
        )
        if result.returncode == 0 and result.stdout.strip():
            return {"status": "running", "pids": result.stdout.strip().splitlines()}
        else:
            return {"status": "stopped"}
    except subprocess.CalledProcessError as e:
        return {"error": f"Fehler bei Statusprüfung: {e}"}
