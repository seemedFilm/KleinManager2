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

export function logFrontend(message, level, color, htmlElement) {
    let elementId;
    if (htmlElement && htmlElement.length > 0) {
        elementId = htmlElement;
    } 
    else {
        elementId = "kabotLog"; // Default
        sendLog(`setting default htmlElement: ${elementId}`, level);
    }

    const el = document.getElementById(elementId);
    if (el) {
        el.innerHTML += `<p class='text-${color}-400'>${message}</p>`;
        el.scrollTop = el.scrollHeight;
    }

    sendLog(message, level);
    console.log(`[${level}] ${message}`);
}
