/**
 * adBuilder Integration Module - CONTENT FIX
 * Version: 1.0.5
 * 
 * FIX: Dashboard wird komplett geleert, nicht nur versteckt
 *      adBuilder ersetzt Inhalt statt hinzuzufügen
 */

(function() {
    'use strict';

    // === STATE MANAGEMENT ===
    const state = {
        previousContentHTML: null,
        previousContentContainer: null,
        isAdBuilderActive: false
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
                'Buttons': sidebar.querySelectorAll('button').length,
                'Sichtbar': sidebar.offsetHeight > 0 ? 'Ja' : 'Nein'
            });

            console.log('%b📋 Alle Buttons:', 'font-weight: bold;');
            sidebar.querySelectorAll('button').forEach((btn, i) => {
                console.log(`  ${i}: "${btn.textContent.trim()}" [${btn.className}]`);
            });

            return sidebar;
        },

        highlight: function() {
            const sidebar = document.querySelector('#sidebar, .sidebar, nav.sidebar, aside, [role="navigation"]');
            if (!sidebar) {
                console.error('❌ Sidebar nicht gefunden!');
                return;
            }
            sidebar.style.border = '3px solid red';
            sidebar.style.boxShadow = 'inset 0 0 10px rgba(255,0,0,0.5)';
            console.log('%c✅ Sidebar markiert (ROT)', 'color: red; font-weight: bold; font-size: 14px;');
        },

        testButton: function() {
            const sidebar = document.querySelector('#sidebar, .sidebar, nav.sidebar, aside, [role="navigation"]');
            if (!sidebar) {
                console.error('❌ Sidebar nicht gefunden!');
                return;
            }

            const testBtn = document.createElement('button');
            testBtn.id = 'test-btn-' + Date.now();
            testBtn.textContent = '🧪 TEST (OBEN)';
            testBtn.style.cssText = `
                display: block !important;
                width: 100% !important;
                padding: 12px 16px !important;
                margin: 8px 0 !important;
                background: yellow !important;
                color: black !important;
                border: 3px solid red !important;
                cursor: pointer !important;
                font-weight: bold !important;
                z-index: 99999 !important;
            `;

            sidebar.appendChild(testBtn);
            console.log('%c✅ Test-Button eingefügt!', 'color: yellow; background: black; font-weight: bold; padding: 5px; font-size: 14px;');
        },

        help: function() {
            console.clear();
            console.log('%c📚 adBuilder Debug Helper v1.0.5', 'font-size: 18px; font-weight: bold; color: #667eea;');
            console.log('%c Verfügbare Befehle:', 'font-size: 14px; font-weight: bold;');
            console.log(`
adDebug.sidebar()          🔍 Zeige Sidebar-Struktur
adDebug.highlight()        🎯 Markiere Sidebar (ROT)
adDebug.testButton()       🧪 Füge Test-Button ein
adDebug.help()             ? Diese Hilfe
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

        // Registriere Navigation-Handler für andere Buttons
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
            adDebug.log('📌 Füge VOR Settings-Button ein', 'info');
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
     * === FIX v1.0.5: INHALT ERSETZEN STATT HINZUFÜGEN ===
     * Dashboard wird komplett geleert (innerHTML = '')
     * adBuilder ersetzt den Inhalt vollständig
     */
    function loadContent(config) {
        adDebug.log(`Lade: ${config.htmlPath}`, 'info');

        // Finde den Main-Content Container
        const mainContent = document.querySelector('main, .main-content, [role="main"]');

        if (!mainContent) {
            adDebug.log('⚠️ Main-Content nicht gefunden', 'warning');
            return;
        }

        // WICHTIG: Speichere den AKTUELLEN Inhalt bevor du ihn löschst!
        if (!state.previousContentHTML) {
            state.previousContentHTML = mainContent.innerHTML;
            state.previousContentContainer = mainContent;
            adDebug.log('✅ Vorheriger Inhalt gespeichert', 'success');
        }

        // Leere den Container KOMPLETT
        mainContent.innerHTML = '';
        adDebug.log('✅ Dashboard gelöscht', 'success');

        state.isAdBuilderActive = true;

        // Lade adBuilder Inhalt
        mainContent.innerHTML = '<div style="padding: 20px; text-align: center; color: #667eea; font-weight: bold;">⏳ adBuilder wird geladen...</div>';

        fetch(config.htmlPath)
            .then(r => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.text();
            })
            .then(html => {
                adDebug.log('✅ Inhalt geladen!', 'success');

                // Erstelle das komplette HTML mit Zurück-Button
                const completeHTML = `
                    <div id="adbuilder-wrapper" style="height: 100%; display: flex; flex-direction: column;">
                        <!-- Zurück-Button Header -->
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

                        <!-- adBuilder Inhalt -->
                        <div style="flex: 1; overflow-y: auto;">
                            ${html}
                        </div>
                    </div>
                `;

                // Setze komplett neuen Inhalt
                mainContent.innerHTML = completeHTML;

                // Registriere Zurück-Button Click
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

                // Initialisiere adBuilder Logik
                if (window.AdBuilderLogic) {
                    setTimeout(() => {
                        window.AdBuilderLogic.init();
                        adDebug.log('✅ AdBuilderLogic initialisiert!', 'success');
                    }, 100);
                } else {
                    adDebug.log('⚠️ AdBuilderLogic nicht vorhanden', 'warning');
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

    /**
     * Stelle das Dashboard wieder her
     */
    function restoreDashboard() {
        adDebug.log('Stelle Dashboard wieder her...', 'info');

        if (state.previousContentContainer && state.previousContentHTML) {
            state.previousContentContainer.innerHTML = state.previousContentHTML;
            adDebug.log('✅ Dashboard wiederhergestellt', 'success');

            state.isAdBuilderActive = false;

            // Registriere Navigation-Handler erneut für das neu geladene Dashboard
            const sidebar = document.querySelector('#sidebar, .sidebar, nav.sidebar, aside, [role="navigation"]');
            if (sidebar) {
                attachNavigationHandlers(sidebar);
            }
        } else {
            adDebug.log('❌ Gespeicherter Inhalt nicht vorhanden', 'error');
        }
    }

    /**
     * Registriere Navigation Handler für andere Buttons
     */
    function attachNavigationHandlers(sidebar) {
        const buttons = sidebar.querySelectorAll('button:not(#adbuilder-btn)');
        buttons.forEach(btn => {
            // Verhindere doppelte Event-Listener
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
        version: '1.0.5',
        restoreDashboard: restoreDashboard
    };
})();

console.log('%c🎉 adBuilder v1.0.5 geladen!', 'font-size: 16px; font-weight: bold; color: #2ecc71;');
console.log('%cTippe in der Console: adDebug.help()', 'color: #667eea; font-weight: bold; font-size: 14px;');
