import logging
from fastapi import APIRouter, Body

router = APIRouter()

@router.post("/logging_frontend")

async def frontend_log(message: str = Body(..., embed=True), level: str = Body("INFO")):
    """
    Nimmt Logs vom Frontend entgegen und schreibt sie ins Docker-Log
    """
    levels = {
        "DEBUG": logging.debug,
        "INFO": logging.info,
        "WARNING": logging.warning,
        "ERROR": logging.error,
        "CRITICAL": logging.critical,
    }
    log_func = levels.get(level.upper(), logging.info)
    log_func(f"{message}")
    return {"status": "ok"}
