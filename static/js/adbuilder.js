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
