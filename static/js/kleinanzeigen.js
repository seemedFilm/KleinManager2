
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
//     async runCom() {
//         try {
//              let kaparameter = document.getElementById("KaBotParameter").value;
           
//             const res = await fetch("/api/v1/bot/runCommand", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ kaparameter }),                
//             });
            
//         } catch (error) {            
//         }
//     }
//     async stopBot() {
//         try {
//             const res = await fetch("/api/v1/bot/stop", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },                
//             });
            
//         } catch (error) {            
//         }
//     }
//     // async startBot(htmlElementId = "dummy") {
//     //     try {
//     //         console.log("startBot")
//     //         const res = await fetch("/api/v1/bot/start", {
//     //             method: "POST",
//     //             headers: { "Content-Type": "application/json" },
//     //             body: JSON.stringify({ kaparameter }),
//     //         });

//     //         if (!res.ok) {
//     //             const err = await res.json();
//     //             return;
//     //         }


//     //     } catch (error) {
//     //     }
//     // }
//     async stopContainer() {
//     setStatus("Stoppe Container ...");

//     try {
//         const response = await fetch(`/api/v1/bot/stop`, { method: "POST" });
//         const data = await response.json();

//         if (data.error) {
//             setStatus(`âŒ Fehler: ${data.error}`);
//         } else {
//             setStatus("ðŸ›‘ Container gestoppt.");
//             appendLog("Container wurde beendet.");
//         }
//         } catch (err) {
//             setStatus(`âŒ Netzwerkfehler: ${err}`);
//         }
//     }



//     async startContainer() {
//     setStatus("Starte Container ...");

//     try {
//         const response = await fetch(`/api/v1/bot/publish`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ kaparameter: "publish" }),
//         });

//         const data = await response.json();
//         if (data.error) {
//             setStatus(`âŒ Fehler: ${data.error}`);
//         } else {
//             setStatus(`âœ… Container gestartet (ID: ${data.container_id || "?"})`);
//             appendLog("Container erfolgreich gestartet.");
//         }
//     } catch (err) {
//         setStatus(`âŒ Netzwerkfehler: ${err}`);
//     }
// }

// ðŸŸ¢ Container starten
    async startContainer(htmlElementId = "dummy") {
        setStatus("Starte Container ...");

        try {
            const response = await fetch(`/api/v1/bot/start`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ kaparameter: "publish" }),
            });

            const data = await response.json();
            if (data.error) {
                setStatus(`âŒ Fehler: ${data.error}`);
            } else {
                setStatus(`âœ… Container gestartet (ID: ${data.container_id || "?"})`);
                appendLog("Container erfolgreich gestartet.");
            }
        } catch (err) {
            setStatus(`âŒ Netzwerkfehler: ${err}`);
        }
    }

    // âš™ï¸ Bot-Command im Container ausfÃ¼hren
    async runBotCommand() {
        setStatus("Starte Kleinanzeigen-Bot ...");

        try {
            const response = await fetch(`/api/v1/bot/runCommand`, {
                method: "POST"
            });

            const data = await response.json();
            if (data.error) {
                setStatus(`âŒ Fehler: ${data.error}`);
            } else {
                setStatus(`âœ… Bot ausgefÃ¼hrt (Exec-ID: ${data.exec_id || "?"})`);
                appendLog("Bot-Befehl erfolgreich gestartet.");
            }
        } catch (err) {
            setStatus(`âŒ Netzwerkfehler: ${err}`);
        }
    }

    // ðŸ”´ Container stoppen
    async stopContainer() {
        setStatus("Stoppe Container ...");

        try {
            const response = await fetch(`/api/v1/bot/stop`, { method: "POST" });
            const data = await response.json();

            if (data.error) {
                setStatus(`âŒ Fehler: ${data.error}`);
            } else {
                setStatus("ðŸ›‘ Container gestoppt.");
                appendLog("Container wurde beendet.");
            }
        } catch (err) {
            setStatus(`âŒ Netzwerkfehler: ${err}`);
        }
    }





}