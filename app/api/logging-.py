import logging
import logging.config
import os
import json
from fastapi import APIRouter, Body

router = APIRouter()

SETTINGS_FILE = "/app/data/settings.json"

# Flag, damit Logging nur einmal initialisiert wird
_LOGGING_INITIALIZED = False

# ----------------------------
# Default Logging-Konfiguration
# ----------------------------
default_logging_config = {
    "version": 1,
    "disable_existing_loggers": False,  # wichtig: bestehende Loggers nicht abschalten
    "formatters": {
        "default": {
            "format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "default",
            "level": "DEBUG",
        },
    },
    "loggers": {
        "app": {
            "handlers": ["console"],
            "level": "DEBUG",
            "propagate": False,   # wichtig: NICHT zum Root-Logger weiterleiten
        }
    },
    "root": {
        "level": "WARNING",
        "handlers": []  # Root bleibt leer, damit keine Doppel-Logs kommen
    }
}


# ----------------------------
# Logging-Konfiguration laden
# ----------------------------
def load_logging_config():
    global _LOGGING_INITIALIZED
    if _LOGGING_INITIALIZED:
        return logging.getLogger("app")

    logging_config = default_logging_config

    if os.path.exists(SETTINGS_FILE):
        try:
            with open(SETTINGS_FILE, "r") as f:
                settings = json.load(f)
            if "logging" in settings:
                logging_config = settings["logging"]
        except Exception as e:
            print(f"⚠ Fehler beim Laden von settings.json: {e}, nutze Defaults")

    # Root-Handler bereinigen (falls uvicorn schon welche gesetzt hat)
    root_logger = logging.getLogger()
    for h in root_logger.handlers[:]:
        root_logger.removeHandler(h)

    logging.config.dictConfig(logging_config)

    # Docker/urllib3 Logs ruhigstellen
    for noisy in ["docker", "urllib3"]:
        noisy_logger = logging.getLogger(noisy)
        noisy_logger.handlers.clear()
        noisy_logger.setLevel(logging.WARNING)
        noisy_logger.propagate = False

    _LOGGING_INITIALIZED = True
    log = logging.getLogger("app")
    log.info("✅ Logging initialisiert")
    return log

if os.getenv("RUN_MAIN") == "true":
    # Nur im Worker Prozess initialisieren
    log = load_logging_config()
else:
    log = logging.getLogger("app")


# ----------------------------
# API: Frontend Logs
# ----------------------------
@router.post("/logging_frontend")
async def frontend_log(message: str = Body(..., embed=True), level: str = Body("INFO")):
    levels = {
        "DEBUG": log.debug,
        "INFO": log.info,
        "WARNING": log.warning,
        "ERROR": log.error,
        "CRITICAL": log.critical,
    }
    log_func = levels.get(level.upper(), log.info)
    log_func(f"[FRONTEND] {message}")
    return {"status": "ok"}
