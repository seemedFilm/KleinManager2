import docker
import logging
from fastapi import APIRouter
import threading

router = APIRouter()
client = docker.from_env()
log = logging.getLogger("app")

active_sockets = set()

@router.post("/bot/publish")
def start_bot():
    try:
        log.info("Starting existing container 'kleinbot'...")
        container = client.containers.get("kleinbot")
        container.start()

        threading.Thread(
            target=stream_logs,
            args=(container,),
            daemon=True
        ).start()

        return {"status": "started", "id": container.id}
    except Exception as e:
        log.error(f"Fehler beim Starten: {e}")
        return {"error": str(e)}

def stream_logs(container):
    try:
        log.info(f"Starte Log-Streaming für Container: {container.name}")
        
        for line in container.logs(stream=True, follow=True):
            decoded = line.decode("utf-8").rstrip()
            log.info(f"{decoded}")
    except Exception as e:
        log.error(f"Log-Streaming beendet: {e}")
