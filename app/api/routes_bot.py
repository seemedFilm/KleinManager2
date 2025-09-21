import docker
import logging
import threading
import asyncio
from fastapi import APIRouter, WebSocket

router = APIRouter()
client = docker.from_env()
log = logging.getLogger("app")  # App-Logger aus logging.py

active_sockets = set()  # WebSockets für Live-Logs


# ----------------------------
# Bot starten
# ----------------------------
@router.post("/bot/publish")
def start_bot():
    try:
        log.info("Starte vorhandenen Container 'kleinbot'...")
        container = client.containers.get("kleinbot")

        # Nur starten, wenn er gestoppt ist
        if container.status != "running":
            container.start()
            log.info(f"Container '{container.name}' gestartet.")

        # Log-Streaming in eigenem Thread
        threading.Thread(target=stream_logs, args=(container,), daemon=True).start()

        return {"status": "started", "id": container.id}

    except docker.errors.NotFound:
        log.error("Container 'kleinbot' existiert nicht!")
        return {"error": "Container 'kleinbot' existiert nicht."}
    except Exception as e:
        log.error(f"Fehler beim Starten: {e}")
        return {"error": str(e)}


# ----------------------------
# Log-Streaming
# ----------------------------
def stream_logs(container):
    try:
        log.info(f"Starte Log-Streaming für Container: {container.name}")

        for line in container.logs(stream=True, follow=True):
            decoded = line.decode("utf-8").rstrip()
            log.info(decoded)  # einmaliger Eintrag


            # an alle WebSockets senden
            asyncio.run(broadcast_to_sockets(decoded))

    except Exception as e:
        log.error(f"Log-Streaming beendet: {e}")


# ----------------------------
# WebSocket für Live-Logs
# ----------------------------
@router.websocket("/bot/logs")
async def bot_logs(websocket: WebSocket):
    await websocket.accept()
    active_sockets.add(websocket)
    try:
        while True:
            await websocket.receive_text()  # hält Verbindung offen
    except Exception:
        pass
    finally:
        active_sockets.remove(websocket)


async def broadcast_to_sockets(message: str):
    disconnected = set()
    for ws in active_sockets:
        try:
            await ws.send_text(message)
        except Exception:
            disconnected.add(ws)
    active_sockets.difference_update(disconnected)


# ----------------------------
# Bot stoppen
# ----------------------------
@router.post("/bot/stop")
def stop_bot():
    try:
        container = client.containers.get("kleinbot")
        if container.status == "running":
            container.stop()
            log.info(f"Container '{container.name}' gestoppt.")
        else:
            log.info(f"Container '{container.name}' ist bereits gestoppt.")
        return {"status": "Bot gestoppt"}
    except Exception as e:
        log.error(f"Fehler beim Stoppen: {e}")
        return {"error": str(e)}


# ----------------------------
# Bot-Status
# ----------------------------
@router.get("/bot/status")
def status_bot():
    try:
        container = client.containers.get("kleinbot")
        return {"status": container.status}
    except docker.errors.NotFound:
        return {"status": "not found"}
    except Exception as e:
        log.error(f"Fehler beim Abrufen des Status: {e}")
        return {"error": str(e)}
