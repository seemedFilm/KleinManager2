class Adbuilder extends KleinManagerCore {
    constructor() {
        super();
        this.refreshAds();
        this.clearAdForm();
    }
    

    loadAdBuilder() {
        console.log("AdBuilder geladen");
        this.loadCategories();

    }

    async loadCategories() {
        const categorySelect = document.getElementById("category");
        const res = await fetch("/api/v1/adbuilder/categories", { method: "GET" });
        const data = await res.json();

        categorySelect.innerHTML = "";
        if (data.error) {
            console.error("Error fetching categories:", data.error);
            return;
        }
        if (!data.categories || data.categories.length === 0) {
            console.error("No categories found.");
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
            alert("Please enter a title name!");
            return;
        }
        if (files.length > 16) {
            alert("Only 16 pictures are allowed!");
            return;
        }
        console.log(files);
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
                console.log(`✅ ${data.uploaded.length} Pictures saved in ${data.target_dir}`);
                this.loadThumbnails(title);
            } else {
                console.error("Error during the upload:", data);
            }
        } catch (err) {
            console.error("Upload failed:", err);
        }
    }

    async updateImageList() {
        const files = document.getElementById("Images").files;
        const imageList = document.getElementById("imageList");

        imageList.innerHTML = "";

        if (!files.length) {
            imageList.innerHTML = "<li class='italic text-gray-400'>No pictures selected</li>";
            return;
        }

        Array.from(files).forEach(file => {
            const li = document.createElement("li");
            li.textContent = file.name;
            li.className = "border-gray-700 py-0.5 text-gray-100";
            imageList.appendChild(li);
        });

        console.log(`📂 ${files.length} File(s) in the list`);
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
                console.error("Error during the ad loading:", data.error);
                return;
            }

            console.log("Ad loaded:", data);
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
                    "<p class='text-gray-400 italic w-full text-center'>No preview available</p>";
            }

            console.log("Pictures and thumbnails updated successfully");

        } catch (err) {
            console.error("Error during the loading:", err);
        }
    }

    updateImageListFromData(images = []) {
        const imageList = document.getElementById("imageList");
        imageList.innerHTML = "";

        if (!Array.isArray(images) || images.length === 0) {
            imageList.innerHTML =
                "<li class='italic text-gray-400'>No saved pictures.</li>";
            console.log("No pictures found");
            return;
        }
        images.forEach(imgPath => {
            const fileName = imgPath.split(/[\\/]/).pop();
            const li = document.createElement("li");
            li.textContent = fileName;
            li.className = "border-gray-700 py-0.5 text-gray-100";
            imageList.appendChild(li);
        });

        console.log(`${images.length} saved picture(s) loaded into the list`);
    }
    async showLocalThumbnails() {
        const files = document.getElementById("Images").files;
        const thumbsContainerId = "thumbnails-container";
        const thumbsDiv = document.getElementById("thumbnails-container");
        thumbsDiv.classList.remove("hidden");
        thumbsDiv.innerHTML = "";
        if (!files.length) {
            thumbsDiv.innerHTML = "<p class='text-gray-400 italic'>No pictures selected</p>";
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

        console.log(`${files.length} thumbnails loaded.`);
    }
    async upload_images() {
        const files = document.getElementById("Images").files;
        const title = document.getElementById("title").value.trim();
        if (!title) {
            alert("Enter a title name!");
            return;
        }
        if (!files.length) {
            alert("Please select atleast one picture to upload!");
            return;
        }
        if (files.length > 16) {
            alert("Only 16 pictures are allowed!");
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
                console.log(`✅ ${data.uploaded.length} Bilder gespeichert in ${data.target_dir}`);
                alert("Bilder erfolgreich gespeichert!");
            } else {
                console.error("Fehler beim Upload:", data);
            }
        } catch (err) {
            console.error("Upload fehlgeschlagen:", err);
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
        thumbsDiv.innerHTML = "<p class='text-gray-400 italic'>Lade Vorschau...</p>";

        try {
            const response = await fetch(`/api/v1/adbuilder/images?title=${encodeURIComponent(title)}`);
            const data = await response.json();
            thumbsDiv.innerHTML = "";
            if (!data.images || data.images.length === 0) {
                thumbsDiv.innerHTML = "<p class='text-gray-500 italic'>Keine Bilder gefunden.</p>";
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
            console.error("Fehler beim Laden der Thumbnails:", err);
            thumbsDiv.innerHTML = "<p class='text-red-400'>Fehler beim Laden.</p>";
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
                return alert("Bitte Titel eingeben.");
            }
            const shipping_type = document.getElementById("shipping_type").value;

            // 2) Builder aufrufen — in JSON die Dateinamen (oder Pfade) übergeben
            // Verwende die Dateinamen aus dem Input (oder aus uploadData.uploaded wenn vorhanden)

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
                alert("Fehler beim Speichern der Anzeige.");
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
                    console.error("Upload-Fehler:", uploadData);
                    alert("Upload fehlgeschlagen.");
                    return;
                }
                console.log("Upload OK:", uploadData);
            }


            console.log("Anzeige gespeichert:", builderData);
        } catch (err) {
            console.error("saveAdFile Fehler:", err);
        }
    }
    async loadAdFile() {
        const selectedFile = document.querySelector('input[name="adsFile"]:checked')?.value;
        if (!selectedFile) {
            alert("Bitte eine Anzeige auswählen!");
            return;
        }

        try {
            const res = await fetch(`/api/v1/adbuilder/load_ad`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: selectedFile })
            });

            const data = await res.json();
            if (data.error) {
                console.error("Fehler beim Laden der Ad-Datei:", data.error);
                return;
            }

            console.log("✅ Ad-Datei geladen:", data);

            // === Basisdaten ===
            document.getElementById("title").value = data.title || "";
            document.getElementById("description").value = data.description || "";
            document.getElementById("category").value = data.category || "";
            document.getElementById("price").value = data.price || "";
            document.getElementById("sell_directly").checked = data.sell_directly || false;

            // === Preis-Typ ===
            if (data.price_type) {
                const priceTypeSelect = document.getElementById("price_type");
                if (priceTypeSelect) priceTypeSelect.value = data.price_type;
            }

            // === Versandoptionen ===
            if (Array.isArray(data.shipping_options)) {
                document
                    .querySelectorAll("#shipping_options input[type='checkbox']")
                    .forEach(cb => {
                        cb.checked = data.shipping_options.includes(cb.value);
                    });
            }

            // === Versand-Typ ===
            if (data.shipping_type) {
                const shippingTypeSelect = document.getElementById("shipping_type");
                if (shippingTypeSelect) {
                    const cleanValue = data.shipping_type.trim().toUpperCase();
                    shippingTypeSelect.value = cleanValue;
                }
            }
            console.log(data.title);
            // === 🔹 Jetzt: Bilderliste über updateImageList aktualisieren ===
            this.updateImageListFromData(data.images);


            // === Optional: Thumbnails anzeigen ===
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
                    "<p class='text-gray-400 italic w-full text-center'>Keine Vorschau verfügbar...</p>";
            }

            console.log("📸 Bilderliste und Thumbnails erfolgreich aktualisiert.");

        } catch (err) {
            console.error("❌ Fehler beim Laden der Ad-Datei:", err);
        }
    }
    async clearAdForm() {
        console.log("🧹 Formular wird zurückgesetzt...");

        // === Textfelder ===
        const textFields = ["title", "description", "price"];
        textFields.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = "";
        });

        // === Checkboxen ===
        document.querySelectorAll("#shipping_options input[type='checkbox']").forEach(cb => {
            cb.checked = false;
        });

        const sellDirectly = document.getElementById("sell_directly");
        if (sellDirectly) sellDirectly.checked = false;

        // === Dropdowns ===
        const dropdowns = ["price_type", "shipping_type"];
        dropdowns.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.selectedIndex = 0; // setzt auf erste Option (z. B. "-- auswählen --")
        });

        // === Kategorien neu laden ===
        if (this.loadCategories) {
            await this.loadCategories();
            console.log("📁 Kategorien neu geladen.");
        }

        // === Bilderliste + Thumbnails leeren ===
        const imageList = document.getElementById("imageList");
        if (imageList) {
            imageList.innerHTML = "<li class='italic text-gray-400'>Keine Bilder ausgewählt...</li>";
        }

        const thumbsDiv = document.getElementById("thumbnails-container");
        if (thumbsDiv) {
            thumbsDiv.innerHTML = "<p class='text-gray-400 italic w-full text-center'>Keine Vorschau geladen...</p>";
            thumbsDiv.classList.add("hidden");
        }

        // === File-Input zurücksetzen ===
        const fileInput = document.getElementById("Images");
        if (fileInput) fileInput.value = "";

        console.log("✅ Formular erfolgreich zurückgesetzt.");
    }

    async updateImageList(title = null) {
        const imageList = document.getElementById("imageList");
        imageList.innerHTML = "";

        let files = [];

        // 1️⃣ Wenn kein Titel angegeben → lokale Files aus FileInput
        if (!title) {
            files = Array.from(document.getElementById("Images").files);

            if (!files.length) {
                imageList.innerHTML =
                    "<li class='italic text-gray-400'>Keine Bilder ausgewählt...</li>";
                return;
            }

            files.forEach(file => {
                const li = document.createElement("li");
                li.textContent = file.name;
                li.className = "border-gray-700 py-0.5 text-gray-100";
                imageList.appendChild(li);
            });

            console.log(`📂 ${files.length} Datei(en) in der Liste (lokal).`);
            return;
        }

        // 2️⃣ Wenn ein Titel übergeben wurde → Bilder vom Server holen
        console.log(`🔍 Lade Bilder für Titel: ${title}`);
        try {
            const res = await fetch(`/api/v1/adbuilder/load_ad`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title })
            });

            const data = await res.json();

            if (data.error) {
                console.error("❌ Fehler beim Laden:", data.error);
                imageList.innerHTML =
                    "<li class='italic text-red-400'>Fehler beim Laden...</li>";
                return;
            }

            if (Array.isArray(data.images) && data.images.length > 0) {
                data.images.forEach(imgPath => {
                    const fileName = imgPath.split(/[\\/]/).pop(); // nur Dateiname
                    const li = document.createElement("li");
                    li.textContent = fileName;
                    li.className = "border-gray-700 py-0.5 text-gray-100";
                    imageList.appendChild(li);
                });
                console.log(`📂 ${data.images.length} Datei(en) geladen aus JSON.`);
            } else {
                imageList.innerHTML =
                    "<li class='italic text-gray-400'>Keine gespeicherten Bilder...</li>";
            }
        } catch (err) {
            console.error("❌ Fehler beim Abrufen der JSON:", err);
            imageList.innerHTML =
                "<li class='italic text-red-400'>Fehler beim Abrufen...</li>";
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
                container.innerHTML = "<p class='text-gray-400'>Keine Dateien gefunden.</p>";
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

            console.log("✅ Ads geladen:", data.files);

        } catch (error) {
            console.error("Fehler beim Laden der Dateien:", error);
            document.getElementById("adsFileContainer").innerHTML =
                "<p class='text-red-400'>Fehler beim Laden der Dateien.</p>";
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    if (window.app) {
        app.adbuilder = new Adbuilder();
        app.copyMethodsFromManager(app.adbuilder);
    }
});
