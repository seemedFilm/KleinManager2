import log from "./logger.js";


class KaBot {
    constructor(sectionId) {
        this.section = document.getElementById(sectionId);
        this.log = this.section.querySelector("#kabotLog");
        this.adsFileContainer = document.getElementById("adsFileContainer");
    
        this.loadAdsFiles();
    }

   
    async loadAdsFiles() {
    try {
        const res = await fetch("/api/v1/ads/files"); 
        const data = await res.json();

        this.adsFileContainer.innerHTML = "";

        if (!data.files || data.files.length === 0) {
            this.adsFileContainer.innerHTML = "<p class='text-gray-400'>Keine Dateien gefunden.</p>";
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

            radio.addEventListener("change", () => {
                log.front(`Vorlage ausgewählt: ${file}`, "INFO", "green");
            });

            label.appendChild(radio);
            label.appendChild(span);
            this.adsFileContainer.appendChild(label);           
        });
        } 
        catch (err) {
            
        console.error("Fehler beim Laden der Dateien:", err);
        document.getElementById("adsFileContainer").innerHTML =
            "<p class='text-red-400'>Fehler beim Laden der Dateien.</p>";
            }        
    }   

    getSelectedFile() {
        const selected = this.adsFileContainer.querySelector("input[name='adsFile']:checked");
        this.log.in
        return selected ? selected.value : null;
    }

    delay(ms) {
        return new Promise(r => setTimeout(r, ms));
    }
}

async function loadVersion() {
    try {
      const res = await fetch("/version");
      if (!res.ok) throw new Error("Fehler beim Laden");
      const data = await res.json();

      document.getElementById("gitCommit").textContent = `${data.gitCommit} `;
      document.getElementById("gitDate").textContent = `${data.gitDate}`;
      document.getElementById("buildDate").textContent = `${data.buildDate}`;
      document.getElementById("appVersion").textContent = `${data.appVersion}`;
    } catch (err) {
      console.error("Konnte Version nicht laden:", err);
      document.getElementById("gitVersion").textContent = "Version unbekannt";
    }
  }
  document.addEventListener("DOMContentLoaded", loadVersion);


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
        this.kleinanzeigenManager = new KleinanzeigenManager();

        this.copyMethodsFromManager(this.dashboardManager);
        this.copyMethodsFromManager(this.ordersManager);
        this.copyMethodsFromManager(this.watcherManager);
        this.copyMethodsFromManager(this.trackingManager);
        this.copyMethodsFromManager(this.listingsManager);
        this.copyMethodsFromManager(this.statisticsManager);
        this.copyMethodsFromManager(this.settingsManager);
        this.copyMethodsFromManager(this.notificationsManager);
        this.copyMethodsFromManager(this.kleinanzeigenManager);

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
        //else if (section === 'Ka-Bot') this.loadAdsFiles();
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
