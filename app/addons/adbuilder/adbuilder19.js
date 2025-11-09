/**
 * adBuilder Integration Module - TAILWIND FIX
 * Version: 1.0.7
 * 
 * FIX: Unterstützt Tailwind CSS Layout ohne main-Tag
 *      Speziell für: <div class="lg:ml-64 flex-1">
 */

(function() {
    'use strict';

    // === STATE MANAGEMENT ===
    const state = {
        previousContentHTML: null,
        previousContentContainer: null,
        isAdBuilderActive: false,
        mainContentSelector: null
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

        findMainContent: function() {
            console.log('%c🔍 SUCHE NACH MAIN-CONTENT CONTAINER', 'font-size: 16px; font-weight: bold; color: #667eea;');

            const selectors = [
                'main',
                '.main-content',
                '[role="main"]',
                '[class*="ml-64"]',  // Tailwind margin-left
                '[class*="flex-1"]', // Tailwind flex
                '.content',
                '#content',
                '.page-content'
            ];

            const foundElements = [];

            for (const selector of selectors) {
                try {
                    const elements = document.querySelectorAll(selector);
                    if (elements.length > 0) {
                        elements.forEach((el) => {
                            if (el.offsetHeight > 50) {
                                foundElements.push({
                                    selector: selector,
                                    tag: el.tagName,
                                    id: el.id || '-',
                                    classes: el.className || '-',
                                    height: el.offsetHeight
                                });

                                console.log(`
✅ KANDIDAT ${foundElements.length}:
   Selektor: "${selector}"
   Tag: <${el.tagName.toLowerCase()}>
   Klasse: ${el.className || '(keine)'}
   Höhe: ${el.offsetHeight}px
                                `);
                            }
                        });
                    }
                } catch (e) {}
            }

            if (foundElements.length === 0) {
                console.error('%c❌ KEINE CONTAINER GEFUNDEN!', 'color: red; font-weight: bold;');
                return;
            }

            console.log('%c📝 AM WAHRSCHEINLICHSTEN:', 'font-weight: bold; color: #2ecc71;');
            foundElements.sort((a, b) => b.height - a.height);
            foundElements.slice(0, 3).forEach((item, idx) => {
                console.log(`   ${idx + 1}. "${item.selector}"`);
            });
        },

        setContentSelector: function(selector) {
            console.log(`%c🔧 Setze Selektor auf: "${selector}"`, 'color: #f39c12; font-weight: bold;');

            const element = document.querySelector(selector);
            if (!element) {
                console.error(`%c❌ Selektor "${selector}" findet kein Element!`, 'color: red; font-weight: bold;');
                return;
            }

            state.mainContentSelector = selector;
            console.log(`%c✅ Selektor gespeichert! Test mit: document.querySelector('${selector}')`, 'color: #2ecc71; font-weight: bold;');
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
                'Anzahl Kinder': sidebar.children.length
            });

            return sidebar;
        },

        help: function() {
            console.clear();
            console.log('%c📚 adBuilder Debug Helper v1.0.7', 'font-size: 18px; font-weight: bold; color: #667eea;');
            console.log('%c Verfügbare Befehle:', 'font-size: 14px; font-weight: bold;');
            console.log(`
adDebug.findMainContent()      🔍 Finde Main-Content Container
adDebug.setContentSelector()   🔧 Setze Custom Selektor
adDebug.sidebar()              🔍 Zeige Sidebar-Struktur
adDebug.help()                 ? Diese Hilfe
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

        const sidebar = document.querySelector('#sidebar, .sidebar, nav.sidebar, aside, [role="navigation"]');
        if (!sidebar) {
            adDebug.log('❌ Sidebar nicht gefunden!', 'error');
            setTimeout(initAdBuilder, 2000);
            return;
        }

        adDebug.log('✅ Sidebar gefunden!', 'success');

        if (document.getElementById(config.buttonId)) {
            adDebug.log('⚠️ Button existiert bereits', 'warning');
            return;
        }

        const btn = createButton(config);

        if (insertButton(sidebar, btn, config)) {
            adDebug.log('✅ Button eingefügt!', 'success');

            btn.addEventListener('click', function(e) {
                e.preventDefault();
                adDebug.log('Button geklickt!', 'info');
                loadContent(config);
            });

            adDebug.log('🎉 Integration erfolgreich!', 'success');
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
            return false;
        }
    }

    function findSettingsButton(sidebar) {
        const selectors = [
            '[data-action="settings"]',
            '[data-btn="settings"]',
            '.settings-btn',
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
     * === FIX v1.0.7: TAILWIND CSS LAYOUT ===
     * Unterstützt: <div class="lg:ml-64 flex-1">
     */
    function findMainContent() {
        if (state.mainContentSelector) {
            const element = document.querySelector(state.mainContentSelector);
            if (element) return element;
        }

        // WICHTIG: Spezielle Selektoren für Tailwind Layout
        const selectors = [
            // Tailwind spezifisch
            '.lg\:ml-64',              // Escaped colon für Tailwind
            '[class*="lg:ml-64"]',      // Mit Attribut-Selektor
            '[class*="ml-64"]',
            '[class*="flex-1"]',
            '.flex-1',

            // Standard
            'main',
            '.main-content',
            '[role="main"]',
            '#content',
            '.content',

            // Fallback: Erstes großes div nach sidebar
            'body > div:not(#sidebar):not(.sidebar)',
            '.container:not(.sidebar)',

            // Last resort: Größtes div
            'div[class*="flex"]'
        ];

        for (const selector of selectors) {
            try {
                const element = document.querySelector(selector);
                if (element && element.offsetHeight > 50) {
                    // Prüfe ob es nicht die Sidebar ist
                    const isSidebar = element.id === 'sidebar' || 
                                     element.classList.contains('sidebar') ||
                                     element.querySelector('#sidebar');

                    if (!isSidebar) {
                        if (!state.mainContentSelector) {
                            state.mainContentSelector = selector;
                            adDebug.log(`✅ Main-Content gefunden: "${selector}"`, 'success');
                        }
                        return element;
                    }
                }
            } catch (e) {
                // Ungültiger Selektor
            }
        }

        return null;
    }

    function loadContent(config) {
        adDebug.log(`Lade: ${config.htmlPath}`, 'info');

        const mainContent = findMainContent();

        if (!mainContent) {
            adDebug.log('⚠️ Main-Content nicht gefunden', 'warning');
            adDebug.log('Führe aus: adDebug.findMainContent()', 'info');

            console.log('%c\n🔍 AUTOMATIC DEBUG:', 'font-size: 14px; font-weight: bold;');
            window.adDebug.findMainContent();

            // Zeige Inline-Anweisungen
            alert('⚠️ Main-Content Container nicht gefunden!\n\nBitte öffne die Console (F12) und führe aus:\n  adDebug.findMainContent()\n\nDann:\n  adDebug.setContentSelector("dein-selektor")');
            return;
        }

        adDebug.log(`✅ Main-Content Container: ${mainContent.tagName}.${mainContent.className}`, 'success');

        // Speichere Inhalt
        if (!state.previousContentHTML) {
            state.previousContentHTML = mainContent.innerHTML;
            state.previousContentContainer = mainContent;
            adDebug.log('✅ Vorheriger Inhalt gespeichert', 'success');
        }

        // Leere Container
        mainContent.innerHTML = '';
        adDebug.log('✅ Dashboard gelöscht', 'success');

        state.isAdBuilderActive = true;

        mainContent.innerHTML = '<div style="padding: 20px; text-align: center; color: #667eea; font-weight: bold;">⏳ adBuilder wird geladen...</div>';

        fetch(config.htmlPath)
            .then(r => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.text();
            })
            .then(html => {
                adDebug.log('✅ Inhalt geladen!', 'success');
                console.log(`${html}`);
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
                                ← Zurück zum Dashboardhhhhh
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
                restoreDashboard();
            }, 50);
        }
    }

    window.AdBuilderIntegration = { 
        init: initAdBuilder, 
        version: '1.0.7',
        restoreDashboard: restoreDashboard
    };
})();

console.log('%c🎉 adBuilder v1.0.7 (Tailwind Support) geladen!', 'font-size: 16px; font-weight: bold; color: #2ecc71;');
console.log('%cTailwind Layout erkannt: lg:ml-64 flex-1', 'color: #667eea; font-size: 12px;');
