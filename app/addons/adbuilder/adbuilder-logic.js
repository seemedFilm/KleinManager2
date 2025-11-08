/**
 * Ad Builder Logic Module
 * Version: 1.0.0
 * 
 * Enthält die komplette Geschäftslogik für den adBuilder:
 * - Formularverwaltung
 * - Anzeigenverwaltung (CRUD)
 * - Tab-Navigation
 * - Einstellungen
 * - Datenmanagement
 */

const AdBuilderLogic = (function() {
    'use strict';

    // === STATE MANAGEMENT ===
    const state = {
        ads: [],
        currentTab: 'create',
        settings: {
            autoPublish: false,
            autoArchive: true,
            notifications: true,
            emailNotifications: false,
            compactView: false
        },
        filters: {
            search: '',
            category: ''
        }
    };

    // === INITIALIZATION ===
    function init() {
        console.log('[AdBuilderLogic] Initialisierung gestartet...');

        loadFromStorage();
        attachEventListeners();
        loadSettings();

        console.log('[AdBuilderLogic] Bereit!');
    }

    // === EVENT LISTENERS ===
    function attachEventListeners() {
        // Tab-Navigation
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', handleTabChange);
        });

        // Formular: Neue Anzeige
        const form = document.getElementById('adbuilder-form');
        if (form) {
            form.addEventListener('submit', handleFormSubmit);
            form.addEventListener('reset', handleFormReset);
        }

        // Suche und Filter
        const searchInput = document.getElementById('ad-search');
        if (searchInput) {
            searchInput.addEventListener('input', handleSearch);
        }

        const filterCategory = document.getElementById('filter-category');
        if (filterCategory) {
            filterCategory.addEventListener('change', handleCategoryFilter);
        }

        // Einstellungen
        const saveSettingsBtn = document.getElementById('save-settings');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', handleSaveSettings);
        }

        const resetSettingsBtn = document.getElementById('reset-settings');
        if (resetSettingsBtn) {
            resetSettingsBtn.addEventListener('click', handleResetSettings);
        }

        // Einstellungs-Checkboxen
        const settingsCheckboxes = [
            'auto-publish',
            'auto-archive',
            'notifications',
            'email-notifications',
            'compact-view'
        ];

        settingsCheckboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.addEventListener('change', handleSettingChange);
            }
        });

        console.log('[AdBuilderLogic] Event-Listener registriert');
    }

    // === TAB MANAGEMENT ===
    function handleTabChange(e) {
        const tabName = e.target.getAttribute('data-tab');

        if (!tabName) return;

        console.log('[AdBuilderLogic] Wechsle zu Tab:', tabName);

        // Deaktiviere alle Tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
        });

        // Aktiviere den gewählten Tab
        const targetTab = document.getElementById('tab-' + tabName);
        if (targetTab) {
            targetTab.classList.add('active');
        }

        e.target.classList.add('active');
        e.target.setAttribute('aria-selected', 'true');

        state.currentTab = tabName;

        // Tab-spezifische Aktionen
        if (tabName === 'manage') {
            renderAdsList();
        }
    }

    // === FORM HANDLING ===
    function handleFormSubmit(e) {
        e.preventDefault();

        console.log('[AdBuilderLogic] Formular wird abgeschickt...');

        const formData = new FormData(e.target);

        // Erstelle Anzeigen-Objekt
        const ad = {
            id: Date.now(),
            title: formData.get('title'),
            description: formData.get('description') || '',
            url: formData.get('url'),
            category: formData.get('category') || 'other',
            status: formData.get('status') || 'draft',
            startDate: formData.get('startDate') || null,
            endDate: formData.get('endDate') || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            views: 0,
            clicks: 0
        };

        // Validierung
        if (!validateAd(ad)) {
            return;
        }

        // Füge zur Liste hinzu
        state.ads.push(ad);
        saveToStorage();

        // Feedback
        showNotification('✅ Anzeige erfolgreich erstellt!', 'success');
        console.log('[AdBuilderLogic] Anzeige erstellt:', ad);

        // Formular zurücksetzen
        e.target.reset();

        // Optional: Automatisch zum Manage-Tab wechseln
        if (state.settings.autoPublish) {
            setTimeout(() => {
                const manageTab = document.querySelector('[data-tab="manage"]');
                if (manageTab) manageTab.click();
            }, 1000);
        }
    }

    function handleFormReset() {
        console.log('[AdBuilderLogic] Formular zurückgesetzt');
        showNotification('🔄 Formular wurde zurückgesetzt', 'info');
    }

    function validateAd(ad) {
        // Titel-Validierung
        if (!ad.title || ad.title.trim().length < 3) {
            showNotification('⚠️ Titel muss mindestens 3 Zeichen lang sein', 'error');
            return false;
        }

        // URL-Validierung
        try {
            new URL(ad.url);
        } catch (e) {
            showNotification('⚠️ Bitte gib eine gültige URL ein', 'error');
            return false;
        }

        // Datums-Validierung
        if (ad.startDate && ad.endDate) {
            if (new Date(ad.startDate) > new Date(ad.endDate)) {
                showNotification('⚠️ Enddatum muss nach dem Startdatum liegen', 'error');
                return false;
            }
        }

        return true;
    }

    // === ADS LIST RENDERING ===
    function renderAdsList() {
        const container = document.getElementById('ads-list');
        if (!container) return;

        console.log('[AdBuilderLogic] Rendere Anzeigenliste...');

        // Filter anwenden
        let filteredAds = state.ads;

        if (state.filters.search) {
            const searchLower = state.filters.search.toLowerCase();
            filteredAds = filteredAds.filter(ad => 
                ad.title.toLowerCase().includes(searchLower) ||
                ad.description.toLowerCase().includes(searchLower)
            );
        }

        if (state.filters.category) {
            filteredAds = filteredAds.filter(ad => ad.category === state.filters.category);
        }

        // Sortiere nach Erstellungsdatum (neueste zuerst)
        filteredAds.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Render
        if (filteredAds.length === 0) {
            container.innerHTML = `
                <div class="placeholder">
                    <div class="placeholder-icon">📭</div>
                    <p>Keine Anzeigen gefunden.</p>
                    ${state.filters.search || state.filters.category ? 
                        '<p><small>Versuche andere Filtereinstellungen</small></p>' : 
                        '<p><small>Erstelle deine erste Anzeige im Tab "Neue Anzeige"</small></p>'
                    }
                </div>
            `;
            return;
        }

        container.innerHTML = filteredAds.map(ad => createAdCard(ad)).join('');

        // Event-Listener für Aktionen
        attachAdActionListeners();
    }

    function createAdCard(ad) {
        const statusIcons = {
            draft: '📝',
            active: '✅',
            paused: '⏸️'
        };

        const categoryIcons = {
            product: '🛍️',
            service: '💼',
            event: '🎉',
            announcement: '📢',
            other: '📁'
        };

        return `
            <div class="ad-card" data-id="${ad.id}">
                <div class="ad-card-header">
                    <h3 class="ad-title">
                        ${categoryIcons[ad.category] || '📁'} ${escapeHtml(ad.title)}
                    </h3>
                    <span class="ad-status status-${ad.status}">
                        ${statusIcons[ad.status]} ${ad.status}
                    </span>
                </div>

                ${ad.description ? `
                    <p class="ad-description">${escapeHtml(ad.description)}</p>
                ` : ''}

                <div class="ad-meta">
                    <span class="ad-url">🔗 <a href="${escapeHtml(ad.url)}" target="_blank" rel="noopener">${escapeHtml(truncateUrl(ad.url))}</a></span>
                    <span class="ad-date">📅 ${formatDate(ad.createdAt)}</span>
                </div>

                ${ad.startDate || ad.endDate ? `
                    <div class="ad-schedule">
                        ${ad.startDate ? `<span>Start: ${formatDate(ad.startDate)}</span>` : ''}
                        ${ad.endDate ? `<span>Ende: ${formatDate(ad.endDate)}</span>` : ''}
                    </div>
                ` : ''}

                <div class="ad-stats">
                    <span>👁️ ${ad.views} Ansichten</span>
                    <span>🖱️ ${ad.clicks} Klicks</span>
                </div>

                <div class="ad-actions">
                    <button class="btn-icon btn-edit" data-id="${ad.id}" title="Bearbeiten">
                        ✏️
                    </button>
                    <button class="btn-icon btn-duplicate" data-id="${ad.id}" title="Duplizieren">
                        📋
                    </button>
                    <button class="btn-icon btn-toggle" data-id="${ad.id}" title="Status ändern">
                        ${ad.status === 'active' ? '⏸️' : '▶️'}
                    </button>
                    <button class="btn-icon btn-delete" data-id="${ad.id}" title="Löschen">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }

    function attachAdActionListeners() {
        // Delete
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                handleDeleteAd(id);
            });
        });

        // Edit
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                handleEditAd(id);
            });
        });

        // Duplicate
        document.querySelectorAll('.btn-duplicate').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                handleDuplicateAd(id);
            });
        });

        // Toggle Status
        document.querySelectorAll('.btn-toggle').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                handleToggleStatus(id);
            });
        });
    }

    // === AD ACTIONS ===
    function handleDeleteAd(id) {
        if (!confirm('🗑️ Anzeige wirklich löschen?')) return;

        state.ads = state.ads.filter(ad => ad.id !== id);
        saveToStorage();
        renderAdsList();

        showNotification('✅ Anzeige gelöscht', 'success');
        console.log('[AdBuilderLogic] Anzeige gelöscht:', id);
    }

    function handleEditAd(id) {
        const ad = state.ads.find(a => a.id === id);
        if (!ad) return;

        // Wechsle zum Create-Tab
        const createTab = document.querySelector('[data-tab="create"]');
        if (createTab) createTab.click();

        // Fülle Formular
        setTimeout(() => {
            document.getElementById('ad-title').value = ad.title;
            document.getElementById('ad-description').value = ad.description || '';
            document.getElementById('ad-url').value = ad.url;
            document.getElementById('ad-category').value = ad.category;
            document.getElementById('ad-status').value = ad.status;
            if (ad.startDate) document.getElementById('ad-start-date').value = ad.startDate;
            if (ad.endDate) document.getElementById('ad-end-date').value = ad.endDate;

            // Lösche die alte Version beim Absenden
            const form = document.getElementById('adbuilder-form');
            const oldSubmit = form.onsubmit;
            form.onsubmit = function(e) {
                handleDeleteAd(id);
                if (oldSubmit) oldSubmit.call(form, e);
            };
        }, 100);

        showNotification('✏️ Bearbeitungsmodus aktiviert', 'info');
    }

    function handleDuplicateAd(id) {
        const ad = state.ads.find(a => a.id === id);
        if (!ad) return;

        const duplicate = {
            ...ad,
            id: Date.now(),
            title: ad.title + ' (Kopie)',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            views: 0,
            clicks: 0
        };

        state.ads.push(duplicate);
        saveToStorage();
        renderAdsList();

        showNotification('✅ Anzeige dupliziert', 'success');
    }

    function handleToggleStatus(id) {
        const ad = state.ads.find(a => a.id === id);
        if (!ad) return;

        if (ad.status === 'active') {
            ad.status = 'paused';
        } else {
            ad.status = 'active';
        }

        ad.updatedAt = new Date().toISOString();
        saveToStorage();
        renderAdsList();

        showNotification(`${ad.status === 'active' ? '▶️' : '⏸️'} Status geändert zu: ${ad.status}`, 'info');
    }

    // === SEARCH & FILTER ===
    function handleSearch(e) {
        state.filters.search = e.target.value;
        renderAdsList();
    }

    function handleCategoryFilter(e) {
        state.filters.category = e.target.value;
        renderAdsList();
    }

    // === SETTINGS ===
    function handleSettingChange(e) {
        const id = e.target.id;
        const value = e.target.checked;

        const settingMap = {
            'auto-publish': 'autoPublish',
            'auto-archive': 'autoArchive',
            'notifications': 'notifications',
            'email-notifications': 'emailNotifications',
            'compact-view': 'compactView'
        };

        const settingKey = settingMap[id];
        if (settingKey) {
            state.settings[settingKey] = value;
            console.log('[AdBuilderLogic] Einstellung geändert:', settingKey, value);
        }
    }

    function handleSaveSettings() {
        saveToStorage();
        showNotification('💾 Einstellungen gespeichert', 'success');
    }

    function handleResetSettings() {
        if (!confirm('⚠️ Alle Einstellungen auf Standard zurücksetzen?')) return;

        state.settings = {
            autoPublish: false,
            autoArchive: true,
            notifications: true,
            emailNotifications: false,
            compactView: false
        };

        loadSettings();
        saveToStorage();
        showNotification('🔄 Einstellungen zurückgesetzt', 'info');
    }

    function loadSettings() {
        document.getElementById('auto-publish').checked = state.settings.autoPublish;
        document.getElementById('auto-archive').checked = state.settings.autoArchive;
        document.getElementById('notifications').checked = state.settings.notifications;
        document.getElementById('email-notifications').checked = state.settings.emailNotifications;
        document.getElementById('compact-view').checked = state.settings.compactView;
    }

    // === STORAGE ===
    function saveToStorage() {
        try {
            const data = {
                ads: state.ads,
                settings: state.settings,
                version: '1.0.0',
                timestamp: Date.now()
            };

            // Da LocalStorage nicht verfügbar ist, speichern wir in einer globalen Variable
            window.__adBuilderData = data;

            console.log('[AdBuilderLogic] Daten gespeichert');
        } catch (e) {
            console.error('[AdBuilderLogic] Fehler beim Speichern:', e);
        }
    }

    function loadFromStorage() {
        try {
            const data = window.__adBuilderData;

            if (data) {
                state.ads = data.ads || [];
                state.settings = data.settings || state.settings;
                console.log('[AdBuilderLogic] Daten geladen:', state.ads.length, 'Anzeigen');
            }
        } catch (e) {
            console.error('[AdBuilderLogic] Fehler beim Laden:', e);
        }
    }

    // === UTILITIES ===
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('de-DE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }

    function truncateUrl(url, maxLength = 40) {
        if (url.length <= maxLength) return url;
        return url.substring(0, maxLength) + '...';
    }

    function showNotification(message, type = 'info') {
        // Einfache Benachrichtigung
        if (!state.settings.notifications) return;

        console.log(`[AdBuilderLogic] ${type.toUpperCase()}: ${message}`);

        // Erstelle Notification-Element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            background: ${type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // === PUBLIC API ===
    return {
        init: init,
        getAds: () => state.ads,
        getSettings: () => state.settings,
        version: '1.0.0'
    };
})();

// Auto-Init beim Laden des Scripts (falls adBuilder bereits geladen ist)
if (document.getElementById('adbuilder-container')) {
    AdBuilderLogic.init();
}

// CSS für Notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }

    .ad-card {
        background: white;
        border: 2px solid #e0e0e0;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 16px;
        transition: all 0.3s ease;
    }

    .ad-card:hover {
        border-color: #667eea;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
    }

    .ad-card-header {
        display: flex;
        justify-content: space-between;
        align-items: start;
        margin-bottom: 12px;
    }

    .ad-title {
        margin: 0;
        font-size: 20px;
        color: #2c3e50;
    }

    .ad-status {
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
    }

    .status-draft {
        background: #f39c12;
        color: white;
    }

    .status-active {
        background: #2ecc71;
        color: white;
    }

    .status-paused {
        background: #95a5a6;
        color: white;
    }

    .ad-description {
        color: #7f8c8d;
        margin: 8px 0;
    }

    .ad-meta, .ad-schedule, .ad-stats {
        display: flex;
        gap: 16px;
        margin: 8px 0;
        font-size: 14px;
        color: #95a5a6;
        flex-wrap: wrap;
    }

    .ad-url a {
        color: #667eea;
        text-decoration: none;
    }

    .ad-url a:hover {
        text-decoration: underline;
    }

    .ad-actions {
        display: flex;
        gap: 8px;
        margin-top: 16px;
        padding-top: 16px;
        border-top: 2px solid #f0f0f0;
    }

    .btn-icon {
        padding: 8px 12px;
        background: #ecf0f1;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 16px;
    }

    .btn-icon:hover {
        background: #d5dbdd;
        transform: translateY(-2px);
    }
`;
document.head.appendChild(notificationStyles);
