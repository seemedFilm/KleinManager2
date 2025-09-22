import logging
import logging.config
import json
import os
from fastapi import APIRouter, Body

router = APIRouter()
SETTINGS_FILE = "/app/data/settings.json"

# ----------------------------
# Default Logging-Konfiguration
# ----------------------------
default_logging_config = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        }
    },
    "handlers": {
        "console": {"class": "logging.StreamHandler", "formatter": "default", "level": "DEBUG"},
        "file": {"class": "logging.FileHandler", "formatter": "default", "filename": "/app/data/app.log", "level": "DEBUG"},
    },
    "loggers": {
        "app": {
            "handlers": ["console", "file"],
            "level": "DEBUG",
            "propagate": False,  # ✅ verhindert doppelte Logs
        }
    },
    "root": {
        "level": "WARNING",
        "handlers": []  # keine Handler auf Root, damit keine Doppelungen
    }
}

# ----------------------------
# Logging-Konfiguration laden
# ----------------------------
def load_logging_config():
    logging_config = default_logging_config

    # settings.json einlesen, falls vorhanden
    if os.path.exists(SETTINGS_FILE):
        try:
            with open(SETTINGS_FILE, "r") as f:
                settings = json.load(f)
            logging_config = settings.get("logging", default_logging_config)
            # Propagation für 'app' Logger sicherstellen
            if "loggers" in logging_config and "app" in logging_config["loggers"]:
                logging_config["loggers"]["app"]["propagate"] = False
        except Exception as e:
            print(f"Fehler beim Laden von settings.json, fallback auf default logging: {e}")

    # Root-Logger bereinigen
    root_logger = logging.getLogger()
    if root_logger.hasHandlers():
        for h in root_logger.handlers[:]:
            root_logger.removeHandler(h)
    print(f"Bereinige Root-Logger Handler: {root_logger.handlers}")
    if not hasattr(logging, "_LOGGING_INITIALIZED"):
        logging.config.dictConfig(logging_config)
        logging._LOGGING_INITIALIZED = True


    # Docker / urllib3 Logger auf WARNING setzen
    for logger_name in ["docker", "urllib3"]:
        l = logging.getLogger(logger_name)
        l.propagate = False
        l.handlers.clear()
        l.setLevel(logging.WARNING)

    log = logging.getLogger("app")
    return log


# ----------------------------
# Globaler Logger
# ----------------------------
log = load_logging_config()


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


# ----------------------------
# Logging-Level APIs
# ----------------------------
@router.get("/logging_level")
async def get_logging_level():
    return {"level": logging.getLevelName(log.level)}


@router.post("/logging_level")
async def set_logging_level(level: str = Body(..., embed=True)):
    numeric_level = getattr(logging, level.upper(), None)
    if numeric_level is None:
        return {"error": f"Ungültiger Logging-Level: {level}"}

    log.setLevel(numeric_level)

    # In settings.json speichern
    settings = {}
    if os.path.exists(SETTINGS_FILE):
        with open(SETTINGS_FILE, "r") as f:
            settings = json.load(f)

    settings["logging"] = settings.get("logging", {})
    settings["logging"]["loggers"] = settings["logging"].get("loggers", {})
    settings["logging"]["loggers"]["app"] = settings["logging"]["loggers"].get("app", {})
    settings["logging"]["loggers"]["app"]["level"] = level.upper()

    with open(SETTINGS_FILE, "w") as f:
        json.dump(settings, f, indent=2)

    log.info(f"Logging-Level geändert auf {level.upper()}")
    return {"status": "ok", "level": level.upper()}
