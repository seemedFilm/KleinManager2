/**
 * adBuilder Integration Module - WITH HIDDEN FIX
 * Version: 1.0.4
 * 
 * FIX: Vorheriger Inhalt wird mit hidden Attribut versteckt
 *      bei Navigation zwischen adBuilder und anderen Seiten
 */

(function() {
    'use strict';

    // === STATE MANAGEMENT ===
    const state = {
        previousContent: null,
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

            console.log('%c📋 Alle Buttons:', 'font-weight: bold;');
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

        buttonInfo: function() {
            const btn = document.getElementById('adbuilder-btn');
            if (!btn) {
                console.log('❌ adBuilder-Button nicht gefunden!');
                return;
            }

            console.log('%c📱 adBuilder-Button Info', 'font-size: 14px; font-weight: bold; color: #667eea;');
            console.table({
                'Sichtbar': btn.offsetHeight > 0 ? 'Ja' : 'Nein',
                'Display': getComputedStyle(btn).display,
                'Visibility': getComputedStyle(btn).visibility,
                'Opacity': getComputedStyle(btn).opacity,
                'Parent-Tag': btn.parentElement?.tagName,
                'Parent-Display': getComputedStyle(btn.parentElement).display,
                'Z-Index': getComputedStyle(btn).zIndex
            });

            console.log('Button HTML:');
            console.log(btn.outerHTML);
        },

        forceVisible: function() {
            const btn = document.getElementById('adbuilder-btn');
            if (!btn) {
                console.error('❌ Button nicht gefunden!');
                return;
            }

            btn.style.cssText += `
                display: flex !important;
                visibility: visible !important;
                opacity: 1 !important;
                z-index: 9999 !important;
                width: 100% !important;
                margin: 8px 0 !important;
            `;

            console.log('%c✅ Force-Visibility aktiviert!', 'color: green; font-weight: bold; font-size: 14px;');
        },

        export: function() {
            console.clear();
            console.log('%c=== ADBUILDER DEBUG EXPORT ===', 'font-size: 16px; font-weight: bold;');
            console.log('Browser:', navigator.userAgent.substring(0, 60));
            console.log('URL:', window.location.href);
        },

        help: function() {
            console.clear();
            console.log('%c📚 adBuilder Debug Helper v1.0.4', 'font-size: 18px; font-weight: bold; color: #667eea;');
            console.log('%c Verfügbare Befehle:', 'font-size: 14px; font-weight: bold;');
            console.log(`
adDebug.sidebar()          🔍 Zeige Sidebar-Struktur
adDebug.highlight()        🎯 Markiere Sidebar (ROT)
adDebug.testButton()       🧪 Füge Test-Button ein
adDebug.buttonInfo()       📱 Zeige Button-Infos
adDebug.forceVisible()     ⚡ Erzwinge Button-Sichtbarkeit
adDebug.export()           📝 Exportiere Debug-Info
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

        // Registriere Navigation-Handler für andere Sidebar-Buttons
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
        // Finde Settings-Button
        const settingsBtn = findSettingsButton(sidebar);
        if (settingsBtn && settingsBtn.parentNode) {
            adDebug.log('📌 Füge VOR Settings-Button ein', 'info');
            settingsBtn.parentNode.insertBefore(btn, settingsBtn);
            return true;
        }

        // Fallback
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
     * === FIX v1.0.4: HIDDEN HANDLING ===
     * Speichere den vorherigen Inhalt und verstecke ihn
     */
    function loadContent(config) {
        adDebug.log(`Lade: ${config.htmlPath}`, 'info');

        // WICHTIG: Speichere und verstecke den vorherigen Inhalt
        const mainContent = document.querySelector('main, .main-content, [role="main"]');
        if (mainContent && !state.previousContentContainer) {
            state.previousContentContainer = mainContent;
            state.previousContent = mainContent.innerHTML;

            // Verstecke den vorherigen Inhalt
            mainContent.setAttribute('hidden', '');
            adDebug.log('✅ Vorheriger Inhalt versteckt (hidden)', 'success');
        }

        // Finde oder erstelle adBuilder-Container
        let container = document.getElementById('adbuilder-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'adbuilder-container';

            if (mainContent) {
                mainContent.parentElement.insertBefore(container, mainContent);
            } else {
                document.body.appendChild(container);
            }
        }

        // Entferne hidden Attribut vom adBuilder-Container
        container.removeAttribute('hidden');

        container.innerHTML = '<div style="padding: 20px; text-align: center; color: #667eea;">⏳ Lädt adBuilder...</div>';

        state.isAdBuilderActive = true;

        fetch(config.htmlPath)
            .then(r => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.text();
            })
            .then(html => {
                adDebug.log('✅ Inhalt geladen!', 'success');

                // Füge einen Zurück-Button hinzu
                const backButtonHTML = `
                    <div style="padding: 10px; background: #f0f0f0; border-bottom: 1px solid #ddd; display: flex; align-items: center; gap: 10px;">
                        <button id="adbuilder-back-btn" style="padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">
                            ← Zurück
                        </button>
                        <span style="font-weight: bold; color: #333;">adBuilder</span>
                    </div>
                `;

                container.innerHTML = backButtonHTML + html;

                // Registriere Zurück-Button
                const backBtn = document.getElementById('adbuilder-back-btn');
                if (backBtn) {
                    backBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        restorePreviousContent();
                    });
                }

                // Initialisiere Logik
                if (window.AdBuilderLogic) {
                    setTimeout(() => {
                        window.AdBuilderLogic.init();
                        adDebug.log('✅ Logik initialisiert!', 'success');
                    }, 100);
                }
            })
            .catch(err => {
                adDebug.log(`❌ Fehler: ${err.message}`, 'error');
                container.innerHTML = `<div style="padding: 20px; background: #fee; color: #c00; border-radius: 8px;"><h3>Fehler</h3><p>${err.message}</p></div>`;
            });
    }

    /**
     * Stelle den vorherigen Inhalt wieder her
     */
    function restorePreviousContent() {
        adDebug.log('Stelle vorherigen Inhalt wieder her...', 'info');

        const container = document.getElementById('adbuilder-container');
        if (container) {
            container.setAttribute('hidden', '');
        }

        if (state.previousContentContainer) {
            state.previousContentContainer.removeAttribute('hidden');
            adDebug.log('✅ Vorheriger Inhalt wiederhergestellt', 'success');
        }

        state.isAdBuilderActive = false;
    }

    /**
     * Registriere Navigation Handler für andere Buttons
     */
    function attachNavigationHandlers(sidebar) {
        // Wenn andere Buttons in der Sidebar geklickt werden, verstecke adBuilder
        const buttons = sidebar.querySelectorAll('button:not(#adbuilder-btn)');
        buttons.forEach(btn => {
            btn.addEventListener('click', function() {
                // Leichte Verzögerung, damit der Click registriert wird
                setTimeout(() => {
                    if (state.isAdBuilderActive && state.previousContentContainer) {
                        adDebug.log('Navigation erkannt, verstecke adBuilder', 'info');
                        restorePreviousContent();
                    }
                }, 100);
            });
        });
    }

    // Export APIs
    window.AdBuilderIntegration = { 
        init: initAdBuilder, 
        version: '1.0.4',
        restoreContent: restorePreviousContent
    };
})();

// Automatisch Hilfe anzeigen beim Load
console.log('%c🎉 adBuilder v1.0.4 geladen!', 'font-size: 16px; font-weight: bold; color: #2ecc71;');
console.log('%cTippe in der Console: adDebug.help()', 'color: #667eea; font-weight: bold; font-size: 14px;');
