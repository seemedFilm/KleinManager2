
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

            } catch (error) {
            log.all(`ERROR: ${error}`, "ERROR", "red", htmlElementId);
            }
    }
}