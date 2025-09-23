import docker
import threading
import os
from fastapi import APIRouter, WebSocket, Body


router = APIRouter()
client = docker.from_env()
# Merker, ob wir schon einen Stream-Thread laufen haben
log_threads = {}

active_sockets = set()


# @router.post("/bot/publish")
# def start_bot():
#     try:
#         print("▶ Starte Container 'kleinbot'...")
#         container = client.containers.get("kleinbot")
#         container.start()
       

#         return {"status": "started", "id": container.id}
#     except Exception as e:
#         print(f"❌ Fehler beim Starten: {e}")
#         return {"error": str(e)}

@router.post("/bot/publish")
def run_bot(kaparameter: str = Body(..., embed=True)):

    print(f"KA Parameter: {kaparameter}")
    print(f"Staring Container...")
    try:
        container = client.containers.run(
            "second-hand-friends/kleinanzeigen-bot:latest",
            command=kaparameter,   # <-- dynamische Parameter
            detach=True,
            tty=True,
            stdin_open=True,
            shm_size="256m",
            environment={"DISPLAY": ":0"},
            volumes={
                os.environ.get("SHARED_ADS"): {"bind": "/mnt/data/ads", "mode": "rw"},
                os.environ.get("KLEINBOT_DATA"): {"bind": "/mnt/data", "mode": "rw"},
                
                },
            remove=False
        )

        return {"status": "started", "id": container.id, "params": params}
    except Exception as e:
        return {"error": str(e)}


