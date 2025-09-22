
class KleinanzeigenManager extends KleinManagerCore {
    constructor() {
        super();
        this.adsFiles = [];

    }

    refreshAdsFileList(htmlElementId = "dummy") {
        try {
            this.apiRequest('/ads/files');

        }
        catch (error) {
             }
    }

    async loadAdFile(htmlElementId = "dummy") {
        try {
            let selectedAdFile = document.querySelector("input[name='adsFile']:checked");
            if (!selectedAdFile) {
                return;
            }
            let fileName = selectedAdFile.value;
           
            const res = await fetch("/api/v1/bot/publish", {
                method: "POST"
            });

            if (!res.ok) {
                const err = await res.json();
                return;
            }


        } catch (error) {
           }
    }
    startLogStream() {
        const eventSource = new EventSource("/api/v1/bot/log");

        eventSource.onmessage = (event) => {
            const logContainer = document.getElementById("logOutput");
            logContainer.textContent += event.data + "\n";
            logContainer.scrollTop = logContainer.scrollHeight; // auto-scroll
        };

        eventSource.onerror = (err) => {
            console.error("Log stream error:", err);
            eventSource.close();
        };
    }
}