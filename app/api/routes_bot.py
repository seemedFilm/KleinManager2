import docker
import logging
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import subprocess

router = APIRouter()
client = docker.from_env()
log = logging.getLogger(" routes_bot ")

@router.post("/bot/publish")
def start_bot():
    try:
        log.info("Starting bot container...")
        container = client.containers.run(
            "ghcr.io/second-hand-friends/kleinanzeigen-bot:latest",
            command=["publish"],
            detach=True,
            name="kleinbot",
            volumes={"/docker/klein/manager/data": {"bind": "/mnt/data", "mode": "rw"}},
        )
        return {"status": "started", "id": container.id}
    except Exception as e:
        return {"error": str(e)}

@router.get("/bot/log")
def stream_logs():
    try:
        container = client.containers.get("kleinbot")

        def event_stream():
            for line in container.logs(stream=True, follow=True):
                yield f"data: {line.decode('utf-8').rstrip()}\n\n"

        return StreamingResponse(event_stream(), media_type="text/event-stream")

    except Exception as e:
        def error_stream():
            yield f"data: Fehler beim Streamen der Logs: {str(e)}\n\n"
        return StreamingResponse(error_stream(), media_type="text/event-stream")
    

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
