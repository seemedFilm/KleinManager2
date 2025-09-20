import docker
from fastapi import APIRouter
import subprocess

router = APIRouter()
client = docker.from_env()

@router.post("/bot/publish")
def start_bot():
    try:       
        print("bot publishing")
        container = client.containers.get("kleinbot")
        exit_code, output = container.exec_run("python main.py verify")
        return {"status": "done", "output": output.decode()}
    except Exception as e:
        return {"error": str(e)}
    

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
