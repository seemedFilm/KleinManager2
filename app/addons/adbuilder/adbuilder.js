class Adbuilder extends KleinManagerCore {
    constructor() {
        super();
        const maxPictures = 16;
        document.addEventListener("languageChanged", () => {
            this.currentLang = localStorage.getItem("language") || this.currentLang;
            this.applyAdbuilderTranslations();
        });

    }

    /* -------------------------
       HTML load & translations
       ------------------------- */
    async loadAdbuilderSection() {
        try {
            const res = await fetch("/addons/adbuilder/adbuilder.html");
            if (!res.ok) throw new Error("Failed to fetch adbuilder.html");
            const html = await res.text();
            const container = document.getElementById("adbuilder-container");
            if (!container) {
                console.warn("adbuilder-container not found in DOM; skipping insertion");
                return;
            }
            container.innerHTML = html;

            // after injection: attach event handlers to elements that rely on JS
            this._wireUiEvents();

            // apply translations: first the global data-i18n via AdbuilderTranslator (if present),
            // then fallback local translations
            if (window.adbuilderTranslator) adbuilderTranslator.applyTranslations();
            this.applyAdbuilderTranslations();

            // load categories and refresh ad list after HTML present
            await this.loadCategories().catch(e => console.warn("loadCategories failed:", e));
            await this.refreshAds().catch(e => console.warn("refreshAds failed:", e));

            console.log("✅ Adbuilder-HTML geladen und initialisiert.");
        } catch (err) {
            console.error("❌ Konnte Adbuilder-HTML nicht laden:", err);
        }
    }

    applyAdbuilderTranslations() {
        // Prüfe, ob der Translator existiert
        if (!window.adbuilderTranslator) {
            console.warn("⚠️  Kein AdbuilderTranslator gefunden – keine Übersetzungen angewendet.");
            return;
        }

        const dict = adbuilderTranslator.translations[adbuilderTranslator.lang]
            || adbuilderTranslator.translations.en
            || {};

        // Übersetze alle data-i18n-Elemente
        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.getAttribute("data-i18n");
            let keyArray = key.split(".")
            if (keyArray[0] == "adbuilder") {
                if (dict[key]) {
                    el.textContent = dict[key];
                } else {

                    console.log(`ℹ️  Kein data-i18n-Key "${keyArray[0]} - ${keyArray[1]}" in Übersetzungstabellen gefunden.`);
                }
            }
        });

        console.log("🈶 Adbuilder-Übersetzungen aktiv (via Translator):", adbuilderTranslator?.lang || "en");
    }


    /* -------------------------
       UI wiring (events)
       ------------------------- */
    _wireUiEvents() {
        // file input -> update list
        const imagesInput = document.getElementById("Images");
        if (imagesInput) {
            imagesInput.addEventListener("change", () => {
                try { this.updateImageList(); } catch (e) { console.warn(e); }
            });
        }

        // preview button
        const previewBtn = document.getElementById("uploadButton");
        if (previewBtn) {
            previewBtn.addEventListener("click", (e) => {
                e.preventDefault();
                this.showLocalThumbnails().catch(err => console.warn(err));
            });
        }

        // save/load/clear buttons
        const saveBtn = document.getElementById("save_adfile");
        if (saveBtn) {
            saveBtn.addEventListener("click", (e) => {
                e.preventDefault();
                this.saveAdFile().catch(err => console.warn(err));
            });
        }
        const loadBtn = document.getElementById("load_adfile");
        if (loadBtn) {
            loadBtn.addEventListener("click", (e) => {
                e.preventDefault();
                this.loadAdFile().catch(err => console.warn(err));
            });
        }
        const clearBtn = document.getElementById("clear_adfile");
        if (clearBtn) {
            clearBtn.addEventListener("click", (e) => {
                e.preventDefault();
                this.clearAdForm().catch(err => console.warn(err));
            });
        }

        // optionally wire any other UI (e.g. template selection radios)
    }

    /* -------------------------
       Categories / ad files
       ------------------------- */
    async loadCategories() {
        const t = window.adbuilderTranslator
            ? adbuilderTranslator.translations[adbuilderTranslator.lang]
            : {};
        const categorySelect = document.getElementById("category");
        if (!categorySelect) return;
        try {
            const res = await fetch("/api/v1/adbuilder/categories");
            const data = await res.json();
            categorySelect.innerHTML = "";
            if (data.error) {
                console.error(t["adbuilder.errorCategory"] || `Category loading error: ${data.error}`);
                return;
            }
            if (!Array.isArray(data.categories) || data.categories.length === 0) {
                console.warn(t["adbuilder.noCategory"] || "No categories found.");
                categorySelect.innerHTML = `<option value="">${t["adbuilder.noCategory"] || "No categories"}</option>`;
                return;
            }
            data.categories.forEach(cat => {
                const opt = document.createElement("option");
                opt.value = cat;
                opt.textContent = cat;
                categorySelect.appendChild(opt);
            });
            console.log(t["adbuilder.infoCategories"] || "Categories loaded");
        } catch (err) {
            console.error(t["adbuilder.errorCategory"] || "Category load failed:", err);
        }
    }

    async refreshAds() {
        const t = window.adbuilderTranslator
            ? adbuilderTranslator.translations[adbuilderTranslator.lang]
            : {};
        try {
            const container = document.getElementById("adsFileContainer");
            if (!container) return;
            const res = await fetch("/api/v1/adbuilder/list_files");
            const data = await res.json();
            container.innerHTML = "";
            if (!data.files || data.files.length === 0) {
                container.innerHTML = `<p class='text-gray-400'>${t["adbuilder.infoNoAds"] || "No ads found"}</p>`;

                return;
            }
            data.files.forEach((file, idx) => {
                const label = document.createElement("label");
                label.className = "flex items-center space-x-2 p-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-600";
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
            console.log(`${t["adbuilder.loadAdFile"] || "Ad files loaded"}: ${data.files}`);
        } catch (err) {
            console.error(`refreshAds error: ${err}`);
        }
    }

    /* -------------------------
       Image handling
       ------------------------- */
    async updateImageList(title = null) {
        const imageList = document.getElementById("imageList");
        if (!imageList) return;
        imageList.innerHTML = "";
        try {
            if (!title) {
                const input = document.getElementById("Images");
                if (!input || !input.files || input.files.length === 0) {
                    imageList.innerHTML = `<li class='italic text-gray-400'>${this.customTranslations[this.currentLang].noPicturesSel}</li>`;
                    return;
                }
                const files = Array.from(input.files);
                files.forEach(f => {
                    const li = document.createElement("li");
                    li.className = "border-gray-700 py-0.5 text-gray-100";
                    li.textContent = f.name;
                    imageList.appendChild(li);
                });
                console.log(`${files.length} ${this.customTranslations[this.currentLang].loadPictures}.`);
                return;
            }

            // load by ad title from backend
            const res = await fetch("/api/v1/adbuilder/load_ad", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title })
            });
            const data = await res.json();
            if (data.error) {
                imageList.innerHTML = `<li class='italic text-red-400'>${this.customTranslations[this.currentLang].errorAdLoading}</li>`;
                return;
            }
            if (Array.isArray(data.images) && data.images.length > 0) {
                data.images.forEach(p => {
                    const li = document.createElement("li");
                    li.className = "border-gray-700 py-0.5 text-gray-100";
                    li.textContent = p.split(/[\\/]/).pop();
                    imageList.appendChild(li);
                });
                console.log(`📂 ${data.images.length} ${this.customTranslations[this.currentLang].loadPictures}.`);
            } else {
                imageList.innerHTML = `<li class='italic text-gray-400'>${this.customTranslations[this.currentLang].noPictures}</li>`;
            }
        } catch (err) {
            console.error("updateImageList error:", err);
            imageList.innerHTML = `<li class='italic text-red-400'>${this.customTranslations[this.currentLang].errorAdLoading}</li>`;
        }
    }
    updateImageListFromData(images = []) {
        const imageList = document.getElementById("imageList");
        if (!imageList) return;
        imageList.innerHTML = "";
        if (!Array.isArray(images) || images.length === 0) {
            imageList.innerHTML = `<li class='italic text-gray-400'>${this.customTranslations[this.currentLang].noPictures}</li>`;
            return;
        }
        images.forEach(imgPath => {
            const fileName = imgPath.split(/[\\/]/).pop();
            const li = document.createElement("li");
            li.className = "border-gray-700 py-0.5 text-gray-100";
            li.textContent = fileName;
            imageList.appendChild(li);
        });
        console.log(`${images.length} ${this.customTranslations[this.currentLang].loadPictures}`);
    }
    async showLocalThumbnails() {
        const input = document.getElementById("Images");
        const thumbsDiv = document.getElementById("thumbnails-container");
        if (!thumbsDiv) return;
        thumbsDiv.classList.remove("hidden");
        thumbsDiv.innerHTML = "";
        if (!input || !input.files || input.files.length === 0) {
            thumbsDiv.innerHTML = `<p class='text-gray-400 italic'>${this.customTranslations[this.currentLang].noPicturesSel}</p>`;
            thumbsDiv.classList.add("hidden");
            return;
        }
        Array.from(input.files).forEach(file => {
            if (!file.type.startsWith("image/")) return;
            const img = document.createElement("img");
            img.src = URL.createObjectURL(file);
            img.alt = file.name;
            img.className = "h-36 w-auto object-cover rounded-md border border-gray-600 cursor-pointer hover:scale-105 transition-transform";
            img.onclick = () => {
                const overlay = document.createElement("div");
                overlay.className = "fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50";
                overlay.onclick = () => overlay.remove();
                const largeImg = document.createElement("img");
                largeImg.src = img.src;
                largeImg.className = "max-h-[90vh] max-w-[90vw] rounded-xl shadow-lg border border-gray-700";
                overlay.appendChild(largeImg);
                document.body.appendChild(overlay);
            };
            thumbsDiv.appendChild(img);
        });
        console.log(`${input.files.length} ${this.customTranslations[this.currentLang].loadThumbnail}.`);
    }
    async loadThumbnails(title) {
        if (!title) return;
        const thumbsContainerId = "thumbnails-container";
        let thumbsDiv = document.getElementById(thumbsContainerId);
        if (!thumbsDiv) {
            const picturesDiv = document.getElementById("pictures");
            if (!picturesDiv) return;
            thumbsDiv = document.createElement("div");
            thumbsDiv.id = thumbsContainerId;
            thumbsDiv.className = "flex overflow-x-auto gap-2 mt-3 p-2 bg-gray-800 rounded-lg h-40";
            picturesDiv.appendChild(thumbsDiv);
        }
        thumbsDiv.innerHTML = `<p class='text-gray-400 italic'>${this.customTranslations[this.currentLang].loadPreview}...</p>`;
        try {
            const res = await fetch(`/api/v1/adbuilder/images?title=${encodeURIComponent(title)}`);
            const data = await res.json();
            thumbsDiv.innerHTML = "";
            if (!data.images || data.images.length === 0) {
                thumbsDiv.innerHTML = `<p class='text-gray-500 italic'>${this.customTranslations[this.currentLang].noPictures}.</p>`;
                return;
            }
            data.images.forEach(filename => {
                const img = document.createElement("img");
                img.src = `/ads/pics/${data.title}/${filename}`;
                img.alt = filename;
                img.className = "h-36 w-auto object-cover rounded-md border border-gray-600 cursor-pointer hover:scale-105 transition-transform";
                img.onclick = () => {
                    const overlay = document.createElement("div");
                    overlay.className = "fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50";
                    overlay.onclick = () => overlay.remove();
                    const largeImg = document.createElement("img");
                    largeImg.src = img.src;
                    largeImg.className = "max-h-[90vh] max-w-[90vw] rounded-xl shadow-lg border border-gray-700";
                    overlay.appendChild(largeImg);
                    document.body.appendChild(overlay);
                };
                thumbsDiv.appendChild(img);
            });
        } catch (err) {
            console.error(`${this.customTranslations[this.currentLang].errorThumbnail}: ${err}`);
            thumbsDiv.innerHTML = `<p class='text-red-400'>${this.customTranslations[this.currentLang].errorThumbnail}</p>`;
        }
    }

    /* -------------------------
       Save / load ad data
       ------------------------- */
    async saveAdFile() {
        try {
            const titleRaw = document.getElementById("title")?.value.trim() || "";
            const title = titleRaw.replace(/[^a-zA-Z0-9_-]/g, "_");
            const description = document.getElementById("description")?.value || "";
            const category = document.getElementById("category")?.value || "";
            const price = document.getElementById("price")?.value || "";
            const price_type = document.getElementById("price_type")?.value || "";
            const sell_directly = !!document.getElementById("sell_directly")?.checked;
            const shipping_options = Array.from(document.querySelectorAll("#shipping_options input[type='checkbox']:checked")).map(cb => cb.value);
            const images = Array.from(document.getElementById("Images")?.files || []);
            const imageNames = images.map(f => f.name);

            if (!titleRaw) {
                alert(`${this.customTranslations[this.currentLang].alert_noTitle}`);
                return;
            }

            const res = await fetch("/api/v1/adbuilder/builder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    description,
                    category,
                    price,
                    price_type,
                    sell_directly,
                    shipping_options,
                    images: imageNames
                })
            });
            const data = await res.json();
            if (data.error) {
                console.error(`Builder error: ${err}`);
                alert(this.customTranslations[this.currentLang].errorAdLoading || "Error");
                return;
            }

            // upload images if present
            if (images.length > 0) {
                const fd = new FormData();
                fd.append("title", title);
                images.forEach(f => fd.append("files", f));
                const up = await fetch("/api/v1/adbuilder/upload_images", { method: "POST", body: fd });
                const upData = await up.json();
                if (upData.error) {
                    console.error("upload error:", upData);
                    alert(this.customTranslations[this.currentLang].errorUpload);
                    return;
                }
            }

            console.log(`${this.customTranslations[this.currentLang].alert_saved}: ${data}`);
            alert(this.customTranslations[this.currentLang].alert_saved);

            // refresh ad list / thumbnails
            await this.refreshAds();
            await this.loadThumbnails(title).catch(() => { });
        } catch (err) {
            console.error(`SaveAdFile error: ${err}`);
            alert(this.customTranslations[this.currentLang].errorUpload || "Save error");
        }
    }
    async loadAdFile() {
        const selectedFile = document.querySelector('input[name="adsFile"]:checked')?.value;
        try {
            const res = await fetch("/api/v1/adbuilder/load_ad", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: selectedFile })
            });
            const data = await res.json();
            if (data.error) {
                console.error(`${this.customTranslations[this.currentLang].errorAdLoading}: ${data.error}`);
                return;
            }

            // populate fields
            document.getElementById("title").value = data.title || "";
            document.getElementById("description").value = data.description || "";
            document.getElementById("category").value = data.category || "";
            document.getElementById("price").value = data.price || "";
            if (document.getElementById("sell_directly")) document.getElementById("sell_directly").checked = !!data.sell_directly;

            if (data.price_type && document.getElementById("price_type")) {
                document.getElementById("price_type").value = data.price_type;
            }

            if (Array.isArray(data.shipping_options)) {
                document.querySelectorAll("#shipping_options input[type='checkbox']").forEach(cb => {
                    cb.checked = data.shipping_options.includes(cb.value);
                });
            }

            if (data.shipping_type && document.getElementById("shipping_type")) {
                document.getElementById("shipping_type").value = data.shipping_type.trim().toUpperCase();
            }

            this.updateImageListFromData(data.images || []);
            await this.loadThumbnails(data.title).catch(() => { });

            console.log(this.customTranslations[this.currentLang].infoImThumb);
        } catch (err) {
            console.error(`${this.customTranslations[this.currentLang].errorAdLoading}: ${err}`);
        }
    }
    async clearAdForm() {
        try {
            ["title", "description", "price"].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = "";
            });
            document.querySelectorAll("#shipping_options input[type='checkbox']").forEach(cb => cb.checked = false);
            const sellDirectly = document.getElementById("sell_directly");
            if (sellDirectly) sellDirectly.checked = false;
            ["price_type", "shipping_type"].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.selectedIndex = 0;
            });

            // reload categories as original code did
            await this.loadCategories().catch(() => { });
            const imageList = document.getElementById("imageList");
            if (imageList) imageList.innerHTML = `<li class='italic text-gray-400'>${this.customTranslations[this.currentLang].noPicturesSel}</li>`;

            const thumbsDiv = document.getElementById("thumbnails-container");
            if (thumbsDiv) {
                thumbsDiv.innerHTML = `<p class='text-gray-400 italic w-full text-center'>${this.customTranslations[this.currentLang].noPreview}</p>`;
                thumbsDiv.classList.add("hidden");
            }

            const fileInput = document.getElementById("Images");
            if (fileInput) fileInput.value = "";

            console.log(`${this.customTranslations[this.currentLang].infoFormReset}`);
        } catch (err) {
            console.warn(`clearAdForm error: ${err}`);
        }
    }
}

