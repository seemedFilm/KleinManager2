class Adbuilder extends KleinManagerCore {
    constructor() {
        super();

        // config
        this.maxPictures = 16;
        this.currentLang = localStorage.getItem("language") || "en";

        // translations used as fallback for elements not using data-i18n
        const maxPictures = this.maxPictures;
        this.customTranslations = {
            en: {
                title: "Title",
                description: "Description",
                category: "Category",
                price: "Price (€)",
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
                minPicture: "Please select at least one picture to upload!",
                loadPreview: "Loading Preview",
                infoFormReset: "Form reset",
                infoCategories: "Categories loaded",
                infoImThumb: "Image thumbnails processed",
                infoNoAds: "No ads found",
                loadAdFile: "Ad files loaded",
            },
            de: {
                title: "Titel",
                description: "Beschreibung",
                category: "Kategorie",
                price: "Preis (€)",
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
                noPreview: "Keine Vorschau verfügbar",
                noPicturesSel: "Keine Bilder ausgewählt",
                loadThumbnail: "Thumbnail(s) geladen",
                minPicture: "Mindestens ein Bild zum Hochladen auswählen",
                loadPreview: "Lade Vorschau",
                infoFormReset: "Formular zurückgesetzt",
                infoCategories: "Kategorien geladen",
                infoImThumb: "Thumbnails verarbeitet",
                infoNoAds: "Keine Anzeigen gefunden",
                loadAdFile: "Anzeigen-Dateien geladen",
            }
        };

        // react to app language change event if fired
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
        const t = this.customTranslations[this.currentLang] || this.customTranslations.en;
        // fallback for elements that don't use data-i18n but we still want translated text
        const map = [
            { selector: "label[for='title']", key: "title" },
            { selector: "label[for='description']", key: "description" },
            { selector: "label[for='category']", key: "category" },
            { selector: "label[for='price']", key: "price" },
            { selector: "label[for='price_type']", key: "priceType" },
            { selector: "label[for='sell_directly']", key: "sell_directly" },
            { selector: "#shipping_options label.font-bold", key: "shipping" },
            { selector: "#save_adfile", key: "save" },
            { selector: "#load_adfile", key: "load" },
            { selector: "#clear_adfile", key: "clear" },
            { selector: "#uploadButton", key: "preview" },
        ];
        map.forEach(m => {
            const el = document.querySelector(m.selector);
            if (el && t[m.key]) el.textContent = t[m.key];
        });

        // placeholders
        const placeholderMap = [
            { selector: "#title", key: "title" }
        ];
        placeholderMap.forEach(p => {
            const el = document.querySelector(p.selector);
            if (el && t[p.key]) el.placeholder = t[p.key];
        });
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
        const categorySelect = document.getElementById("category");
        if (!categorySelect) return;
        try {
            const res = await fetch("/api/v1/adbuilder/categories");
            const data = await res.json();
            categorySelect.innerHTML = "";
            if (data.error) {
                console.error(this.customTranslations[this.currentLang].errorCategory, data.error);
                return;
            }
            if (!Array.isArray(data.categories) || data.categories.length === 0) {
                console.warn(this.customTranslations[this.currentLang].noCategory);
                categorySelect.innerHTML = `<option value="">${this.customTranslations[this.currentLang].noCategory}</option>`;
                return;
            }
            data.categories.forEach(cat => {
                const opt = document.createElement("option");
                opt.value = cat;
                opt.textContent = cat;
                categorySelect.appendChild(opt);
            });
            console.log(this.customTranslations[this.currentLang].infoCategories);
        } catch (err) {
            console.error(this.customTranslations[this.currentLang].errorCategory, err);
        }
    }

    async refreshAds() {
        try {
            const container = document.getElementById("adsFileContainer");
            if (!container) return;
            const res = await fetch("/api/v1/adbuilder/list_files");
            const data = await res.json();
            container.innerHTML = "";
            if (!data.files || data.files.length === 0) {
                container.innerHTML = `<p class='text-gray-400'>${this.customTranslations[this.currentLang].infoNoAds}</p>`;
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
            console.log(`${this.customTranslations[this.currentLang].loadAdFile}: ${data.files}`);
        } catch (err) {
            console.error("refreshAds error:", err);
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
            console.error(this.customTranslations[this.currentLang].errorThumbnail, err);
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
                alert(this.customTranslations[this.currentLang].alert_noTitle);
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
                console.error("builder error:", data);
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

            console.log(this.customTranslations[this.currentLang].alert_saved, data);
            alert(this.customTranslations[this.currentLang].alert_saved);

            // refresh ad list / thumbnails
            await this.refreshAds();
            await this.loadThumbnails(title).catch(() => {});
        } catch (err) {
            console.error("saveAdFile error:", err);
            alert(this.customTranslations[this.currentLang].errorUpload || "Save error");
        }
    }

    async loadAdFile() {
        const selectedFile = document.querySelector('input[name="adsFile"]:checked')?.value;
        if (!selectedFile) {
            console.warn("No ad selected to load");
            return;
        }
        try {
            const res = await fetch("/api/v1/adbuilder/load_ad", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: selectedFile })
            });
            const data = await res.json();
            if (data.error) {
                console.error(this.customTranslations[this.currentLang].errorAdLoading, data.error);
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
            await this.loadThumbnails(data.title).catch(() => {});

            console.log(this.customTranslations[this.currentLang].infoImThumb);
        } catch (err) {
            console.error(this.customTranslations[this.currentLang].errorAdLoading, err);
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
            await this.loadCategories().catch(() => {});
            const imageList = document.getElementById("imageList");
            if (imageList) imageList.innerHTML = `<li class='italic text-gray-400'>${this.customTranslations[this.currentLang].noPicturesSel}</li>`;

            const thumbsDiv = document.getElementById("thumbnails-container");
            if (thumbsDiv) {
                thumbsDiv.innerHTML = `<p class='text-gray-400 italic w-full text-center'>${this.customTranslations[this.currentLang].noPreview}</p>`;
                thumbsDiv.classList.add("hidden");
            }

            const fileInput = document.getElementById("Images");
            if (fileInput) fileInput.value = "";

            console.log(this.customTranslations[this.currentLang].infoFormReset);
        } catch (err) {
            console.warn("clearAdForm error:", err);
        }
    }
}

