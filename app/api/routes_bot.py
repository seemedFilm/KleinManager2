import docker
import logging
from fastapi.responses import StreamingResponse
import subprocess
from fastapi import APIRouter, WebSocket
import threading
import asyncio

router = APIRouter()
client = docker.from_env()
log = logging.getLogger(" routes_bot ")

active_sockets = set()


def stream_logs(container):
    """Liest Container-Logs und broadcastet an alle WebSockets."""
    try:
        log.info(f"[BOT-info] Starte Log-Streaming für Container: {container.name}")
        log.debug(f"[BOT-debug] Starte Log-Streaming für Container: {container.name}")
        for line in container.logs(stream=True, follow=True):
            decoded = line.decode("utf-8").rstrip()
            log.info(f"[BOT] {decoded}")
            log.debug(f"Broadcasting to {len(active_sockets)} sockets")
    except Exception as e:
        log.error(f"Log-Streaming beendet: {e}")

@router.post("/bot/publish")
def start_bot():
    try:
        log.info("Starting existing container 'kleinbot'...")
        container = client.containers.get("kleinbot")
        container.start()

        # Logs in separatem Thread streamen
        threading.Thread(
            target=stream_logs,
            args=(container,),
            daemon=True
        ).start()

        return {"status": "started", "id": container.id}
    except Exception as e:
        log.error(f"Fehler beim Starten: {e}")
        return {"error": str(e)}


@router.websocket("/bot/logs")
async def bot_logs(websocket: WebSocket):
    await websocket.accept()
    active_sockets.add(websocket)
    try:
        while True:
            await websocket.receive_text()  # blockiert, hält Verbindung offen
    except Exception:
        pass
    finally:
        active_sockets.remove(websocket)


@router.post("/stop")
def stop_bot():
    try:
        subprocess.run(["docker", "exec", "kleinbot", "pkill", "-f", "main.py"], check=True)
        return {"status": "Bot gestoppt"}
    except Exception as e:
        return {"error": str(e)}

@router.get("/status")
def status_bot():
    try:
        result = subprocess.run(["docker", "exec", "kleinbot", "pgrep", "-f", "main.py"], capture_output=True)
        if result.returncode == 0:
            return {"status": "running"}
        return {"status": "stopped"}
    except Exception as e:
        return {"error": str(e)}
