class Adbuilder extends KleinManagerCore {
    constructor() {
        const maxPictures = 16;

        super();
        this.refreshAds();
        this.clearAdForm();
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
                minPicture: "Please select atleast one picture to upload!",
                loadPreview: "Loading Preview"
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
                noPicturesSel: "No Pictures selected",
                loadThumbnail: "Thumbnail(s) geladen",
                minPicture: "Mindestens ein Bild zum Hochladen auswählen",
                loadPreview: "Lade Vorschau"

            } //sample: this.customTranslations[this.currentLang].noPreview
        };    //sample: console.error(`${this.currentLang === "en" ? "No Categories found" : "Keine Kategorien gefunden"}`);

        // Sprache aus localStorage lesen
        this.currentLang = localStorage.getItem("language") || "en";

        // Observer für Sprachwechsel registrieren
        document.addEventListener("languageChanged", () => this.applyAdbuilderTranslations());
    }

    applyAdbuilderTranslations() {
        const t = this.customTranslations[this.currentLang];

        const elements = {
            titleLabel: document.querySelector("label[for='title']"),
            descriptionLabel: document.querySelector("label[for='description']"),
            categoryLabel: document.querySelector("label[for='category']"),
            priceLabel: document.querySelector("label[for='price']"),
            priceTypeLabel: document.querySelector("label[for='price_type']"),
            sell_directlyLabel: document.querySelector("label[for='sell_directly']"),
            shippingLabel: document.querySelector("#shipping_options label.font-bold"),
            saveButton: document.querySelector("#save_adfile"),
            loadButton: document.querySelector("#load_adfile"),
            clearButton: document.querySelector("#clear_adfile"),
            previewButton: document.querySelector("#uploadButton"),
        };

        if (elements.titleLabel) elements.titleLabel.textContent = t.title;
        if (elements.descriptionLabel) elements.descriptionLabel.textContent = t.description;
        if (elements.categoryLabel) elements.categoryLabel.textContent = t.category;
        if (elements.priceLabel) elements.priceLabel.textContent = t.price;
        if (elements.priceTypeLabel) elements.priceTypeLabel.textContent = t.priceType;
        if (elements.sell_directlyLabel) elements.sell_directlyLabel.textContent = t.sell_directly;
        if (elements.shippingLabel) elements.shippingLabel.textContent = t.shipping;

        if (elements.saveButton) elements.saveButton.textContent = t.save;
        if (elements.loadButton) elements.loadButton.textContent = t.load;
        if (elements.clearButton) elements.clearButton.textContent = t.clear;
        if (elements.previewButton) elements.previewButton.textContent = t.preview;
    }
    loadAdBuilder() {
        this.applyAdbuilderTranslations();
        this.loadCategories();
    }
    async loadCategories() {
        const categorySelect = document.getElementById("category");
        const res = await fetch("/api/v1/adbuilder/categories", { method: "GET" });
        const data = await res.json();
        categorySelect.innerHTML = "";
        if (data.error) {
            console.error(this.customTranslations[this.currentLang].errorCategory, data.error);
            return;
        }
        if (!data.categories || data.categories.length === 0) {
            console.error(this.customTranslations[this.currentLang].noCategory);
            return;
        }

        data.categories.forEach(category => {
            const option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }
    async upload_images() {
        const files = document.getElementById("Images").files;
        const title = document.getElementById("title").value.trim();
        if (!title) {
            alert(`${this.customTranslations[this.currentLang].alert_noTitle}`);
            return;
        }
        if (files.length > maxPictures) {
            alert(this.customTranslations[this.currentLang].maxPictures);
            return;
        }
        const formData = new FormData();
        formData.append("title", title);
        for (let file of files) {
            formData.append("files", file);
        }
        try {
            const response = await fetch("/api/v1/adbuilder/upload_images", {
                method: "POST",
                body: formData
            });
            const data = await response.json();

            if (data.uploaded && data.uploaded.length > 0) {
                console.log(`✅ ${data.uploaded.length} ${this.customTranslations[this.currentLang].pictures} ${data.target_dir}`);
                this.loadThumbnails(title);
            } else {
                console.error(`${this.customTranslations[this.currentLang].errorUpload}: ${data}`);
            }
        } catch (err) {
            console.error(`${this.customTranslations[this.currentLang].errorUpload}: ${err}`);
        }
    }
    async updateImageList() {
        const files = document.getElementById("Images").files;
        const imageList = document.getElementById("imageList");
        imageList.innerHTML = "";
        try {
            if (!files.length) {
                imageList.innerHTML = `<li class='italic text-gray-400'>${this.customTranslations[this.currentLang].noPictures}</li>`;
                return;
            }
            Array.from(files).forEach(file => {
                const li = document.createElement("li");
                li.textContent = file.name;
                li.className = "border-gray-700 py-0.5 text-gray-100";
                imageList.appendChild(li);
            });
            console.log(`${this.customTranslations[this.currentLang].infoImageList}`);
        }
        catch (err) {
            console.error(`${this.customTranslations[this.currentLang].infoImageList}`);
        }
    }
    async loadAdFile() {
        const selectedFile = document.querySelector('input[name="adsFile"]:checked')?.value;
        try {
            const res = await fetch(`/api/v1/adbuilder/load_ad`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: selectedFile })
            });
            const data = await res.json();
            if (data.error) {
                console.error(`${this.customTranslations[this.currentLang].errorAdLoading}: ${data.error}`);
                return;
            }
            document.getElementById("title").value = data.title || "";
            document.getElementById("description").value = data.description || "";
            document.getElementById("category").value = data.category || "";
            document.getElementById("price").value = data.price || "";
            document.getElementById("sell_directly").checked = data.sell_directly || false;
            if (data.price_type) {
                const priceTypeSelect = document.getElementById("price_type");
                if (priceTypeSelect) priceTypeSelect.value = data.price_type;
            }
            if (Array.isArray(data.shipping_options)) {
                document
                    .querySelectorAll("#shipping_options input[type='checkbox']")
                    .forEach(cb => {
                        cb.checked = data.shipping_options.includes(cb.value);
                    });
            }
            if (data.shipping_type) {
                const shippingTypeSelect = document.getElementById("shipping_type");
                if (shippingTypeSelect) {
                    const cleanValue = data.shipping_type.trim().toUpperCase();
                    shippingTypeSelect.value = cleanValue;
                }
            }
            this.updateImageListFromData(data.images);
            const thumbsDiv = document.getElementById("thumbnails-container");
            thumbsDiv.innerHTML = "";
            thumbsDiv.classList.remove("hidden");
            if (Array.isArray(data.images) && data.images.length > 0) {
                const safeTitle = data.title.replace(/[^a-zA-Z0-9_-]/g, "_");
                data.images.forEach(imgPath => {
                    const fileName = imgPath.split(/[\\/]/).pop();
                    const img = document.createElement("img");
                    img.src = `/ads/pics/${safeTitle}/${fileName}`;
                    img.alt = fileName;
                    img.className =
                        "h-36 w-auto object-cover rounded-md border border-gray-600 cursor-pointer hover:scale-105 transition-transform";
                    img.onclick = () => {
                        const overlay = document.createElement("div");
                        overlay.className =
                            "fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50";
                        overlay.onclick = () => overlay.remove();
                        const largeImg = document.createElement("img");
                        largeImg.src = img.src;
                        largeImg.className =
                            "max-h-[90vh] max-w-[90vw] rounded-xl shadow-lg border border-gray-700";
                        overlay.appendChild(largeImg);
                        document.body.appendChild(overlay);
                    };
                    thumbsDiv.appendChild(img);
                });
            } else {
                thumbsDiv.innerHTML =
                    `<p class='text-gray-400 italic w-full text-center'>${this.customTranslations[this.currentLang].noPreview}</p>`;
            }
            console.log(`${this.customTranslations[this.currentLang].infoThumbnail}`);

        } catch (err) {
            console.error(`${this.customTranslations[this.currentLang].errorThumbnail}: ${err}`);
        }
    }
    updateImageListFromData(images = []) {
        const imageList = document.getElementById("imageList");
        imageList.innerHTML = "";
        if (!Array.isArray(images) || images.length === 0) {
            imageList.innerHTML =
            `<li class='italic text-gray-400'>${this.customTranslations[this.currentLang].noPictures}.</li>`;
            console.error(`${this.customTranslations[this.currentLang].noPictures}`);
            return;
        }
        images.forEach(imgPath => {
            const fileName = imgPath.split(/[\\/]/).pop();
            const li = document.createElement("li");
            li.textContent = fileName;
            li.className = "border-gray-700 py-0.5 text-gray-100";
            imageList.appendChild(li);
        });
        console.log(`${images.length} ${this.customTranslations[this.currentLang].loadPictures}`);
    }
    async showLocalThumbnails() {
        const files = document.getElementById("Images").files;
        const thumbsContainerId = "thumbnails-container";
        const thumbsDiv = document.getElementById("thumbnails-container");
        thumbsDiv.classList.remove("hidden");
        thumbsDiv.innerHTML = "";
        if (!files.length) {
            thumbsDiv.innerHTML = `<p class='text-gray-400 italic'>${this.customTranslations[this.currentLang].noPicturesSel}</p>`;
            thumbsDiv.classList.add("hidden");
            return;
        }
        Array.from(files).forEach(file => {
            if (!file.type.startsWith("image/")) {
                return;
            }
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

        console.log(`${files.length} ${this.customTranslations[this.currentLang].loadThumbnail}.`);
    }
    async upload_images() {
        const files = document.getElementById("Images").files;
        const title = document.getElementById("title").value.trim();
        if (!title) {
            alert(`${this.customTranslations[this.currentLang].alert_noTitle}.`);
            return;
        }
        if (!files.length) {
            alert(`${this.customTranslations[this.currentLang].minPicture}`);
            return;
        }
        if (files.length > maxPictures) {
            alert(`${this.customTranslations[this.currentLang].maxPictures}.`);
            return;
        }
        const formData = new FormData();
        formData.append("title", title);
        for (let file of files) {
            formData.append("files", file);
        }
        try {
            const response = await fetch("/api/v1/adbuilder/upload_images", {
                method: "POST",
                body: formData
            });
            const data = await response.json();
            if (data.uploaded && data.uploaded.length > 0) {
                console.log(`✅ ${data.uploaded.length} ${this.customTranslations[this.currentLang].pictures} ${data.target_dir}`);
               
            } else {
                console.error(`${this.customTranslations[this.currentLang].errorUpload}: ${data}`);
            }
        } catch (err) {
            console.error(`${this.customTranslations[this.currentLang].errorUpload}: ${err}`);
        }
    }
    async loadThumbnails(title) {
        const files = document.getElementById("Images").files;
        const thumbsContainerId = "thumbnails-container";
        let thumbsDiv = document.getElementById(thumbsContainerId);
        console.log(files);
        if (!thumbsDiv) {
            const picturesDiv = document.getElementById("pictures");
            thumbsDiv = document.createElement("div");
            thumbsDiv.id = thumbsContainerId;
            thumbsDiv.className = "flex overflow-x-auto gap-2 mt-3 p-2 bg-gray-800 rounded-lg h-40";
            picturesDiv.appendChild(thumbsDiv);
        }
        thumbsDiv.innerHTML = `<p class='text-gray-400 italic'>${this.customTranslations[this.currentLang].loadPreview}...</p>`;
        try {
            const response = await fetch(`/api/v1/adbuilder/images?title=${encodeURIComponent(title)}`);
            const data = await response.json();
            thumbsDiv.innerHTML = "";
            if (!data.images || data.images.length === 0) {
                thumbsDiv.innerHTML = `<p class='text-gray-500 italic'>${this.customTranslations[this.currentLang].noPictures}.</p>`;
                return;
            }
            data.images.forEach(filename => {
                const img = document.createElement("img");
                img.src = `/ads/pics/${data.title}/${filename}`;
                img.alt = filename;
                img.className = "h-304 w-auto object-cover rounded-md border border-gray-600 cursor-pointer hover:scale-105 transition-transform";
                thumbsDiv.appendChild(img);
            });
        } catch (err) {
            console.error(`${this.customTranslations[this.currentLang].errorThumbnail}: ${err}`);
            thumbsDiv.innerHTML = `<p class='text-red-400'>${this.customTranslations[this.currentLang].errorThumbnail}.</p>`;
        }
    }
    async saveAdFile() {
        try {
            let titl = document.getElementById("title").value.trim();
            const title = titl.replace(/[^a-zA-Z0-9_-]/g, "_");
            const description = document.getElementById("description").value;
            const category = document.getElementById("category").value;
            const price = document.getElementById("price").value;
            const price_type = document.getElementById("price_type").value;
            const sell_directly = document.getElementById("sell_directly").checked;
            const shipping_options = Array.from(
                document.querySelectorAll("#shipping_options input[type='checkbox']:checked")
            ).map(cb => cb.value);
            const images = document.getElementById("Images").files;
            const imageNames = Array.from(images).map(f => f.name);
            if (!title) {
                return alert(`${this.customTranslations[this.currentLang].alert_noTitle}`);
            }
            const shipping_type = document.getElementById("shipping_type").value;
            const builderRes = await fetch("/api/v1/adbuilder/builder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: title,
                    description: description,
                    category: category,
                    price: price,
                    price_type: price_type,
                    sell_directly: sell_directly,
                    shipping_options: shipping_options, // Array.from(document.querySelectorAll("#shipping_options input[type='checkbox']:checked")).map(cb => cb.value),
                    shipping_type: shipping_type,
                    images: imageNames
                })
            });
            const builderData = await builderRes.json();
            if (builderData.error) {
                console.error("Builder-Fehler:", builderData);
                alert(`${this.customTranslations[this.currentLang].errorAdSave}`);
                return;
            }
            if (images.length > 0) {
                const formData = new FormData();
                formData.append("title", title);
                Array.from(images).forEach(f => formData.append("files", f));
                const uploadRes = await fetch("/api/v1/adbuilder/upload_images", {
                    method: "POST",
                    body: formData
                });
                const uploadData = await uploadRes.json();
                if (uploadData.error) {
                    alert(`${this.customTranslations[this.currentLang].errorUpload}: ${uploadData}`);
                    return;
                }
            }
            console.log(`${this.customTranslations[this.currentLang].infoAdSaved}: ${builderData}`);
        } catch (err) {
            console.error(`${this.customTranslations[this.currentLang].errorAdSave}: ${err}`);
        }
    }
    async loadAdFile() {
        const selectedFile = document.querySelector('input[name="adsFile"]:checked')?.value;
        try {
            const res = await fetch(`/api/v1/adbuilder/load_ad`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: selectedFile })
            });

            const data = await res.json();
            if (data.error) {
                console.error(`${this.customTranslations[this.currentLang].errorAdLoading}: ${data.error}`);
                return;
            }
            console.log(`${this.customTranslations[this.currentLang].loadAdFile}: ${data}`);
            
            document.getElementById("title").value = data.title || "";
            document.getElementById("description").value = data.description || "";
            document.getElementById("category").value = data.category || "";
            document.getElementById("price").value = data.price || "";
            document.getElementById("sell_directly").checked = data.sell_directly || false;
            if (data.price_type) {
                const priceTypeSelect = document.getElementById("price_type");
                if (priceTypeSelect) priceTypeSelect.value = data.price_type;
            }
            if (Array.isArray(data.shipping_options)) {
                document
                    .querySelectorAll("#shipping_options input[type='checkbox']")
                    .forEach(cb => {
                        cb.checked = data.shipping_options.includes(cb.value);
                    });
            }
            if (data.shipping_type) {
                const shippingTypeSelect = document.getElementById("shipping_type");
                if (shippingTypeSelect) {
                    const cleanValue = data.shipping_type.trim().toUpperCase();
                    shippingTypeSelect.value = cleanValue;
                }
            }
            console.log(data.title);
            this.updateImageListFromData(data.images);
            const thumbsDiv = document.getElementById("thumbnails-container");
            thumbsDiv.innerHTML = "";
            thumbsDiv.classList.remove("hidden");

            if (Array.isArray(data.images) && data.images.length > 0) {
                const safeTitle = data.title.replace(/[^a-zA-Z0-9_-]/g, "_");
                data.images.forEach(imgPath => {
                    const fileName = imgPath.split(/[\\/]/).pop();
                    const img = document.createElement("img");
                    img.src = `/ads/pics/${safeTitle}/${fileName}`;
                    img.alt = fileName;
                    img.className =
                        "h-36 w-auto object-cover rounded-md border border-gray-600 cursor-pointer hover:scale-105 transition-transform";
                    img.onclick = () => {
                        const overlay = document.createElement("div");
                        overlay.className =
                            "fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50";
                        overlay.onclick = () => overlay.remove();
                        const largeImg = document.createElement("img");
                        largeImg.src = img.src;
                        largeImg.className =
                            "max-h-[90vh] max-w-[90vw] rounded-xl shadow-lg border border-gray-700";
                        overlay.appendChild(largeImg);
                        document.body.appendChild(overlay);
                    };
                    thumbsDiv.appendChild(img);
                });
            } else {
                thumbsDiv.innerHTML =
                    `<p class='text-gray-400 italic w-full text-center'>${this.customTranslations[this.currentLang].noPreview}</p>`;
            }

            console.log(`${this.customTranslations[this.currentLang].infoImThumb}`);

        } catch (err) {
            console.error(`${this.customTranslations[this.currentLang].errorAdLoading}: ${err}`);
        }
    }
    async clearAdForm() {
        const textFields = ["title", "description", "price"];
        textFields.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = "";
        });
        document.querySelectorAll("#shipping_options input[type='checkbox']").forEach(cb => {
            cb.checked = false;
        });
        const sellDirectly = document.getElementById("sell_directly");
        if (sellDirectly) sellDirectly.checked = false;
        const dropdowns = ["price_type", "shipping_type"];
        dropdowns.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.selectedIndex = 0;
        });
        if (this.loadCategories) {
            await this.loadCategories();
            console.log(`${this.customTranslations[this.currentLang].infoCategories}.`);
        }
        const imageList = document.getElementById("imageList");
        if (imageList) {
            imageList.innerHTML = `<li class='italic text-gray-400'>${this.customTranslations[this.currentLang].noPicturesSel}</li>`;
        }
        const thumbsDiv = document.getElementById("thumbnails-container");
        if (thumbsDiv) {
            thumbsDiv.innerHTML = `<p class='text-gray-400 italic w-full text-center'>${this.customTranslations[this.currentLang].noPreview}</p>`;
            thumbsDiv.classList.add("hidden");
        }
        const fileInput = document.getElementById("Images");
        if (fileInput) fileInput.value = "";

        console.log(`${this.customTranslations[this.currentLang].infoFormReset}`);
    }

    async updateImageList(title = null) {
        const imageList = document.getElementById("imageList");
        imageList.innerHTML = "";
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
            console.error(`${this.customTranslations[this.currentLang].errorAdLoading}: ${err}`);
            imageList.innerHTML =
                `<li class='${this.customTranslations[this.currentLang].errorAdLoading}</li>`;
        }
    }

    async refreshAds() {
        try {
            const container = document.getElementById("adsFileContainer");
            if (!container) return;

            setStatus("Reloading Ads...");
            const response = await fetch("/api/v1/adbuilder/list_files", {
                method: "GET"
            });
            const data = await response.json();
            container.innerHTML = "";
            if (!data.files || data.files.length === 0) {
                container.innerHTML = `<p class='text-gray-400'>${this.customTranslations[this.currentLang].infoNoAds}</p>`;
                return;
            }
            data.files.forEach((file, index) => {
                const label = document.createElement("label");
                label.className = "flex items-center space-x-2 p-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-600";
                const radio = document.createElement("input");
                radio.type = "radio";
                radio.name = "adsFile";
                radio.value = file;
                if (index === 0) radio.checked = true;
                const span = document.createElement("span");
                span.textContent = file;
                label.appendChild(radio);
                label.appendChild(span);
                container.appendChild(label);
            });
            console.log(`${this.customTranslations[this.currentLang].loadAdFile}: ${data.files}`);

        } catch (error) {
            console.error(`${this.customTranslations[this.currentLang].errorLoading}: ${error}`);
            document.getElementById("adsFileContainer").innerHTML =
                `<p class='text-red-400'>${this.customTranslations[this.currentLang].errorLoading}.</p>`;
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    if (window.app) {
        app.adbuilder = new Adbuilder();
        app.copyMethodsFromManager(app.adbuilder);
    }
});
// === Erweiterung der Sprachumschaltung (Kompatibel mit core.js) ===
document.addEventListener("DOMContentLoaded", () => {
    if (window.app && typeof app.toggleLanguage === "function") {
        // Originalfunktion mit korrektem Kontext sichern
        const originalToggleLanguage = app.toggleLanguage.bind(app);

        // Neue Wrapperfunktion definieren
        app.toggleLanguage = function() {
            // 1️⃣ Originale Sprachumschaltung korrekt ausführen
            originalToggleLanguage();

            // 2️⃣ Event auslösen, damit andere Module (wie Adbuilder) reagieren
            document.dispatchEvent(new Event("languageChanged"));

            // 3️⃣ Adbuilder-Übersetzungen aktualisieren
            if (app.adbuilder && typeof app.adbuilder.applyAdbuilderTranslations === "function") {
                app.adbuilder.applyAdbuilderTranslations();
            }

            console.log("🌐 Sprache gewechselt → Seite & Adbuilder aktualisiert");
        };
    } else {
        console.warn("⚠️ app.toggleLanguage() wurde nicht gefunden");
    }
});

