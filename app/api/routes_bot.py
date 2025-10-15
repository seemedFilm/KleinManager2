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

def require_env(key: str) -> str:
    value = os.getenv(key)
    if not value:
        print(f"require_env: {key} = {value}")
    return value

router = APIRouter()
client = docker.from_env()
shared_ads = os.getenv("SHARED_ADS", "unknown")
shared_pics = os.getenv("SHARED_PIC", "unknown")
kleinbot_data = os.getenv("KLEINBOT_DATA", "unknown")
kleinbot_name = os.getenv("KLEINBOT_NAME", "unknown")

@router.post("/bot/start")
def start_container():

    existing = [c for c in client.containers.list(all=True) if c.name == kleinbot_name]
    if existing:
        print("Found existing container, deleting it...")
        existing[0].remove(force=True)

    container = client.containers.run(
        image="kleinbot:cookie",
        name=kleinbot_name,
        shm_size="1g",
        environment={
            "DISPLAY": ":0",
            "LOGGING_ENABLE": "TRUE",
            "CHROMIUM_PROFILE": "/mnt/data/cache",
        },
        volumes={
            shared_ads: {"bind": "/mnt/data/ads", "mode": "rw"},
            shared_pics: {"bind": "/mnt/data/ads/pics", "mode": "rw"},
            kleinbot_data: {"bind": "/mnt/data", "mode": "rw"},
        },
        ports={
            "6080/tcp": 6080, 
            "5900/tcp": 5900
            },
        detach=True,
        tty=True,
        stdin_open=True
    )

    print(f"Container started: {container.short_id}")
    return {"status": "running", "container_id": container.short_id}

@router.post("/bot/stop")
def stop_container():
    container = client.containers.get(kleinbot_name)
    result = container.stop()
    print(f"Stopping Resultcode: {result}")
    return {"status": "stopped", "container_id": container.short_id}

@router.post("/bot/runCommand")
def run_command():
    print("Running the bot command")

    try:
        container = client.containers.get(kleinbot_name)
    except docker.errors.NotFound:
        return {"error": f"Container {kleinbot_name} does not run"}

    exec_result = container.exec_run(
        cmd="/opt/kleinanzeigen-bot --config=/mnt/data/config.yaml verify",
        detach=False,
        stdout=True,
        stderr=True
    )
    output = exec_result.output.decode("utf-8", errors="ignore")
    print(f"=== BOT OUTPUT BEGIN ===\n")
    print(f"{output}\n")
    print(f"=== BOT OUTPUT END ===")
    return {"status": "executed", "output": output}

@router.post("/bot/stopCommand")
def stop_container():
    print("Stopping command ''...")
    try:
        container = client.containers.get(kleinbot_name)
        container.kill(signal="SIGINT")
        print("Stopping command! (CTRL+C)")
        return {"status": "interrupted"}
    except docker.errors.NotFound:
        return {"error": f"Container {kleinbot_name} not found."}
    except Exception as e:
        return {"error": str(e)}