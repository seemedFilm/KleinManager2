
function setStatus(msg) {
    const logBox = document.getElementById("kabotLog");
    if (logBox) logBox.textContent = msg;
    console.log(msg);
}

function appendLog(msg) {
    const logBox = document.getElementById("kabotLog");
    if (logBox) {
        const time = new Date().toLocaleTimeString();
        logBox.textContent += `\n[${time}] ${msg}`;
        logBox.scrollTop = logBox.scrollHeight;
    }
    console.log(msg);
}
class KleinanzeigenManager extends KleinManagerCore {
    constructor() {
        super();
        this.adsFiles = [];

    }


    async getKAParameter() {
        const res = await fetch("/api/v1/logging_level");
        const data = await res.json();
        return data.kaparameter;
    }

    async setKAParameter(kaparameter) {
        await fetch("/api/v1/logging_level", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ kaparameter }),
        });
        console.log("KaBot Parameter", kaparameter);
    }

    async refreshAds(htmlElementId = "dummy") {
        try {
            setStatus("Reloading Ads...");

            // ✅ richtiger HTTP-Methodentyp:
            const response = await fetch(`/api/v1/ads/files`, { method: "GET" });

            // ✅ JSON auslesen:
            const data = await response.json();

            // ✅ Konsolen-Output prüfen:
            setStatus(`Response JSON: ${data}`);

             // ✅ Zugriff auf einzelne Werte:
            if (data.files && data.files.length > 0) {
                const firstFile = data.files[0];
                setStatus(`Gefundene Datei: ${firstFile}`);
                console.log("Erste Datei:", firstFile);
            } else {
                setStatus("Keine Dateien gefunden.");
            }
            const container = document.getElementById("adsFileContainer");
            container.innerHTML = "";

            data.files.forEach(file => {
                const el = document.createElement("div");
                el.textContent = file;
                el.className = "p-2 bg-gray-700 text-white rounded";
                container.appendChild(el);
            });

        //    this.apiRequest("/ads/files");
        }
        catch (error) {
        }
    }

    async startContainer(htmlElementId = "dummy") {
        setStatus("Starting container ...");

        try {
            const response = await fetch(`/api/v1/bot/start`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },                
            });

            const data = await response.json();
            if (data.error) {
                setStatus(`Error: ${data.error}`);
            } else {
                setStatus(`Container started (ID: ${data.container_id || "?"})`);
                appendLog("Container started.");
            }
        } catch (err) {
            setStatus(`Error: ${err}`);
        }
    }
    
    async runBotCommand() {
        setStatus("Starting Kleinanzeigen-Bot ...");

        try {
            let kaparameter = document.getElementById("KaBotParameter").value;

            const response = await fetch(`/api/v1/bot/runCommand`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ kaparameter: kaparameter }),
            });
              const data = await response.json();

        if (data.error) {
            setStatus(`Error: ${data.error}`);
        } else {
            setStatus(`✅ Bot started.`);
            appendLog(data.output || "No logs received.");
        }
    } catch (err) {
        setStatus(`Error: ${err}`);
    }
}
async stopCommand() {
        setStatus("Stopping container...");
        try {
            
            const response = await fetch(`/api/v1/bot/stopCommand`, { 
                method: "POST" },
            );
            const data = await response.json();

            if (data.error) {
                setStatus(`Error: ${data.error}`);
            } else {
                setStatus("Command stopped.");
                appendLog("Command stopped.");
            }
        } catch (err) {
            setStatus(`Error: ${err}`);
        }
    }
}