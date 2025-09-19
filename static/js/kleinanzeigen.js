
class KleinanzeigenManager extends KleinManagerCore {
    constructor() {
        super();
        this.adsFiles = [];
        
    }

    refreshAdsFileList(htmlElementId = "dummy") {
        try {            
            log.all("Reload ads", "INFO", "blue", htmlElementId);
            this.apiRequest('/ads/files');
            
        } 
        catch (error) {
            log.all(`ERROR: ${error}`, "ERROR", "red", htmlElementId);
        }
    }

    async loadAdFile(htmlElementId = "dummy") {
        try {
                let selectedAdFile = document.querySelector("input[name='adsFile']:checked");
                if (!selectedAdFile) {
                    log.front("❌ No ads file selected", "ERROR", "red", htmlElementId);
                    return;
                }
                let fileName = selectedAdFile.value;
                log.front(`Ausgewählte Datei: ${fileName}`, "INFO", "blue", htmlElementId);
                
                await fetch("/api/v1/bot/publish", { method: "POST" });

        //         const res = await fetch("/api/v1/bot/publish", {
        //             method: "POST",
        //             headers: { "Content-Type": "application/json" },
        //             body: JSON.stringify({})  // kein Dateiname nötig
        // });

                
            } catch (error) {
            log.all(`ERROR: ${error}`, "ERROR", "red", htmlElementId);
            }
    }
}