/* -------------------------
   AdbuilderTranslator (modular i18n for adbuilder)
   ------------------------- */
// === Sprachsystem für Adbuilder ===
class AdbuilderTranslator {
    constructor(maxPictures = 16) {
        this.maxPictures = maxPictures;
        this.lang = localStorage.getItem("language") || "en";

        // Übersetzungstabellen
        this.translations = {
            en: {
                "adbuilder.formTitle": "Create Ad",
                "adbuilder.title": "Title",
                "adbuilder.description": "Description",
                "adbuilder.category": "Category",
                "adbuilder.categoryDefault": "-- select --",
                "adbuilder.price": "Price (€)",
                "adbuilder.priceType": "Price Type:",
                "adbuilder.priceType.default": "-- select --",
                "adbuilder.priceType.negotiable": "Negotiable",
                "adbuilder.priceType.fixed": "Fixed",
                "adbuilder.priceType.giveaway": "Give Away",
                "adbuilder.sell_directly": "Sell Directly",
                "adbuilder.shipping": "Shipping Options:",
                "adbuilder.shippingType": "Shipping Type:",
                "adbuilder.shipping_type.default": "-- select --",
                "adbuilder.shipping_type.pickup": "Pickup",
                "adbuilder.shipping_type.shipping": "Shipping",
                "adbuilder.shipping_type.not-applicable": "Not Applicable",
                "adbuilder.actions.save": "Save",
                "adbuilder.actions.load": "Load",
                "adbuilder.actions.clear": "Clear",
                "adbuilder.actions.preview": "Preview",
                "adbuilder.noPreview": "No preview",
                "adbuilder.images": "Images:",
                "adbuilder.noImages": "No pictures selected",
                "adbuilder.templates": "Select template:",
                "adbuilder.maxPictures": `Only ${maxPictures} Pictures allowed`,
                "adbuilder.chooseFiles": "Choose Files",
                "adbuilder.noFilesSelected": "No images selected...",
                "adbuilder.fileSelected": "image selected",
                "adbuilder.filesSelected": "images selected"
            },
            de: {
                "adbuilder.formTitle": "Anzeige erstellen",
                "adbuilder.title": "Titel",
                "adbuilder.description": "Beschreibung",
                "adbuilder.category": "Kategorie",
                "adbuilder.categoryDefault": "-- auswählen --",
                "adbuilder.price": "Preis (€)",
                "adbuilder.priceType": "Preistyp:",
                "adbuilder.priceType.default": "-- auswählen --",
                "adbuilder.priceType.negotiable": "Verhandlungsbasis",
                "adbuilder.priceType.fixed": "Festpreis",
                "adbuilder.priceType.giveaway": "Zu verschenken",
                "adbuilder.sell_directly": "Sofortkauf",
                "adbuilder.shipping": "Versandoptionen:",
                "adbuilder.shippingType": "Versandart:",
                "adbuilder.shipping_type.default": "-- auswählen --",
                "adbuilder.shipping_type.pickup": "Abholung",
                "adbuilder.shipping_type.shipping": "Versand",
                "adbuilder.shipping_type.not-applicable": "Keine Angabe",
                "adbuilder.actions.save": "Speichern",
                "adbuilder.actions.load": "Laden",
                "adbuilder.actions.clear": "Leeren",
                "adbuilder.actions.preview": "Vorschau",
                "adbuilder.noPreview": "Keine Vorschau",
                "adbuilder.images": "Bilder:",
                "adbuilder.noImages": "Keine Bilder ausgewählt",
                "adbuilder.templates": "Vorlagen auswählen:",
                "adbuilder.maxPictures": `Nur ${maxPictures} Bilder sind erlaubt`,
                "adbuilder.chooseFiles": "Dateien auswählen",
                "adbuilder.noFilesSelected": "Keine Bilder ausgewählt...",
                "adbuilder.fileSelected": "Bild ausgewählt",
                "adbuilder.filesSelected": "Bilder ausgewählt"
            }
        };
    }

