/* ===========================================================
   Adbuilder Addon für KleinManager
   =========================================================== */

class Adbuilder extends KleinManagerCore {
    constructor() {
        super();
        this.maxPictures = 16;
        this.currentLang = localStorage.getItem("language") || "en";

        document.addEventListener("languageChanged", () => {
            this.currentLang = localStorage.getItem("language") || this.currentLang;
            this.applyAdbuilderTranslations();
        });
    }

    /* -----------------------------------------------
       Lädt die HTML-Section für den Adbuilder
       ----------------------------------------------- */
    async loadAdbuilderSection() {
        try {
            console.log("⏳ Lade Adbuilder HTML...");

            const res = await fetch("/addons/adbuilder/adbuilder.html");
            if (!res.ok) throw new Error(`Fehler beim Laden (HTTP ${res.status})`);
            const html = await res.text();

            // Warte, bis #content-area im DOM existiert
            let main = document.querySelector("#content-area");
            let attempts = 0;
            while (!main && attempts < 20) {
                await new Promise(r => setTimeout(r, 200));
                main = document.querySelector(".lg\\:ml-64.flex-1 .p-4.lg\\:p-6");
                attempts++;
            }

            if (!main) throw new Error("#content-area nicht gefunden.");

            // Section anlegen, falls sie nicht existiert
            let container = document.getElementById("adbuilder");
            if (!container) {
                container = document.createElement("section");
                container.id = "adbuilder";
                container.className = "section hidden p-4";
                main.appendChild(container);
                console.log("🧱 Neue Section #adbuilder erstellt");
            }

            // HTML einsetzen
            container.innerHTML = html;

            // Andere Sections verstecken, Adbuilder zeigen
            document.querySelectorAll("#content-area .section").forEach(sec => {
                if (sec !== container) sec.classList.add("hidden");
            });
            container.classList.remove("hidden");

            // Events, Übersetzungen, Daten
            try { this._wireUiEvents(); } catch (e) { console.warn("⚠️ _wireUiEvents fehlgeschlagen:", e); }
            if (window.adbuilderTranslator) adbuilderTranslator.applyTranslations();
            this.applyAdbuilderTranslations?.();
            await this.loadCategories?.();
            await this.refreshAds?.();

            console.log("✅ Adbuilder-HTML geladen und sichtbar.");
        } catch (err) {
            console.error("❌ Konnte Adbuilder-HTML nicht laden:", err);
            const main = document.querySelector("#content-area") || document.body;
            const fallback = document.createElement("div");
            fallback.className = "p-4 bg-red-900 text-red-200 rounded";
            fallback.textContent = `Fehler beim Laden des AdBuilder: ${err.message || err}`;
            main.appendChild(fallback);
        }
    }

    applyAdbuilderTranslations() {
        if (!window.adbuilderTranslator) return;
        const dict =
            adbuilderTranslator.translations[adbuilderTranslator.lang] ||
            adbuilderTranslator.translations.en || {};
        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.getAttribute("data-i18n");
            if (dict[key]) el.textContent = dict[key];
        });
        console.log("🈶 Adbuilder Übersetzungen angewendet:", adbuilderTranslator.lang);
    }

    async loadCategories() {
        try {
            const select = document.getElementById("category");
            if (!select) return;
            const res = await fetch("/api/v1/adbuilder/categories");
            const data = await res.json();
            select.innerHTML = "";
            if (data.categories?.length) {
                data.categories.forEach(cat => {
                    const opt = document.createElement("option");
                    opt.value = cat;
                    opt.textContent = cat;
                    select.appendChild(opt);
                });
            } else {
                const opt = document.createElement("option");
                opt.value = "";
                opt.textContent = "Keine Kategorien verfügbar";
                select.appendChild(opt);
            }
        } catch (err) {
            console.error("❌ Kategorien konnten nicht geladen werden:", err);
        }
    }

    async refreshAds() {
        try {
            const res = await fetch("/api/v1/adbuilder/list_files");
            const data = await res.json();
            const container = document.getElementById("adsFileContainer");
            if (!container) return;
            container.innerHTML = "";

            if (!data.files?.length) {
                container.innerHTML = `<p class="text-gray-400">Keine gespeicherten Anzeigen gefunden.</p>`;
                return;
            }

            data.files.forEach((file, idx) => {
                const label = document.createElement("label");
                label.className = "flex items-center space-x-2 p-2 bg-gray-700 rounded hover:bg-gray-600 cursor-pointer";
                const radio = document.createElement("input");
                radio.type = "radio";
                radio.name = "adsFile";
                radio.value = file;
                if (idx === 0) radio.checked = true;
                const span = document.createElement("span");
                span.textContent = file;
                label.appendChild(radio);
                label.appendChild(span);
                container.appendChild(label);
            });
        } catch (err) {
            console.error("❌ Fehler bei refreshAds:", err);
        }
    }

    _wireUiEvents() {
        const saveBtn = document.getElementById("save_adfile");
        if (saveBtn) {
            saveBtn.addEventListener("click", () => alert("Anzeige gespeichert!"));
        }
    }
}

