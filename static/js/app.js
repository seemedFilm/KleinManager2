class KaBot {
    constructor(sectionId) {
        this.section = document.getElementById(sectionId);
        this.log = this.section.querySelector("#kabotLog");
        this.input = this.section.querySelector("#kabotInput");
        this.button = this.section.querySelector("#kabotStart");
        this.jobIdInput = this.section.querySelector("#kabotJobId");

        // Container für die Ads-Liste
        this.adsFileContainer = document.getElementById("adsFileContainer");

        // Buttons
        this.startButton = this.section.querySelector("#kabotStart");
        this.saveButton = this.section.querySelector("#kabotSave");
        this.loadButton = this.section.querySelector("#kabotLoad");
        this.listButton = this.section.querySelector("#kabotList");

        // Events
        this.startButton.addEventListener("click", () => this.run());
        this.saveButton.addEventListener("click", () => this.saveJob());
        this.loadButton.addEventListener("click", () => this.loadJob());
        this.listButton.addEventListener("click", () => this.listJobs());
    
        // Datei-Liste laden
        this.loadAdsFiles();

    }

    async run() {
        const url = this.input.value.trim();
        if (!url) return this.logMessage("Bitte URL eingeben", "red");
        this.logMessage(`Starte Ka-Bot für ${url}`, "blue");

        await this.delay(1000); this.logMessage("Login erfolgreich", "green");
        await this.delay(1000); this.logMessage("Angebot geladen", "green");
        await this.delay(1000); this.logMessage("Erfolgreich erstellt ✅", "green");
    }
    async saveJob() {
        const jobId = this.jobIdInput.value.trim();
        const url = this.input.value.trim();
        if (!jobId || !url) return this.logMessage("Job-ID und URL erforderlich", "red");

        try {
            const res = await fetch(`/bot/save?job_id=${encodeURIComponent(jobId)}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url })
            });
            const data = await res.json();
            this.logMessage(`Job gespeichert: ${JSON.stringify(data)}`, "green");
        } catch (e) {
            this.logMessage("Fehler beim Speichern", "red");
        }
    }
    async loadJob() {
        const jobId = this.jobIdInput.value.trim();
        if (!jobId) return this.logMessage("Job-ID erforderlich", "red");

        try {
            const res = await fetch(`/bot/load/${encodeURIComponent(jobId)}`);
            const data = await res.json();
            this.logMessage(`Job geladen: ${JSON.stringify(data)}`, "yellow");
        } catch (e) {
            this.logMessage("Fehler beim Laden", "red");
        }
    }
    async listJobs() {
        try {
            const res = await fetch(`/bot/jobs`);
            const data = await res.json();
            this.logMessage(`Jobs: ${data.join(", ")}`, "blue");
        } catch (e) {
            this.logMessage("Fehler beim Abrufen der Jobliste", "red");
        }
    }
    // Lade die Liste der Ads-Dateien vom Server
    async loadAdsFiles() {
        try {
            const res = await fetch("/api/v1/ads/files");  // neuer API-Endpoint
            const files = await res.json();
            
            if (!files.length) {
                this.adsFileContainer.innerHTML = "<p class='text-gray-400'>Keine Dateien gefunden.</p>";
                return;
            }

            this.adsFileContainer.innerHTML = files.map(file => `
                <label class="flex items-center space-x-2 cursor-pointer hover:bg-gray-700 p-2 rounded">
                    <input type="radio" name="adsFile" value="${file}" class="form-radio text-blue-500">
                    <span>${file}</span>
                </label>
            `).join("");
        } catch (err) {
            this.adsFileContainer.innerHTML = "<p class='text-red-400'>Fehler beim Laden der Dateien.</p>";
        }
    }

    getSelectedFile() {
        const selected = this.adsFileContainer.querySelector("input[name='adsFile']:checked");
        return selected ? selected.value : null;
    }
    logMessage(msg, color) {
        this.log.innerHTML += `<p class='text-${color}-400'>${msg}</p>`;
        this.log.scrollTop = this.log.scrollHeight;
    }

    delay(ms) {
        return new Promise(r => setTimeout(r, ms));
    }
}

// Main Application Class
class KleinManager extends KleinManagerCore {
    constructor() {
        super();

        this.dashboardManager = new DashboardManager();
        this.ordersManager = new OrdersManager();
        this.watcherManager = new WatcherManager();
        this.trackingManager = new TrackingManager();
        this.listingsManager = new ListingsManager();
        this.statisticsManager = new StatisticsManager();
        this.settingsManager = new SettingsManager();
        this.notificationsManager = new NotificationsManager();

        this.copyMethodsFromManager(this.dashboardManager);
        this.copyMethodsFromManager(this.ordersManager);
        this.copyMethodsFromManager(this.watcherManager);
        this.copyMethodsFromManager(this.trackingManager);
        this.copyMethodsFromManager(this.listingsManager);
        this.copyMethodsFromManager(this.statisticsManager);
        this.copyMethodsFromManager(this.settingsManager);
        this.copyMethodsFromManager(this.notificationsManager);

        this.init();
    }

    copyMethodsFromManager(manager) {
        const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(manager))
            .filter(name => name !== 'constructor' && typeof manager[name] === 'function');

        methodNames.forEach(methodName => {
            if (!this[methodName]) {
                this[methodName] = manager[methodName].bind(this);
            }
        });

        Object.keys(manager).forEach(key => {
            if (!this.hasOwnProperty(key)) {
                this[key] = manager[key];
            }
        });
    }

    async init() {
        this.updateTranslations();
        this.updateViewIcon();
        await this.loadSettings();
        this.initNotificationSound();
        this.loadDashboard();
        this.startNotificationPolling();

        window.addEventListener('resize', () => {
            if (window.innerWidth >= 1024) {
                this.closeMobileMenu();
            }
        });

        new KaBot("Ka-Bot");
    }

    showSection(section) {
        document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
        document.getElementById(section).classList.remove('hidden');

        document.querySelectorAll('.nav-item').forEach(n => {
            n.classList.remove('active', 'bg-blue-900/50', 'border-l-4', 'border-blue-500');
        });

        const clickedItem = event?.target?.closest?.('.nav-item') ||
                           document.querySelector(`.nav-item[onclick*="${section}"]`);
        if (clickedItem) {
            clickedItem.classList.add('active', 'bg-blue-900/50', 'border-l-4', 'border-blue-500');
        }

        this.currentSection = section;
        this.closeMobileMenu();

        if (section === 'dashboard') this.loadDashboard();
        else if (section === 'orders') this.loadOrders();
        else if (section === 'watcher') this.loadWatchedItems();
        else if (section === 'tracking') this.loadTracking();
        else if (section === 'listings') this.loadMyListings();
        else if (section === 'statistics') this.loadStatistics();
        else if (section === 'settings') this.loadSettings();
    }
}

// 👉 App initialisieren (nur einmal!)
const app = new KleinManager();