    /**
     * Sprache umschalten
     */
    toggleLanguage(externalLang = null) {
        // this.lang = this.lang === "en" ? "de" : "en";
        // localStorage.setItem("language", this.lang);
        // this.applyTranslations();
        // this.updateLangIndicator();

        // this.lang === "en" ? `${console.log("Language switched")}` : `${console.log("Sprache gewechselt")}`
        // Wenn core bereits eine Sprache setzt, übernehme diese
        if (externalLang) {
            this.lang = externalLang;
        } else {
            // Fallback: falls separat aufgerufen
            this.lang = this.lang === "en" ? "de" : "en";
            localStorage.setItem("language", this.lang);
        }

        this.applyTranslations();
        this.updateLangIndicator();
        this.lang === "en" ? `${console.log("Language switched")}` : `${console.log("Sprache gewechselt")}`

    }

    /**
     * Alle Texte auf der Seite anhand von data-i18n aktualisieren
     */
    applyTranslations() {
        const dict = this.translations[this.lang] || this.translations.de;

        // Texte mit data-i18n
        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.getAttribute("data-i18n");
            if (dict[key]) el.textContent = dict[key];
        });

        // Placeholder-Attribute
        document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
            const key = el.getAttribute("data-i18n-placeholder");
            if (dict[key]) el.placeholder = dict[key];
        });

        // ✅ Dropdown-Menüs (Optionen)
        document.querySelectorAll("option[data-i18n]").forEach(opt => {
            const key = opt.getAttribute("data-i18n");
            if (dict[key]) opt.textContent = dict[key];
        });

        console.log("✅ Übersetzungen angewendet:", this.lang);
    }

    /**
     * Sprache im UI-Indikator aktualisieren (z. B. EN / DE Button)
     */
    updateLangIndicator() {
        const indicator = document.getElementById("currentLang");
        if (indicator) indicator.textContent = this.lang.toUpperCase();
    }
}


