// logger.js
window.log = {   
    front: (message, level, color, htmlElementId = "kabotLog") => {
        const el = document.getElementById(htmlElementId);
        if (el) {
            el.innerHTML += `<p class='text-${color}-400'>${message}</p>`;
            el.scrollTop = el.scrollHeight;
        }
        log.backend(message, level);
    },

    console: (message, level = "ERROR") => {
        console.log(`[${level}] ${message}`);
        log.backend(message, level);
    },


    both: (message, level = "INFO", color = "gray", htmlElementId = "kabotLog") => {
        log.front(message, level, color, htmlElementId);
        log.backend(message, level);
    },

    all: (message, level, color, htmlElementId) => {
        log.front(message, level, color, htmlElementId);
        log.backend(message, level);
        log.console(message, level);
    },

    // Zentral: Backend-Log
    backend: async (message, level) => {
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
};