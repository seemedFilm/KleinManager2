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
    #print(f"require_env: {key} = {value}")
    if not value:
        print(f"require_env: {key} = {value}")
        # raise RuntimeError(f"Umgebungsvariable {key} fehlt in .env")
    return value

@router.post("/bot/publish")
def run_bot(kaparameter: str = Body(..., embed=True)):
    print(f"KA Parameter: {kaparameter}")
    print(f"Staring Container...")
        
    #conts = client.containers.list(all=True) #, filters={"ancestor": "second-hand-friends/kleinanzeigen-bot:latest"})
    #for c in conts:
    #    if "KLEINBOT_NAME" in c.name:
    #        print(f"Found existing container with name {c.name}")
    #        c.remove(force=True)
    try:
        container = client.containers.run(
            "second-hand-friends/kleinanzeigen-bot:latest",
            command=kaparameter,        # dynamische Parameter
            #name="KLEINBOT_NAME",
            # detach=True,
            # tty=True,
            # stdin_open=True,
            #user=1000,
            #pid_mode (str): If set to ``host``, use the host PID namespace inside the container.
            #pids_limit (int): Tune a container's pids limit. Set ``-1`` for unlimited.pids_limit
            #user (str or int): Username or UID to run commands as inside the container.
            shm_size="256m",
            environment={ 
                "DISPLAY": require_env("X11_DISPLAY"), 
                "KLEINBOTNAME": require_env("KLEINBOT_NAME"), 
                "KLEINBOTLOGS": require_env("KLEINBOT_LOGS"), 
                "KLEINBOTDATA": require_env("KLEINBOT_DATA"), 
                "KLEINBOTCACHE": require_env("KLEINBOT_CACHE"), 
                "SHAREDADS": require_env("SHARED_ADS"), 
                "SHAREDPIC": require_env("SHARED_PIC"),
                "HEADLESS": "True", 
                "NO_SANDBOX": "True"
                },
            volumes={
                "/docker/klein/shared/ads": {"bind": "/mnt/data/ads", "mode": "rw"},
                "/docker/klein/bot/cache": {"bind": "/mnt/data/cache", "mode": "rw"},
                "/docker/klein/bot/data": {"bind": "/mnt/data", "mode": "rw"},
               
            },  
            remove=False
        )
        print(f"Stopping Container...")
        return {"status": "started", "id": container.id, "params": kaparameter}
    except Exception as e:
        return {"error": str(e)}


