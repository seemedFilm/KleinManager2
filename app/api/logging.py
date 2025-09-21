import logging
import logging.config
import json
import os
from fastapi import APIRouter, Body

router = APIRouter()

SETTINGS_FILE = "/app/data/settings.json"

# -----------------------------------
# Default Logging Config
# -----------------------------------
default_logging_config = {
    "version": 1,
    "disable_existing_loggers": False,  # wichtig: andere Logger bleiben aktiv
    "formatters": {
        "default": {
            "format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "default",
            "level": "DEBUG",
        },
        "file": {
            "class": "logging.FileHandler",
            "formatter": "default",
            "filename": "/app/data/app.log",
            "level": "DEBUG",
        },
    },
    "loggers": {
        "app": {
            "handlers": ["console", "file"],
            "level": "DEBUG",
            "propagate": False,  # nur einmal schreiben
        },
    },
    # Root schreibt auch in console + file → für uvicorn/docker/etc.
    "root": {
        "handlers": ["console", "file"],
        "level": "INFO",
    },
}

def load_logging_config():
    print("Lade Logging-Konfiguration...")

    # Root-Logger bereinigen (entfernt den Uvicorn-Handler)
    root_logger = logging.getLogger()
    if root_logger.hasHandlers():
        print(f"Vor Cleanup root.handlers: {root_logger.handlers}")
        for h in root_logger.handlers[:]:
            root_logger.removeHandler(h)
        print(f"Root-Handler bereinigt. Nach bereinigung: {root_logger.handlers}")

    logging_config = default_logging_config

    if os.path.exists(SETTINGS_FILE):
        try:
            with open(SETTINGS_FILE, "r") as f:
                settings = json.load(f)
            logging_config = settings.get("logging", default_logging_config)
            if "loggers" in logging_config and "app" in logging_config["loggers"]:
                logging_config["loggers"]["app"]["propagate"] = False
        except Exception as e:
            print(f"Fehler beim Laden von settings.json, fallback auf default logging: {e}")
            logging_config = default_logging_config

    # Root explizit leer halten
    logging_config["root"]["handlers"] = []

    logging.config.dictConfig(logging_config)

    # Docker/urllib3 Logs stiller machen
        # Docker/urllib3 Logs -> an deine Handler hängen
    for noisy in ("docker", "urllib3"):
        noisy_logger = logging.getLogger(noisy)
        noisy_logger.handlers.clear()         # Root-Handler löschen
        noisy_logger.setLevel(logging.DEBUG)  # oder WARNING, wenn weniger gewünscht
        noisy_logger.propagate = True         # sorgt dafür, dass sie bei Root durchlaufen


    log = logging.getLogger("app")
    log.propagate = False
    return log



# Initialisiere globalen Logger
log = load_logging_config()

# -----------------------------------
# API: Frontend Logs
# -----------------------------------
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


# -----------------------------------
# Logging-Level APIs
# -----------------------------------
@router.get("/logging_level")
async def get_logging_level():
    level = logging.getLevelName(log.level)
    return {"level": level}


@router.post("/logging_level")
async def set_logging_level(level: str = Body(..., embed=True)):
    numeric_level = getattr(logging, level.upper(), None)
    if numeric_level is None:
        return {"error": f"Ungültiger Logging-Level: {level}"}
    log.setLevel(numeric_level)

    # auch in settings.json speichern
    if os.path.exists(SETTINGS_FILE):
        with open(SETTINGS_FILE, "r") as f:
            settings = json.load(f)
    else:
        settings = {}
    settings["logging"] = settings.get("logging", {})
    settings["logging"]["loggers"] = settings["logging"].get("loggers", {})
    settings["logging"]["loggers"]["app"] = settings["logging"]["loggers"].get("app", {})
    settings["logging"]["loggers"]["app"]["level"] = level.upper()
    with open(SETTINGS_FILE, "w") as f:
        json.dump(settings, f, indent=2)

    log.info(f"Logging-Level geändert auf {level.upper()}")
    return {"status": "ok", "level": level.upper()}