/* -------------------------
   AdbuilderTranslator (modular i18n for adbuilder)
   ------------------------- */
class AdbuilderTranslator {
    constructor() {
        this.lang = localStorage.getItem("language") || "en";
        this.translations = {
            en: {
                 title: "Title",
                description: "Description",
                category: "Category",
                price: "Price (â‚¬)",
                priceType: "Price Type",
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
                errorThumbnail: "Thumbnail loading error",
                noPictures: "No Pictures found",
                loadPictures: "saved picture(s) loaded into the list",
                noPreview: "No preview available",
                noPicturesSel: "No Pictures selected",
                loadThumbnail: "thumbnail(s) loaded",
                minPicture: "Please select atleast one picture to upload!",
                loadPreview: "Loading Preview",
				errorAdSave: "Error during Ad saving",
				infoAdSaved: "Ad successfully saved",
				loadAdFile: "Ad file loaded",
				infoImThumb: "Images and thumbnails loaded",
				infoCategories: "Categories loaded",
				infoFormReset: "Form reset",
				errorImgLoad: "Error during image loading",
				errorLoading: "Error during loading",
				infoNoAds: "No Ad templates found"
            },
            de: {
                title: "Titel",
                description: "Beschreibung",
                category: "Kategorie",
                price: "Preis (â‚¬)",
                priceType: "Preistyp",
                shipping: "Versandoptionen",
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
                errorThumbnail: "Laden Thumbnail(s) Fehler",
                noPictures: "Keine Bilder gefunden",
                loadPictures: "Bild(er) in die Liste geladen",
                noPreview: "Keine Vorschau verfÃ¼gbar",
                noPicturesSel: "Keine Bilder ausgewÃ¤hlt",
                loadThumbnail: "Thumbnail(s) geladen",
                minPicture: "Mindestens ein Bild zum Hochladen auswÃ¤hlen",
                loadPreview: "Lade Vorschau",
				errorAdSave: "Fehler beim Anzeigen speichern",
				infoAdSaved: "Anzeige gespeichert",
				loadAdFile: "Anzeigen Vorlage geladen",
				infoImThumb: "Bilder und Vorschaubilder geladen.",
				infoCategories: "Kategorien geladen",
				infoFormReset: "Formular zurÃ¼ckgesetzt",
				errorImgLoad: "Fehler beim Bilder laden",
				errorLoading: "Fehler beim laden",
				infoNoAds: "Keine Anzeigen Vorlagen gefunden"
            }
        };
    }

    toggleLanguage() {
        this.lang = this.lang === "en" ? "de" : "en";
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
        document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
            const key = el.getAttribute("data-i18n-placeholder");
            if (dict[key]) el.placeholder = dict[key];
        });
    }

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
    window.adbuilderTranslator = new AdbuilderTranslator();
    adbuilderTranslator.applyTranslations();

    // attach to the global language button if present
    const langButton = document.querySelector("button[onclick='app.toggleLanguage()']");
    if (langButton) {
        // prevent adding multiple handlers
        if (!langButton._adbuilderLangHooked) {
            langButton.addEventListener("click", (e) => {
                e.preventDefault();
                adbuilderTranslator.toggleLanguage();
            });
            langButton._adbuilderLangHooked = true;
        }
    }
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
            try { document.dispatchEvent(new Event("languageChanged")); } catch (e) {}
            // apply adbuilder translations
            if (app.adbuilder && typeof app.adbuilder.applyAdbuilderTranslations === "function") {
                app.adbuilder.currentLang = localStorage.getItem("language") || app.adbuilder.currentLang;
                app.adbuilder.applyAdbuilderTranslations();
            }
            if (window.adbuilderTranslator) {
                // ensure translator uses same state
                adbuilderTranslator.lang = localStorage.getItem("language") || adbuilderTranslator.lang;
                adbuilderTranslator.applyTranslations();
                adbuilderTranslator.updateLangIndicator();
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
