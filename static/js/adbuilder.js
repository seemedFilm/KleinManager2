class Adbuilder extends KleinManagerCore {
    constructor() {
        super();
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
            alert("Bitte gib einen Titel ein!");
            return;
        }
        if (!files.length) {
            alert("Bitte wähle mindestens ein Bild aus!");
            return;
        }
        if (files.length > 16) {
            alert("Maximal 16 Bilder erlaubt!");
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
                this.loadThumbnails(title);
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

    saveAdFile() {
        try {
            const title = document.getElementById("title").value;
            fetch("/api/v1/adbuilder/builder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: document.getElementById("title").value,
                    description: document.getElementById("description").value,
                    category: document.getElementById("category").value,
                    price: document.getElementById("price").value,
                    price_type: document.getElementById("price_type").value,
                    sell_directly: document.getElementById("sell_directly").checked,
                    shipping_options: document.getElementById("shipping_options").value,
                })
            });
            console.log(title);
        } catch (error) {
            console.log(`Error: ${error}`);
        }
    }
    loadAdFile() {
        try {
            
        } catch (error) {
            
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    if (window.app) {
        app.adbuilder = new Adbuilder();
        app.copyMethodsFromManager(app.adbuilder);
    }
});