// === Eigene i18n-Logik nur für den Adbuilder ===
class AdbuilderTranslator {
    constructor() {
        this.lang = localStorage.getItem("language") || "en";
        this.translations = {
            en: {
                "adbuilder.formTitle":"Create Ad",
                "adbuilder.title": "Title",
                "adbuilder.description": "Description",
                "adbuilder.category": "Category",
                "adbuilder.price": "Price (€)",
                "adbuilder.priceType": "Price Type:",
                "adbuilder.priceType.default": "---select---",
                "adbuilder.priceType.negotiable": "Negotiable",
                "adbuilder.priceType.fixed": "Fixed",
                "adbuilder.priceType.giveaway": "Giveaway",
                "adbuilder.sell_directly": "Sell Directly",
                "adbuilder.shipping": "Shipping Options:",
                "adbuilder.shipping_type.default":"---select---",
                "adbuilder.shipping_type.pickup":"Pickup",
                "adbuilder.shipping_type.shipping":"Shipping",
                "adbuilder.shipping_type.not-applicable":"Not Applicable",
                "adbuilder.actions.save": "Save",
                "adbuilder.actions.load": "Load",
                "adbuilder.actions.clear": "Clear",
                "adbuilder.actions.preview": "Preview",
                "adbuilder.images": "Images:",
                "adbuilder.noImages":"No pictures selected",
                "adbuilder.templates":"Select template:",
            },
            de: {
                "adbuilder.formTitle":"Erstelle Anzeige",
                "adbuilder.title": "Titel",
                "adbuilder.description": "Beschreibung",
                "adbuilder.category": "Kategorie",
                "adbuilder.price": "Preis (€)",
                "adbuilder.priceType": "Preistyp:",
                "adbuilder.priceType.default": "---Auswählen---",
                "adbuilder.priceType.negotiable": "Verhandlungsbasis",
                "adbuilder.priceType.fixed": "Festpreis",
                "adbuilder.priceType.giveaway": "Zu Verschenken",
                "adbuilder.sell_directly": "Sofortkauf",
                "adbuilder.shipping": "Versandoptionen:",
                "adbuilder.shipping_type.default":"---Auswählen---",
                "adbuilder.shipping_type.pickup":"Abholung",
                "adbuilder.shipping_type.shipping":"Versand",
                "adbuilder.shipping_type.not-applicable":"Keine Angabe",
                "adbuilder.actions.save": "Speichern",
                "adbuilder.actions.load": "Laden",
                "adbuilder.actions.clear": "Leeren",
                "adbuilder.actions.preview": "Vorschau",
                "adbuilder.images": "Bilder:",
                 "adbuilder.noImages":"Keine Bilder ausgewählt",
                 "adbuilder.templates":"Vorlage auswählen:",
            }
        };
    }