/* ===========================================================
   Übersetzer
   =========================================================== */
class AdbuilderTranslator {
    constructor(maxPictures = 16) {
        this.lang = localStorage.getItem("language") || "en";
        this.translations = {
            en: { "adbuilder.formTitle": "Create Ad" },
            de: { "adbuilder.formTitle": "Anzeige erstellen" }
        };
    }

    toggleLanguage(externalLang = null) {
        this.lang = externalLang || (this.lang === "en" ? "de" : "en");
        localStorage.setItem("language", this.lang);
        this.applyTranslations();
        this.updateLangIndicator();
    }

    applyTranslations() {
        const dict = this.translations[this.lang] || this.translations.en;
        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.getAttribute("data-i18n");
            if (dict[key]) el.textContent = dict[key];
        });
    }

    updateLangIndicator() {
        const indicator = document.getElementById("currentLang");
        if (indicator) indicator.textContent = this.lang.toUpperCase();
    }
}

/* ===========================================================
   Initialisierung
   =========================================================== */
function initAdbuilder() {
    if (!window.app) {
        setTimeout(initAdbuilder, 300);
        return;
    }

    if (!app.adbuilder) {
        app.adbuilder = new Adbuilder();
        app.copyMethodsFromManager?.(app.adbuilder);
        console.log("✅ Adbuilder-Klasse initialisiert");
    }

    // === Sidebar-Integration (robust) ===
    const waitForSidebar = setInterval(() => {
        const sidebar = document.getElementById("sidebar");
        const sidebarButtonsContainer = sidebar?.querySelector("nav .space-y-2");
        const settingsButton = sidebar?.querySelector("button[onclick*='settings']");

        if (!sidebarButtonsContainer || !settingsButton) {
            console.log("⏳ Warte auf Sidebar-Buttons...");
            return;
        }

        clearInterval(waitForSidebar);

        // Prüfen, ob AdBuilder-Button bereits existiert
        if (document.getElementById("menu-adbuilder")) {
            console.log("ℹ️ AdBuilder-Button existiert bereits.");
            return;
        }

        // 🔹 Button erzeugen
        const adbuilderBtn = document.createElement("button");
        adbuilderBtn.id = "menu-adbuilder";
        adbuilderBtn.className =
            "nav-item w-full text-left px-4 py-3 rounded-lg flex items-center text-gray-200 hover:bg-gray-700 transition-colors duration-200";
        adbuilderBtn.innerHTML = `
        <i class="fas fa-tools mr-3 w-5 text-center"></i>
        <span data-i18n="nav.adbuilder">AdBuilder</span>
    `;

        // 🔹 Über Settings einfügen
        sidebarButtonsContainer.insertBefore(adbuilderBtn, settingsButton);
        console.log("🧩 AdBuilder-Button über Settings eingefügt.");

        // 🔹 Klick-Event
        adbuilderBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            await app.adbuilder.loadAdbuilderSection();
            if (typeof app.showSection === "function") {
                app.showSection("adbuilder");
            } else {
                document.querySelectorAll("#content-area .section").forEach(sec => sec.classList.add("hidden"));
                document.getElementById("adbuilder")?.classList.remove("hidden");
            }
        });
    }, 300);


    // === Übersetzer ===
    if (!window.adbuilderTranslator) {
        window.adbuilderTranslator = new AdbuilderTranslator(16);
        adbuilderTranslator.applyTranslations();
    }

    // === Sprache synchronisieren ===
    if (app.toggleLanguage && !app._adbuilderToggleWrapped) {
        const original = app.toggleLanguage.bind(app);
        app.toggleLanguage = function () {
            original();
            const currentLang = localStorage.getItem("language") || "en";
            adbuilderTranslator.toggleLanguage(currentLang);
            console.log("🌐 Sprache gewechselt → Seite & Adbuilder aktualisiert");
        };
        app._adbuilderToggleWrapped = true;
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAdbuilder);
} else {
    initAdbuilder();
}
