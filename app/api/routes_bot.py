import docker
import os
import time
from fastapi import APIRouter, WebSocket, Body
from dotenv import load_dotenv


router = APIRouter()
client = docker.from_env()
log_threads = {}
load_dotenv()
active_sockets = set()

# default parameter for kleinanzeigen-bot
kaparameter = ["--help"]

def require_env(key: str) -> str:
    value = os.getenv(key)
    if not value:
        print(f"require_env: {key} = {value}")
    return value

router = APIRouter()
client = docker.from_env()

# @router.post("/bot/publish")
# def start_container(kaparameter: str = Body(..., embed=True)):
#     print(f"KA-Parameter: {kaparameter}")
#     print("Starte Container 'kleinbot'...")

#     # Existierenden Container entfernen
#     existing = [c for c in client.containers.list(all=True) if c.name == "kleinbot"]
#     if existing:
#         print("Vorherigen Container gefunden – entferne ihn...")
#         existing[0].remove(force=True)

#     # Container starten (Umgebung + VNC)
#     container = client.containers.run(
#         image="kleinbot:cookie",
#         name="kleinbot",
#         shm_size="1g",
#         environment={
#             "DISPLAY": ":0",
#             "LOGGING_ENABLE": "TRUE",
#             "CHROMIUM_PROFILE": "/mnt/data/cache",
#         },
#         volumes={
#             "/docker/klein/shared/ads": {"bind": "/mnt/data/ads", "mode": "rw"},
#             "/docker/klein/shared/ads/pics": {"bind": "/mnt/data/ads/pics", "mode": "rw"},
#             "/docker/klein/bot/data": {"bind": "/mnt/data", "mode": "rw"},
#         },
#         ports={"6080/tcp": 6080, "5900/tcp": 5900},
#         detach=True,
#         tty=True,
#         stdin_open=True
#     )

#     print(f"Container gestartet: {container.short_id}")
#     return {"status": "running", "container_id": container.short_id}


# @router.post("/bot/runCommand")
# def run_command():
#     print("Starte den Kleinanzeigen-Bot-Prozess...")

#     try:
#         container = client.containers.get("kleinbot")
#     except docker.errors.NotFound:
#         return {"error": "Container 'kleinbot' läuft nicht."}

#     exec_result = container.exec_run(
#         cmd="/opt/kleinanzeigen-bot --config=/mnt/data/config.yaml verify",
#         user="pwuser",
#         detach=True
#     )

#     print(f"Bot gestartet (exec ID: {getattr(exec_result, 'id', 'N/A')})")
#     return {"status": "executed", "exec_id": getattr(exec_result, 'id', 'N/A')}


# @router.post("/bot/stop")
# def stop_container():
#     print("Stoppe Container 'kleinbot'...")

#     try:
#         container = client.containers.get("kleinbot")
#         container.stop()
#         container.remove()
#         return {"status": "stopped"}
#     except docker.errors.NotFound:
#         return {"error": "Container 'kleinbot' existiert nicht."}


@router.post("/bot/start")
def start_container(kaparameter: str = Body(..., embed=True)):
    print(f"KA-Parameter: {kaparameter}")
    print("Starte Container 'kleinbot'...")

    # Existierenden Container entfernen
    existing = [c for c in client.containers.list(all=True) if c.name == "kleinbot"]
    if existing:
        print("Vorherigen Container gefunden â€“ entferne ihn...")
        existing[0].remove(force=True)

    # Container starten (Umgebung + VNC)
    container = client.containers.run(
        image="kleinbot:cookie",
        name="kleinbot",
        shm_size="1g",
        environment={
            "DISPLAY": ":0",
            "LOGGING_ENABLE": "TRUE",
            "CHROMIUM_PROFILE": "/mnt/data/cache",
        },
        volumes={
            "/docker/klein/shared/ads": {"bind": "/mnt/data/ads", "mode": "rw"},
            "/docker/klein/shared/ads/pics": {"bind": "/mnt/data/ads/pics", "mode": "rw"},
            "/docker/klein/bot/data": {"bind": "/mnt/data", "mode": "rw"},
        },
        ports={"6080/tcp": 6080, "5900/tcp": 5900},
        detach=True,
        tty=True,
        stdin_open=True
    )

    print(f"Container gestartet: {container.short_id}")
    return {"status": "running", "container_id": container.short_id}


@router.post("/bot/runCommand")
def run_command():
    print("Starte den Kleinanzeigen-Bot-Prozess...")

    try:
        container = client.containers.get("kleinbot")
    except docker.errors.NotFound:
        return {"error": "Container 'kleinbot' lÃ¤uft nicht."}

    exec_result = container.exec_run(
        cmd="/opt/kleinanzeigen-bot --config=/mnt/data/config.yaml verify",
        user="pwuser",
        detach=True
    )

    print(f"Bot gestartet (exec ID: {getattr(exec_result, 'id', 'N/A')})")
    return {"status": "executed", "exec_id": getattr(exec_result, 'id', 'N/A')}


@router.post("/bot/stop")
def stop_container():
    print("Stoppe Container 'kleinbot'...")

    try:
        container = client.containers.get("kleinbot")
        container.stop()
        container.remove()
        return {"status": "stopped"}
    except docker.errors.NotFound:
        return {"error": "Container 'kleinbot' existiert nicht."}
