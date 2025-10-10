import os
import json
import logging
from nodriver.cdp.network import CookieParam

LOG = logging.getLogger(__name__)

async def import_cookies_and_localstorage(browser, page):
    cookie_file = os.environ.get("KLEINBOT_COOKIE")
    storage_file = os.environ.get("KLEINBOT_STORAGE")
    if not cookie_file or not os.path.exists(cookie_file):
        LOG.info("Keine Cookie-Datei gesetzt oder Datei nicht gefunden, normaler Login wird verwendet.")
        return
    if not storage_file or not os.path.exists(storage_file):
        LOG.info("Keine Storage-Datei gesetzt oder Datei nicht gefunden, normaler Login wird verwendet.")
        return

    LOG.info("Lade Cookies aus: %s", cookie_file)
    try:
        with open(cookie_file, "r", encoding="utf-8") as f:
            cookies = json.load(f)

        params = []
        for cookie in cookies:
            try:
                cj = {
                    "name": cookie["name"],
                    "value": cookie["value"],
                    "domain": cookie.get("domain", ".kleinanzeigen.de"),
                    "path": cookie.get("path", "/"),
                }
                if "secure" in cookie:
                    cj["secure"] = bool(cookie["secure"])
                if "expires" in cookie:
                    try:
                        cj["expires"] = int(cookie["expires"])
                    except Exception:
                        pass

                params.append(CookieParam.from_json(cj))
            except Exception as e:
                LOG.warning("Cookie %s übersprungen: %s", cookie.get("name"), e)

        if params:
            await browser.cookies.set_all(cookies=params)
            LOG.info("Cookies erfolgreich importiert (%d Stück).", len(params))
        else:
            LOG.warning("Keine gültigen Cookies gefunden.")
    except Exception as e:
        LOG.error("Fehler beim Import der Cookies: %s", e)
    else:
        LOG.info("Keine Cookie-Datei gesetzt oder Datei nicht gefunden - überspringe Cookie-Import.")

 # ---- LOCAL STORAGE -----------------------------------------------------
    if storage_file and os.path.exists(storage_file):
        LOG.info("Lade LocalStorage aus: %s", storage_file)
        try:
            with open(storage_file, "r", encoding="utf-8") as f:
                storage_items = json.load(f)

            # LocalStorage-Schlüssel/Werte ins aktuelle Tab-Skript schreiben
            for key, value in storage_items.items():
                try:
                    # Werte sicher escapen (f für JS-String)
                    js = f"localStorage.setItem({json.dumps(key)}, {json.dumps(value)});"
                    await page.evaluate(js)
                except Exception as e:
                    LOG.warning("LocalStorage-Eintrag %s übersprungen: %s", key, e)

            LOG.info("LocalStorage erfolgreich importiert (%d Einträge).", len(storage_items))
        except Exception as e:
            LOG.error("Fehler beim Import des LocalStorage: %s", e)
    else:
        LOG.info("Keine LocalStorage-Datei gesetzt oder Datei nicht gefunden - überspringe LocalStorage-Import.")

    # Seite neu laden, damit alles aktiv wird
    await page.reload()
    LOG.info("Cookies und LocalStorage importiert und Seite neu geladen.")