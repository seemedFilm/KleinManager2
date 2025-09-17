// logger.js
export async function sendLog(message, level = "INFO") {
    try {
        await fetch("/api/v1/logging_frontend", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message, level })
        });
    } catch (err) {
        console.error("Konnte Log nicht senden:", err);
    }
}

export function logFrontend(message, level, color) {
   
    const kabotLog = document.getElementById("kabotLog");
    if (kabotLog) {
        kabotLog.innerHTML += `<p class='text-${color}-400'>${message}</p>`;
        kabotLog.scrollTop = kabotLog.scrollHeight;    
    }
    sendLog(message, level);
    console.log(`[${level}] ${message}`);
}
