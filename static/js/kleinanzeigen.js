
function setStatus(msg) {
    const logBox = document.getElementById("kabotLog");
    if (logBox) {
        const time = new Date().toLocaleTimeString();
        logBox.textContent = `\n[${time}] ${msg}`;
    }
    console.log(`${msg}`);
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
        setInterval(() => this.updateContainerStatus(), 3000);
        const poll = setInterval(() => {
        const section = document.getElementById("Ka-Bot");
        if (section && !section.classList.contains("hidden")) {
            this.updateContainerStatus();
        }
        }, 3000);
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
     

        try {
            setStatus("Starting container ...");
            const icon = document.getElementById("startButton");
            icon.style.color = "orange";
            icon.className = "fas fa-spinner fa-spin text-lg mr-3";

            const response = await fetch(`/api/v1/bot/start`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },                
            });

            const data = await response.json();
            if (data.error) {
                setStatus(`Error: ${data.error}`);
                icon.style.color = "red";
                icon.className = "fas fa-stop text-lg mr-3";
            } else {
                appendLog(`Container started (ID: ${data.container_id || "?"})`);
                appendLog("Container started.");
                icon.style.color = "limegreen";
                icon.className = "fas fa-play text-lg mr-3";
                
            }
        } catch (err) {
            setStatus(`Error: ${err}`);
        }
    }
    async stopContainer() {
        
        try {
            appendLog("Stopping container...");
            const icon = document.getElementById("startButton");
            icon.style.color = "orange";
            icon.className = "fas fa-spinner fa-spin text-lg mr-3";

            const response = await fetch(`/api/v1/bot/stop`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },                
            });

            const data = await response.json();
            if (data.error) {
                setStatus(`Error: ${data.error}`);                
            } else {
                appendLog(`Container stopped (ID: ${data.container_id || "?"})`);
                icon.style.color = "red";
                icon.className = "fas fa-play text-lg mr-3";
            }

        } catch (err) {
            appendLog(`Error: ${err}`);
            icon.style.color = "red";
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
       
        try {
            setStatus("Stopping container...");
            
            
            
            const response = await fetch(`/api/v1/bot/stopCommand`, { 
                method: "POST" },
            );
            const data = await response.json();

            if (data.error) {
                setStatus(`Error: ${data.error}`);
            } else {
                appendLog("Command stopped.");
            }
        } catch (err) {
            setStatus(`Error: ${err}`);
        }
    }
async updateContainerStatus() {
    const icon = document.getElementById("startButton");
    if (!icon) return;

    try {
        const response = await fetch("/api/v1/bot/status");
        console.log("updateContainerStatus")
        const data = await response.json();
        const status = data.status;

        if (status === "running") {
            icon.style.color = "limegreen";
            icon.className = "fas fa-play text-lg mr-3";
        } else if (status === "exited" || status === "not_found") {
            icon.style.color = "red";
            icon.className = "fas fa-stop text-lg mr-3";
        } else {
            icon.style.color = "orange";
            icon.className = "fas fa-spinner fa-spin text-lg mr-3";
        }

    } catch (err) {
        console.error(`Could not retrieve container status ${err}`);
        icon.style.color = "gray";
    }
}
}