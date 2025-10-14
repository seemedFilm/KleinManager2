
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
            const container = document.getElementById("adsFileContainer");
            if (!container) return;

            setStatus("Reloading Ads...");
            const response = await fetch(`/api/v1/ads/files`, { method: "GET" });
            const data = await response.json();

            container.innerHTML = "";

            if (!data.files || data.files.length === 0) {
                container.innerHTML = "<p class='text-gray-400'>Keine Dateien gefunden.</p>";
                return;
            }

            data.files.forEach((file, index) => {
                const label = document.createElement("label");
                label.className = "flex items-center space-x-2 p-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-600";

                const radio = document.createElement("input");
                radio.type = "radio";
                radio.name = "adsFile";
                radio.value = file;
                if (index === 0) radio.checked = true;

                const span = document.createElement("span");
                span.textContent = file;

                label.appendChild(radio);
                label.appendChild(span);
                container.appendChild(label);
            });

            console.log("✅ Ads geladen:", data.files);

        } catch (error) {
            console.error("Fehler beim Laden der Dateien:", error);
            document.getElementById("adsFileContainer").innerHTML =
                "<p class='text-red-400'>Fehler beim Laden der Dateien.</p>";
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
        try {
            let kaparameter = document.getElementById("KaBotParameter").value;
            appendLog(`Starting Kleinanzeigen-Bot, with parameter: ${kaparameter}`);

            const response = await fetch(`/api/v1/bot/runCommand`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ kaparameter: kaparameter }),
            });
              const data = await response.json();

        if (data.error) {
            setStatus(`Error: ${data.error}`);
        } else {
            appendLog(`Bot started.`);
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