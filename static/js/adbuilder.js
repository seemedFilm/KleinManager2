class Adbuilder extends KleinManagerCore {
    constructor() {
        super();
    }


    loadAdBuilder() {
       console.log("AdBuilder geladen");
       this.loadCategories();
    }

    async loadCategories() {       
            const categorySelect = document.getElementById("Lb_category");
           
            const res = await fetch ("/api/v1/adbuilder/categories", {
                method: "GET" 
            });
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
        const resultList = document.getElementById("uploadResult");
        const title = document.getElementById("title").value.trim();
        console.log("Uploading images with title:", title);
        if (!title) {
            alert("Bitte gib einen Titel ein!");
            return;
        }
        
        const formData = new FormData();
        formData.append("title", title);  // 🔹 Titel mitsenden
        for (let file of files) {
            formData.append("files", file);
        }
        console.log("FormData prepared with files:", files);
        try {
            const response = await fetch("/api/v1/adbuilder/upload_images", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            resultList.innerHTML = "";

          if (data.images) {
            data.images.forEach(filename => {
                const li = document.createElement("li");
                li.textContent = filename;
                resultList.appendChild(li);
            });
            console.log(`✅ Bilder in ${data.ad_directory} gespeichert`);
            } else {
                console.error("Fehler beim Upload:", data);
            }
        } catch (err) {
            console.error("Upload fehlgeschlagen:", err);
        }
}


    saveAdFile() {
        try {
            const title = document.getElementById("Tb_title").value;
            fetch("/api/v1/adbuilder/builder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    title: document.getElementById("Tb_title").value,
                    description: document.getElementById("Tb_description").value
                 })

            });
        console.log(title); 
            
        } catch (error) {
            console.log(`Error: ${error}`);
        }
      
    }
   
}

// Registrierung im Haupt-App Objekt
document.addEventListener("DOMContentLoaded", () => {
    if (window.app) {
        app.adbuilder = new Adbuilder();
        app.copyMethodsFromManager(app.adbuilder);
    }
});