    // Sprache umschalten
    toggleLanguage() {
        this.lang = this.lang === "en" ? "de" : "en";
        localStorage.setItem("language", this.lang);
        this.applyTranslations();
        this.updateLangIndicator();
    }

    // Übersetzungen anwenden
    applyTranslations() {
        const dict = this.translations[this.lang];
        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.getAttribute("data-i18n");
            if (dict[key]) el.textContent = dict[key];
        });
        document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
            const key = el.getAttribute("data-i18n-placeholder");
            if (dict[key]) el.placeholder = dict[key];
        });
    }

    // Sprachkürzel im Button aktualisieren (optional)
    updateLangIndicator() {
        const indicator = document.getElementById("currentLang");
        if (indicator) indicator.textContent = this.lang.toUpperCase();
    }
}
function initAdbuilderTranslator() {
    if (window.adbuilderTranslator) return; // Doppelte Init vermeiden
    window.adbuilderTranslator = new AdbuilderTranslator();
    adbuilderTranslator.applyTranslations();

    const langButton = document.querySelector("button[onclick='app.toggleLanguage()']");
    if (langButton) {
        langButton.addEventListener("click", e => {
            e.preventDefault();
            adbuilderTranslator.toggleLanguage();
        });
    }

    console.log("🈶 Adbuilder-Übersetzer initialisiert:", adbuilderTranslator.lang);
}

// Wenn DOM schon geladen ist → direkt starten
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAdbuilderTranslator);
} else {
    initAdbuilderTranslator();
}
