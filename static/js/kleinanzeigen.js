import log from "./logger";

class KleinanzeigenManager extends KleinManagerCore {
    constructor() {

        this.adsFiles = [];
        
    }

    refreshAdsFileList() {
        try {
            log.front("Reload ads", "INFO", "blue");
            this.apiRequest('/api/v1/ads/files');
            
        } 
        catch (error) {
            
        }
    }
}