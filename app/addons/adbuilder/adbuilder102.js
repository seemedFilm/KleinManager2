/**
 * adBuilder Integration Module - FINAL VERSION
 * Version: 1.0.2 (mit integriertem Debug)
 * 
 * Features:
 * - Automatische Sidebar-Integration
 * - Integriertes Debug-System (kein extra Script nötig!)
 * - Robuste Fehlerbehandlung
 * - Mehrere Fallback-Strategien
 */

(function() {
    'use strict';

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

        // 🔍 Zeige Sidebar-Struktur
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

        // 🎯 Highlight Sidebar (ROT)
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

        // 🧪 Test-Button einfügen
        testButton: function() {
            const sidebar = document.querySelector('#sidebar, .sidebar, nav.sidebar, aside, [role="navigation"]');
            if (!sidebar) {
                console.error('❌ Sidebar nicht gefunden!');
                return;
            }

            const testBtn = document.createElement('button');
            testBtn.id = 'test-btn-' + Date.now();
            testBtn.textContent = '🧪 TEST BUTTON';
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
            console.log('%c👁️  IST DER TEST-BUTTON IN DER SIDEBAR SICHTBAR?', 'background: yellow; color: black; font-weight: bold; padding: 10px; font-size: 14px;');
            console.log('   JA: Das Problem liegt am adBuilder-Button Styling');
            console.log('   NEIN: Die Sidebar-Struktur passt nicht');
        },

        // 🔧 Zeige adBuilder-Button-Info
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

        // ⚡ Force-Sichtbarkeit des Buttons
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
            console.log('   Ist der Button jetzt sichtbar?');
        },

        // 📝 Detailliertes Log exportieren
        export: function() {
            console.clear();
            console.log('%c=== ADBUILDER DEBUG EXPORT ===', 'font-size: 16px; font-weight: bold;');
            console.log('Browser:', navigator.userAgent.substring(0, 60));
            console.log('URL:', window.location.href);
            console.log('');

            console.log('%c--- Sidebar Status ---', 'font-weight: bold;');
            const sidebar = document.querySelector('#sidebar, .sidebar, nav.sidebar, aside, [role="navigation"]');
            console.log('Gefunden:', !!sidebar);
            if (sidebar) {
                console.log('Tag:', sidebar.tagName);
                console.log('ID:', sidebar.id);
                console.log('Sichtbar:', sidebar.offsetHeight > 0);
            }

            console.log('%c--- Button Status ---', 'font-weight: bold;');
            const btn = document.getElementById('adbuilder-btn');
            console.log('Gefunden:', !!btn);
            if (btn) {
                console.log('Sichtbar:', btn.offsetHeight > 0);
                console.log('Display:', getComputedStyle(btn).display);
            }

            console.log('%c--- Scripts ---', 'font-weight: bold;');
            console.log('AdBuilderIntegration:', !!window.AdBuilderIntegration);
            console.log('AdBuilderLogic:', !!window.AdBuilderLogic);

            console.log('%c--- Kopiere diesen Text für Support ---', 'background: #f0f0f0; padding: 5px;');
        },

        // ? Hilfe
        help: function() {
            console.clear();
            console.log('%c📚 adBuilder Debug Helper v1.0', 'font-size: 18px; font-weight: bold; color: #667eea;');
            console.log('%c Verfügbare Befehle:', 'font-size: 14px; font-weight: bold;');
            console.log(`
adDebug.sidebar()          🔍 Zeige Sidebar-Struktur
adDebug.highlight()        🎯 Markiere Sidebar (ROT)
adDebug.testButton()       🧪 Füge Test-Button ein
adDebug.buttonInfo()       📱 Zeige Button-Infos
adDebug.forceVisible()     ⚡ Erzwinge Button-Sichtbarkeit
adDebug.export()           📝 Exportiere Debug-Info
adDebug.help()             ? Diese Hilfe

Beispiel:
  1. adDebug.sidebar()       // Schritt 1
  2. adDebug.highlight()     // Schritt 2
  3. adDebug.testButton()    // Schritt 3
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
    }

    function createButton(config) {
        const btn = document.createElement('button');
        btn.id = config.buttonId;
        btn.type = 'button';
        btn.setAttribute('data-action', 'adbuilder');
        btn.innerHTML = `<span style="font-size: 18px; margin-right: 8px;">📱</span> ${config.buttonText}`;

        // Kombiniere mehrere Style-Ansätze
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
        try {
            // Strategie 1: Direkt anhängen
            sidebar.appendChild(btn);
            return true;
        } catch (e) {
            adDebug.log(`Fehler: ${e.message}`, 'error');
            return false;
        }
    }

    function loadContent(config) {
        adDebug.log(`Lade: ${config.htmlPath}`, 'info');

        let container = document.getElementById('adbuilder-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'adbuilder-container';
            const main = document.querySelector('main, .main-content, [role="main"]');
            if (main) {
                main.innerHTML = '';
                main.appendChild(container);
            } else {
                document.body.appendChild(container);
            }
        }

        container.innerHTML = '<div style="padding: 20px; text-align: center; color: #667eea;">⏳ Lädt adBuilder...</div>';

        fetch(config.htmlPath)
            .then(r => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.text();
            })
            .then(html => {
                adDebug.log('✅ Inhalt geladen!', 'success');
                container.innerHTML = html;

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

    // Export APIs
    window.AdBuilderIntegration = { init: initAdBuilder, version: '1.0.2' };
})();

// Automatisch Hilfe anzeigen beim Load
console.log('%c🎉 adBuilder geladen!', 'font-size: 16px; font-weight: bold; color: #2ecc71;');
console.log('%cTippe in der Console: adDebug.help()', 'color: #667eea; font-weight: bold; font-size: 14px;');
