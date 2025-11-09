/**
 * adBuilder Integration Module - WITH SELECTOR DEBUG
 * Version: 1.0.6
 * 
 * FIX: Bessere Content-Container-Erkennung
 *      Debug-Tool zum Finden des richtigen Selektors
 */

(function() {
    'use strict';

    // === STATE MANAGEMENT ===
    const state = {
        previousContentHTML: null,
        previousContentContainer: null,
        isAdBuilderActive: false,
        mainContentSelector: null  // Speichere den gefundenen Selektor
    };

    // === GLOBALE DEBUG-FUNKTIONEN ===
    window.adDebug = {
        enabled: true,

        log: function(msg, type = 'log') {
            if (!this.enabled) return;
            const styles = {
                log: 'color: #667eea; font-weight: bold;',
                success: 'color: #2ecc71; font-weight: bold;',
                error: 'color: #e74c3c; font-weight: bold;',
                warning: 'color: #f39c12; font-weight: bold;',
                info: 'color: #3498db; font-weight: bold;'
            };
            console.log(`%c[adBuilder] ${msg}`, styles[type] || styles.log);
        },

        /**
         * === NEUER DEBUG-BEFEHL: Finde den Main-Content Container ===
         */
        findMainContent: function() {
            console.log('%c🔍 SUCHE NACH MAIN-CONTENT CONTAINER', 'font-size: 16px; font-weight: bold; color: #667eea;');

            // Alle möglichen Selektoren
            const selectors = [
                'main',
                '.main-content',
                '.content',
                '[role="main"]',
                '#content',
                '.page-content',
                '.app-content',
                '[class*="content"]',
                '[class*="main"]',
                'section:not(.sidebar)',
                'article',
                '.container:not(.sidebar)',
                '.wrapper',
                '.view',
                '.page'
            ];

            console.log('%c📋 Gefundene Kandidaten:', 'font-weight: bold;');

            const foundElements = [];

            for (const selector of selectors) {
                try {
                    const elements = document.querySelectorAll(selector);
                    if (elements.length > 0) {
                        elements.forEach((el, idx) => {
                            // Ignoriere sehr kleine Elemente
                            if (el.offsetHeight > 50) {
                                foundElements.push({
                                    selector: selector,
                                    tag: el.tagName,
                                    id: el.id || '-',
                                    classes: el.className || '-',
                                    height: el.offsetHeight,
                                    element: el
                                });

                                console.log(`
✅ KANDIDAT ${foundElements.length}:
   Selektor: "${selector}"
   Tag: <${el.tagName.toLowerCase()}>
   ID: ${el.id || '(keine)'}
   Klasse: ${el.className || '(keine)'}
   Höhe: ${el.offsetHeight}px
                                `);
                            }
                        });
                    }
                } catch (e) {
                    // Ungültiger Selektor
                }
            }

            if (foundElements.length === 0) {
                console.error('%c❌ KEINE CONTAINER GEFUNDEN!', 'color: red; font-weight: bold;');
                return;
            }

            console.log('%c📝 AM WAHRSCHEINLICHSTEN:', 'font-weight: bold; color: #2ecc71;');
            console.log('%cVersuche einen dieser Selektoren:', 'font-style: italic;');

            // Sortiere nach Höhe (größere Elemente sind wahrscheinlicher)
            foundElements.sort((a, b) => b.height - a.height);

            foundElements.slice(0, 3).forEach((item, idx) => {
                console.log(`   ${idx + 1}. "${item.selector}"`);
            });

            console.log('%c\n📌 Um einen Selektor zu setzen, rufe auf:', 'font-weight: bold;');
            console.log('   adDebug.setContentSelector("main")  // oder einen anderen Selektor');
        },

        /**
         * === NEUER DEBUG-BEFEHL: Setze Custom Selektor ===
         */
        setContentSelector: function(selector) {
            console.log(`%c🔧 Setze Selektor auf: "${selector}"`, 'color: #f39c12; font-weight: bold;');

            const element = document.querySelector(selector);
            if (!element) {
                console.error(`%c❌ Selektor "${selector}" findet kein Element!`, 'color: red; font-weight: bold;');
                return;
            }

            state.mainContentSelector = selector;
            console.log(`%c✅ Selektor gespeichert! Lade Seite neu.`, 'color: #2ecc71; font-weight: bold;');
            console.log(`
Füge folgende Zeile in adbuilder.js ein (nach Zeile ~120):

    // Custom Selektor für Main-Content
    const MAIN_CONTENT_SELECTOR = '${selector}';
            `);
        },

        sidebar: function() {
            const sidebar = document.querySelector('#sidebar, .sidebar, nav.sidebar, aside, [role="navigation"]');
            if (!sidebar) {
                console.error('❌ Sidebar nicht gefunden!');
                return null;
            }

            console.log('%c🔍 SIDEBAR-STRUKTUR', 'font-size: 16px; font-weight: bold; color: #667eea;');
            console.table({
                'HTML-Tag': sidebar.tagName,
                'ID': sidebar.id || '(keine)',
                'Klassen': sidebar.className || '(keine)',
                'Anzahl Kinder': sidebar.children.length,
                'Buttons': sidebar.querySelectorAll('button').length
            });

            return sidebar;
        },

        help: function() {
            console.clear();
            console.log('%c📚 adBuilder Debug Helper v1.0.6', 'font-size: 18px; font-weight: bold; color: #667eea;');
            console.log('%c Verfügbare Befehle:', 'font-size: 14px; font-weight: bold;');
            console.log(`
adDebug.findMainContent()      🔍 Finde Main-Content Container (WICHTIG!)
adDebug.setContentSelector()   🔧 Setze Custom Selektor
adDebug.sidebar()              🔍 Zeige Sidebar-Struktur
adDebug.help()                 ? Diese Hilfe

TROUBLESHOOTING:
Wenn adBuilder nicht funktioniert:
  1. adDebug.findMainContent()
  2. adDebug.setContentSelector('dein-selektor')
  3. Seite neu laden
            `);
        }
    };

    // === HAUPTINITIALISIERUNG ===
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAdBuilder);
    } else {
        initAdBuilder();
    }

    function initAdBuilder() {
        adDebug.log('Initialisierung gestartet...', 'log');

        const config = {
            buttonId: 'adbuilder-btn',
            buttonText: 'adBuilder',
            htmlPath: '/app/addons/adbuilder/adbuilder.html'
        };

        // Finde Sidebar
        const sidebar = document.querySelector('#sidebar, .sidebar, nav.sidebar, aside, [role="navigation"]');
        if (!sidebar) {
            adDebug.log('❌ Sidebar nicht gefunden!', 'error');
            adDebug.log('Versuche in 2 Sekunden erneut...', 'warning');
            setTimeout(initAdBuilder, 2000);
            return;
        }
        adDebug.log('✅ Sidebar gefunden!', 'success');

        // Prüfe ob Button bereits existiert
        if (document.getElementById(config.buttonId)) {
            adDebug.log('⚠️ Button existiert bereits', 'warning');
            return;
        }

        // Erstelle Button
        const btn = createButton(config);

        // Versuche einzufügen
        if (insertButton(sidebar, btn, config)) {
            adDebug.log('✅ Button eingefügt!', 'success');

            btn.addEventListener('click', function(e) {
                e.preventDefault();
                adDebug.log('Button geklickt!', 'info');
                loadContent(config);
            });

            adDebug.log('🎉 Integration erfolgreich!', 'success');
        } else {
            adDebug.log('❌ Button konnte nicht eingefügt werden!', 'error');
        }
        attachNavigationHandlers(sidebar);
    }

    function createButton(config) {
        const btn = document.createElement('button');
        btn.id = config.buttonId;
        btn.type = 'button';
        btn.setAttribute('data-action', 'adbuilder');
        btn.innerHTML = `<span style="font-size: 18px; margin-right: 8px;">📱</span> ${config.buttonText}`;

        btn.style.cssText = `
            display: flex;
            align-items: center;
            width: 100%;
            padding: 12px 16px;
            margin: 8px 0;
            background: rgba(100, 150, 255, 0.1);
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 15px;
            font-family: inherit;
            color: inherit;
            transition: background-color 0.3s ease;
        `;

        btn.addEventListener('mouseenter', () => {
            btn.style.backgroundColor = 'rgba(100, 150, 255, 0.2)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.backgroundColor = 'rgba(100, 150, 255, 0.1)';
        });

        return btn;
    }

    function insertButton(sidebar, btn, config) {
        const settingsBtn = findSettingsButton(sidebar);
        if (settingsBtn && settingsBtn.parentNode) {
            settingsBtn.parentNode.insertBefore(btn, settingsBtn);
            return true;
        }

        try {
            sidebar.insertBefore(btn, sidebar.firstChild);
            return true;
        } catch (e) {
            adDebug.log(`Fehler: ${e.message}`, 'error');
            return false;
        }
    }

    function findSettingsButton(sidebar) {
        const selectors = [
            '[data-action="settings"]',
            '[data-btn="settings"]',
            '.settings-btn',
            '.btn-settings',
            'button[id*="settings"]'
        ];

        for (const selector of selectors) {
            try {
                const element = sidebar.querySelector(selector);
                if (element) return element;
            } catch (e) {}
        }

        const buttons = sidebar.querySelectorAll('button');
        for (const btn of buttons) {
            if (btn.textContent.toLowerCase().includes('settings') || 
                btn.textContent.toLowerCase().includes('einstellungen')) {
                return btn;
            }
        }

        return null;
    }

    /**
     * === MEHRERE SELEKTOREN FÜR MAIN-CONTENT ===
     */
    function findMainContent() {
        // Wenn ein Custom-Selektor gespeichert ist, verwende diesen
        if (state.mainContentSelector) {
            const element = document.querySelector(state.mainContentSelector);
            if (element) return element;
        }
        // Liste von Selektoren zum Durchsuchen
        const selectors = [
            'main',
            '.main-content',
            '[role="main"]',
            '#content',
            '.content',
            '.page-content',
            '.app-content',
            '.container > *:not(nav):not(aside):not(.sidebar)',
            '[class*="main"][class*="content"]',
            'section:not(.sidebar)',
            '.view',
            '.page',
            'article:not(.sidebar)',
            '.wrapper > *:not(nav):not(aside)',
            '[data-view="content"]',
            '[data-page]',
            '[class*="ml-64"]'
        ];
        // const selectors = '[class*="ml-64"]';
        for (const selector of selectors) {
            try {
                const element = document.querySelector(selector);
                if (element && element.offsetHeight > 50) {
                    // Speichere den gefundenen Selektor
                    if (!state.mainContentSelector) {
                        state.mainContentSelector = selector;
                    }
                    return element;
                }
            } catch (e) {
                // Ungültiger Selektor, ignorieren
            }
        }

        return null;
    }

    function loadContent(config) {
        adDebug.log(`Lade: ${config.htmlPath}`, 'info');

        // WICHTIG: Nutze die neue findMainContent() Funktion
        const mainContent = findMainContent();

        if (!mainContent) {
            adDebug.log('⚠️ Main-Content nicht gefunden', 'warning');
            adDebug.log('Führe folgende Befehle aus:', 'info');
            adDebug.log('  1. adDebug.findMainContent()    // Finde den Container', 'info');
            adDebug.log('  2. adDebug.setContentSelector("selektor")  // Setze den Selektor', 'info');

            // Versuche automatisch zu debuggen
            console.log('%c\n🔍 AUTOMATIC DEBUG:', 'font-size: 14px; font-weight: bold;');
            window.adDebug.findMainContent();
            return;
        }

        // Speichere den AKTUELLEN Inhalt
        if (!state.previousContentHTML) {
            state.previousContentHTML = mainContent.innerHTML;
            state.previousContentContainer = mainContent;
            adDebug.log('✅ Vorheriger Inhalt gespeichert', 'success');
        }

        // Leere den Container
        mainContent.innerHTML = '';
        adDebug.log('✅ Dashboard gelöscht', 'success');

        state.isAdBuilderActive = true;

        // Lade adBuilder
        mainContent.innerHTML = '<div style="padding: 20px; text-align: center; color: #667eea; font-weight: bold;">⏳ adBuilder wird geladen...</div>';

        fetch(config.htmlPath)
            .then(r => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.text();
            })
            .then(html => {
                adDebug.log('✅ Inhalt geladen!', 'success');

                const completeHTML = `
                    <div id="adbuilder-wrapper" style="height: 100%; display: flex; flex-direction: column;">
                        <div style="padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                            <button id="adbuilder-back-btn" style="
                                padding: 8px 16px; 
                                background: rgba(255,255,255,0.2); 
                                color: white; 
                                border: 1px solid rgba(255,255,255,0.3);
                                border-radius: 6px; 
                                cursor: pointer; 
                                font-weight: bold;
                                font-size: 14px;
                                transition: all 0.2s ease;
                            " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                                ← Zurück zum Dashboard
                            </button>
                            <span style="color: white; font-weight: bold; font-size: 16px;">📱 adBuilder</span>
                        </div>

                        <div style="flex: 1; overflow-y: auto;">
                            ${html}
                        </div>
                    </div>
                `;

                mainContent.innerHTML = completeHTML;

                const backBtn = document.getElementById('adbuilder-back-btn');
                if (backBtn) {
                    backBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        adDebug.log('Zurück-Button geklickt', 'info');
                        restoreDashboard();
                    });
                    adDebug.log('✅ Zurück-Button registriert', 'success');
                }

                if (window.AdBuilderLogic) {
                    setTimeout(() => {
                        window.AdBuilderLogic.init();
                        adDebug.log('✅ AdBuilderLogic initialisiert!', 'success');
                    }, 100);
                }

                adDebug.log('🎉 adBuilder erfolgreich geladen!', 'success');
            })
            .catch(err => {
                adDebug.log(`❌ Fehler: ${err.message}`, 'error');
                mainContent.innerHTML = `
                    <div style="padding: 20px; background: #fee; color: #c00; border-radius: 8px; border-left: 4px solid #e74c3c;">
                        <h3>⚠️ Fehler beim Laden von adBuilder</h3>
                        <p><strong>Fehlermeldung:</strong> ${err.message}</p>
                        <p style="font-size: 12px; color: #999;">Pfad: ${config.htmlPath}</p>
                        <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 16px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            Seite neu laden
                        </button>
                    </div>
                `;
            });
    }

    function restoreDashboard() {
        adDebug.log('Stelle Dashboard wieder her...', 'info');

        if (state.previousContentContainer && state.previousContentHTML) {
            state.previousContentContainer.innerHTML = state.previousContentHTML;
            adDebug.log('✅ Dashboard wiederhergestellt', 'success');

            state.isAdBuilderActive = false;

            const sidebar = document.querySelector('#sidebar, .sidebar, nav.sidebar, aside, [role="navigation"]');
            if (sidebar) {
                attachNavigationHandlers(sidebar);
            }
        } else {
            adDebug.log('❌ Gespeicherter Inhalt nicht vorhanden', 'error');
        }
    }

    function attachNavigationHandlers(sidebar) {
        const buttons = sidebar.querySelectorAll('button:not(#adbuilder-btn)');
        buttons.forEach(btn => {
            btn.removeEventListener('click', onOtherButtonClick);
            btn.addEventListener('click', onOtherButtonClick);
        });
    }

    function onOtherButtonClick() {
        if (state.isAdBuilderActive) {
            setTimeout(() => {
                adDebug.log('Navigation zu anderer Seite erkannt', 'info');
                restoreDashboard();
            }, 50);
        }
    }

    // Export APIs
    window.AdBuilderIntegration = { 
        init: initAdBuilder, 
        version: '1.0.6',
        restoreDashboard: restoreDashboard
    };
})();

console.log('%c🎉 adBuilder v1.0.6 geladen!', 'font-size: 16px; font-weight: bold; color: #2ecc71;');
console.log('%cWenn "Main-Content nicht gefunden", tippe: adDebug.findMainContent()', 'color: #f39c12; font-weight: bold; font-size: 14px;');
