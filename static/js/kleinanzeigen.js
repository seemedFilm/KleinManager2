
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

    async startBot(htmlElementId = "dummy") {
        try {
            let kaparameter = document.getElementById("KaBotParameter").value;
            let selectedAdFile = document.querySelector("input[name='adsFile']:checked");
            if (!selectedAdFile) {
                return;
            }
            let fileName = selectedAdFile.value;

            const res = await fetch("/api/v1/bot/publish", {
                 method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ kaparameter }),
            });

            if (!res.ok) {
                const err = await res.json();
                return;
            }


        } catch (error) {
        }
    }
}