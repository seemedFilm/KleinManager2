import os
import json

DATA_DIR = "/app/ads"
os.makedirs(DATA_DIR, exist_ok=True)  # sicherstellen, dass der Ordner existiert

def save_job(job_id: str, data: dict):
    """Speichert ein Job-JSON unter ads."""
    file_path = os.path.join(DATA_DIR, f"{job_id}.json")
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def load_job(job_id: str) -> dict:
    """Lädt ein gespeichertes Job-JSON."""
    file_path = os.path.join(DATA_DIR, f"{job_id}.json")
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Job {job_id} existiert nicht")
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)

def list_jobs() -> list[str]:
    """Listet alle gespeicherten JSON-Dateien auf."""
    return [f for f in os.listdir(DATA_DIR) if f.endswith(".json")]
