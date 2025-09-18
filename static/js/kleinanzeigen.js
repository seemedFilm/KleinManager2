
class KleinanzeigenManager extends KleinManagerCore {
    constructor() {
        super();
        this.adsFiles = [];
        
    }

    refreshAdsFileList() {
        try {
            log.front("Reload ads", "INFO", "blue");
            this.apiRequest('/ads/files');
            
        } 
        catch (error) {
            
        }
    }
}