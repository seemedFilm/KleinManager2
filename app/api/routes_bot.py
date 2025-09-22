import docker
import threading
from fastapi import APIRouter, WebSocket


router = APIRouter()
client = docker.from_env()
# Merker, ob wir schon einen Stream-Thread laufen haben
log_threads = {}

active_sockets = set()


@router.post("/bot/publish")
def start_bot():
    try:
        print("▶ Starte Container 'kleinbot'...")
        container = client.containers.get("kleinbot")
        container.start()
       

        return {"status": "started", "id": container.id}
    except Exception as e:
        print(f"❌ Fehler beim Starten: {e}")
        return {"error": str(e)}

@router.post("/bot/publish")
def start_bot():
    try:
        container = client.containers.get("kleinbot")
        if container.status != "running":
            print(f"Starte Container 'kleinbot'...")
            container.start()
        else:
            print(f"Container 'kleinbot' läuft bereits.")

        return {"status": "started", "id": container.id}
    except Exception as e:
        print(f"Fehler beim Starten: {e}")
        return {"error": str(e)}
