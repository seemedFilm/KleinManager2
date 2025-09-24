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
        # raise RuntimeError(f"Umgebungsvariable {key} fehlt in .env")
    return value

@router.post("/bot/publish")
def run_bot(kaparameter: str = Body(..., embed=True)):
    print(f"KA Parameter: {kaparameter}")
    print(f"Staring Container...")
    # print("KLEINBOT_DATA =", os.environ.get("KLEINBOT_DATA"))
    
    try:
        container = client.containers.run(
            "second-hand-friends/kleinanzeigen-bot:latest",
            command=kaparameter,        # dynamische Parameter
            name=require_env("KLEINBOT_NAME"),
            detach=True,
            tty=True,
            stdin_open=True,
            shm_size="256m",
            environment={
                "DISPLAY": require_env("X11_DISPLAY"),
                "KLEINBOT_NAME": require_env("KLEINBOT_NAME"),
                "KLEINBOT_LOGS": require_env("KLEINBOT_LOGS"),
                "KLEINBOT_DATA": require_env("KLEINBOT_DATA"),
                "KLEINBOT_CACHE": require_env("KLEINBOT_CACHE"),
                "SHARED_ADS": require_env("SHARED_ADS"),
                "SHARED_PIC": require_env("SHARED_PIC"),
            },
            volumes={
                require_env("SHARED_ADS"): {"bind": "/mnt/data/ads", "mode": "rw"},
                require_env("SHARED_PIC"): {"bind": "/mnt/data/ads/pics", "mode": "rw"},
                require_env("KLEINBOT_CACHE"): {"bind": "/mnt/data/cache", "mode": "rw"},
                require_env("KLEINBOT_LOGS"): {"bind": "/mnt/data/logs", "mode": "rw"},
                require_env("KLEINBOT_DATA"): {"bind": "/mnt/data", "mode": "rw"},
            },
            remove=False
        )
        print(f"Stopping Container...")
        return {"status": "started", "id": container.id, "params": kaparameter}

    except Exception as e:
        return {"error": str(e)}


