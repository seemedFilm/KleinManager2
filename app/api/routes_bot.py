import docker
import os
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

@router.post("/bot/publish")
def run_bot(kaparameter: str = Body(..., embed=True)):
    print(f"KA-Parameter: {kaparameter}")
    print(f"Staring Container...")
    
    config = "--config=/mnt/data/config.yaml"    
    startparameter = config + " " + kaparameter
    print(f"startparametexxr: {startparameter}")    
    try:
        container = client.containers.run(
            image="kleinbot:cookie",
            command=startparameter,
            name="kleinbot",
            shm_size="1g",
            environment={
                "DISPLAY": ":0",
                # "KLEINBOT_NAME": "kleinbot",
                "LOGGING_ENABLE": "TRUE",
                "CHROMIUM_PROFILE": "/mnt/data/cache",
                # "KLEINBOT_COOKIE": "/mnt/data/kleinanzeigen_cookies.json",
                # "KLEINBOT_STORAGE": "/mnt/data/kleinanzeigen_localstorage.json",
            },
            volumes={
                "/docker/klein/shared/ads": {"bind": "/mnt/data/ads", "mode": "rw"},
                "/docker/klein/shared/ads/pics": {"bind": "/mnt/data/ads/pics", "mode": "rw"},
                "/docker/klein/bot/data": {"bind": "/mnt/data", "mode": "rw"},
            },
            ports={
                "6080/tcp": 6080,   # Zugriff über Browser (NoVNC)
                "5900/tcp": 5900,   # optional Zugriff per VNC-Client
            },
            detach=True,  # Container im Hintergrund starten
            tty=True,     # TTY aktivieren (wie -t)
            stdin_open=True  # Interaktive Eingabe (wie -i)
        )
       
       
        print(f"Stopping Container...")
        return {"status": "started", "id": container.id, "params": kaparameter}
    except Exception as e:
        return {"error": str(e)}