/* -------------------------
   Initialization & integration with app.toggleLanguage
   ------------------------- */

function initAdbuilderTranslator() {
    if (window.adbuilderTranslator) return;
    const maxPics = app?.adbuilder?.maxPictures || 16;
    window.adbuilderTranslator = new AdbuilderTranslator(maxPics);
    adbuilderTranslator.applyTranslations();

    // const langButton = document.querySelector("button[onclick='app.toggleLanguage()']");
    // if (langButton) {
    //     langButton.addEventListener("click", e => {
    //         e.preventDefault();
    //         adbuilderTranslator.toggleLanguage();
    //     });
    // }

    console.log("🈶 Adbuilder-Übersetzer initialisiert:", adbuilderTranslator.lang);
}

// robust init - wait for app to exist
function initAdbuilder() {
    if (!window.app) {
        // app not ready yet; try again soon
        setTimeout(initAdbuilder, 250);
        return;
    }

    // instantiate adbuilder once
    if (!app.adbuilder) {
        app.adbuilder = new Adbuilder();
        if (typeof app.copyMethodsFromManager === "function") {
            app.copyMethodsFromManager(app.adbuilder);
        }
        console.log("✅ Adbuilder instanziiert");
    }

    // load HTML section (if container exists)
    if (typeof app.adbuilder.loadAdbuilderSection === "function") {
        app.adbuilder.loadAdbuilderSection().catch(err => console.warn("loadAdbuilderSection failed:", err));
    }

    initAdbuilderTranslator();

    // wrap global toggleLanguage safely if available
    if (window.app && typeof app.toggleLanguage === "function" && !app._adbuilderToggleWrapped) {
        const original = app.toggleLanguage.bind(app);
        app.toggleLanguage = function () {
            original();
            // let core updateTranslations run (if exists)
            try { document.dispatchEvent(new Event("languageChanged")); } catch (e) { }
            // apply adbuilder translations
            if (app.adbuilder && typeof app.adbuilder.applyAdbuilderTranslations === "function") {
                app.adbuilder.currentLang = localStorage.getItem("language") || app.adbuilder.currentLang;
                app.adbuilder.applyAdbuilderTranslations();
            }
            if (window.adbuilderTranslator) {
                const currentLang = localStorage.getItem("language") || adbuilderTranslator.lang;
                adbuilderTranslator.toggleLanguage(currentLang);
            }
            console.log("🌐 Sprache gewechselt → Seite & Adbuilder aktualisiert");
        };
        app._adbuilderToggleWrapped = true;
    }
}

// start
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAdbuilder);
} else {
    initAdbuilder();
}
