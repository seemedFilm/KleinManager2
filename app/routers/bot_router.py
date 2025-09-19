from fastapi import APIRouter, Body
import subprocess
from pathlib import Path
import logging

router = APIRouter(prefix="/bot", tags=["bot"])

ADS_FOLDER = Path("/app/ads")  # Wo KleinManager die JSON-Dateien speichert

@router.post("/start")
def start_bot(config_file: str = Body(..., embed=True)):
    json_path = ADS_FOLDER / config_file
    if not json_path.exists():
        return {"error": f"Datei {config_file} existiert nicht!"}

    try:
        # Container starten mit Parameter "publish" und ausgewählter JSON-Datei
        subprocess.run([
            "docker", "run", "--rm", "-v",
            f"{ADS_FOLDER}:/mnt/data",
            "kleinbot:latest",
            "python", "main.py",
            "--publish", f"/mnt/data/{config_file}"
        ], check=True)

        logging.info(f"Kleinbot gestartet mit Datei {config_file}")
        return {"status": f"Kleinbot gestartet mit {config_file}"}
    except subprocess.CalledProcessError as e:
        logging.error(f"Fehler beim Starten von Kleinbot: {e}")
        return {"error": str(e)}
