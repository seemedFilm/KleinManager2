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
            // CSS nur einmal laden
            const cssPath = "/app/addons/adbuilder/adbuilder.css";
            if (!document.querySelector(`link[href="${cssPath}"]`)) {
                const link = document.createElement("link");
                link.rel = "stylesheet";
                link.href = cssPath;
                document.head.appendChild(link);
                console.log(" AdBuilder CSS geladen:", cssPath);
            }
            console.log(" Lade Adbuilder HTML...");

            const res = await fetch("/app/addons/adbuilder/adbuilder.html");
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
            // let container = document.getElementById("adbuilder");
            let container = document.querySelector(".lg\\:ml-64.flex-1 .p-4.lg\\:p-6");
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
    handleFileSelection(input) {
        const statusText = document.getElementById("fileStatusText");
        const t = this.customTranslations?.[this.currentLang] || this.customTranslations?.en;

        if (input.files.length === 0) {
            statusText.textContent = t.noFilesSelected;
        } else {
            const count = input.files.length;
            statusText.textContent = `${count} ${count === 1 ? t.fileSelected : t.filesSelected}`;
        }
    }

    async updateImageList(title = null) {
        const imageList = document.getElementById("imageList");
        //imageList.innerHTML = "";
        let files = [];
        if (!title) {
            files = Array.from(document.getElementById("Images").files);

            if (!files.length) {
                imageList.innerHTML =
                    `<li class='italic text-gray-400'>${this.customTranslations[this.currentLang].noPicturesSel}</li>`;
                return;
            }
            files.forEach(file => {
                const li = document.createElement("li");
                li.textContent = file.name;
                li.className = "border-gray-700 py-0.5 text-gray-100";
                imageList.appendChild(li);
            });
            console.log(`${files.length} ${this.customTranslations[this.currentLang].loadPictures}.`);
            return;
        }
        try {
            const res = await fetch(`/api/v1/adbuilder/load_ad`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title })
            });
            const data = await res.json();
            if (data.error) {
                console.error(`${this.customTranslations[this.currentLang].errorImgLoad}: ${data.error}`);
                imageList.innerHTML =
                    `<li class='italic text-red-400'>${this.customTranslations[this.currentLang].errorLoading}</li>`;
                return;
            }
            if (Array.isArray(data.images) && data.images.length > 0) {
                data.images.forEach(imgPath => {
                    const fileName = imgPath.split(/[\\/]/).pop();
                    const li = document.createElement("li");
                    li.textContent = fileName;
                    li.className = "border-gray-700 py-0.5 text-gray-100";
                    imageList.appendChild(li);
                });
                console.log(`📂 ${data.images.length} ${this.customTranslations[this.currentLang].loadPictures}.`);
            } else {
                imageList.innerHTML =
                    `<li class='italic text-gray-400'>${this.customTranslations[this.currentLang].noPictures}</li>`;
            }
        } catch (err) {
            //console.error(`${this.customTranslations[this.currentLang].errorAdLoading}: ${err}`);
            console.error(`Error updateImageList:  ${err}`);
            imageList.innerHTML =
                `<li class='${this.customTranslations[this.currentLang].errorAdLoading}</li>`;
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
        this.customTranslations = {
            en: {
                title: "Title",
                description: "Description",
                category: "Category",
                price: "Price (â‚¬)",
                priceType: "Price Type",
                sell_directly: "Sell Directly",
                shipping: "Shipping Options",
                save: "Save",
                load: "Load",
                clear: "Clear",
                preview: "Preview",
                alert_noTitle: "Please enter a title!",
                alert_saved: "Ad saved successfully!",
                errorCategory: "Error on category loading:",
                noCategory: "No Categories found.",
                maxPictures: `Only ${maxPictures} Pictures allowed`,
                pictures: "Pictures saved in",
                errorUpload: "Error during the upload",
                infoImageList: "Imagelist successfully updated",
                errorAdLoading: "Error during the ad loading",
                infoThumbnail: "Pictures and thumbnails updated successfully",
                errorThumbnail: "Thumbnail loading error:",
                noPictures: "No Pictures found",
                loadPictures: "saved picture(s) loaded into the list",
                noPreview: "No preview available",
                noPicturesSel: "No Pictures selected",
                loadThumbnail: "thumbnail(s) loaded",
                minPicture: "Please select atleast one picture to upload!",
                loadPreview: "Loading Preview"
            },
            de: {
                title: "Titel",
                description: "Beschreibung",
                category: "Kategorie",
                price: "Preis (â‚¬)",
                priceType: "Preistyp",
                sell_directly: "Sofortkauf",
                shipping: "Versandoptionen:",
                save: "Speichern",
                load: "Laden",
                clear: "Leeren",
                preview: "Vorschau",
                alert_noTitle: "Bitte einen Titel eingeben!",
                alert_saved: "Anzeige erfolgreich gespeichert!",
                errorCategory: "Fehler beim Kategorie laden:",
                noCategory: "Keine Kategorien gefunden.",
                maxPictures: `Nur ${maxPictures} Bilder sind erlaubt`,
                pictures: "Bilder gespeichert in",
                errorUpload: "Fehler beim Upload",
                infoImageList: "Bilder Liste aktualisiert.",
                errorAdLoading: "Fehler beim Anzeige laden",
                infoThumbnail: "Bilder und Vorschaubilder geladen.",
                errorThumbnail: "Laden Thumbnails Fehler",
                noPictures: "Keine Bilder gefunden",
                loadPictures: "Bild(er) in die Liste geladen",
                noPreview: "Keine Vorschau verfÃ¼gbar",
                noPicturesSel: "No Pictures selected",
                loadThumbnail: "Thumbnail(s) geladen",
                minPicture: "Mindestens ein Bild zum Hochladen auswÃ¤hlen",
                loadPreview: "Lade Vorschau"

            } //sample: this.customTranslations[this.currentLang].noPreview
        };    //sample: console.error(`${this.currentLang === "en" ? "No Categories found" : "Keine Kategorien gefunden"}`);

    }
    toggleLanguage(externalLang = null) {
        this.lang = externalLang || (this.lang === "en" ? "de" : "en");
        localStorage.setItem("language", this.lang);
        this.applyTranslations();
        this.updateLangIndicator();
    }
    applyTranslations() {
        const dict = app.translations[app.lang] || app.translations.en;
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
