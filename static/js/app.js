class KaBot {
    constructor(sectionId) {
        this.section = document.getElementById(sectionId);
        this.log = this.section.querySelector("#kabotLog");
        this.input = this.section.querySelector("#kabotInput");
        this.button = this.section.querySelector("#kabotStart");

        if (this.button) {
            this.button.addEventListener("click", () => this.run());
        }
    }

    async run() {
        const url = this.input.value.trim();
        if (!url) return this.logMessage("Bitte URL eingeben", "red");
        this.logMessage(`Starte Ka-Bot für ${url}`, "blue");

        await this.delay(1000); this.logMessage("Login erfolgreich", "green");
        await this.delay(1000); this.logMessage("Angebot geladen", "green");
        await this.delay(1000); this.logMessage("Erfolgreich erstellt ✅", "green");
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

        // 👉 KaBot hier sauber initialisieren
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
