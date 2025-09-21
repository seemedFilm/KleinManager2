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
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "default",
            "level": "DEBUG",
            "stream": "ext://sys.stdout",
        },
        "file": {
            "class": "logging.FileHandler",
            "formatter": "default",
            "level": "DEBUG",
            "filename": "/app/data/app.log",
        },
    },
    "root": {
        "level": "INFO",
        "handlers": ["console", "file"],  # Root-Logger schreibt in Console + File
    },
}

# ----------------------------
# Logging-Konfiguration laden
# ----------------------------
def load_logging_config():
    logging_config = default_logging_config

    # Root-Logger bereinigen, um doppelte Handler zu vermeiden
    root_logger = logging.getLogger()
    print(f"Vorherige Handler: {root_logger.handlers}")
    if root_logger.hasHandlers():
        for h in root_logger.handlers[:]:
            root_logger.removeHandler(h)
    print(f"Bereinigte Handler: {root_logger.handlers}")

    # Config laden
    logging.config.dictConfig(logging_config)
    logging.getLogger("docker").propagate = False
    logging.getLogger("urllib3").propagate = False
    logging.getLogger("docker").handlers.clear()
    logging.getLogger("urllib3").handlers.clear()


    # Docker / urllib3 auf WARNING setzen, keine Propagation
    # for name in ["docker", "urllib3"]:
    #     logger = logging.getLogger(name)
    #     logger.handlers.clear()
    #     logger.propagate = False
    #     logger.setLevel(logging.WARNING)

    return logging.getLogger("app")  # Optional: dedizierter App-Logger

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

    # Auch in settings.json speichern
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
