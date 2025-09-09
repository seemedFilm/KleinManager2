from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

templates = Jinja2Templates(directory="templates")
router = APIRouter()

@router.get("/bot-ui", response_class=HTMLResponse)
def bot_ui(request: Request):
    return templates.TemplateResponse("bot.html", {"request": request})
