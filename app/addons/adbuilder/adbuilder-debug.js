/**
 * adBuilder Integration Module - DEBUG VERSION
 * Version: 1.0.8 - DIAGNOSTICS
 * 
 * Diese Version zeigt genau, warum nichts geladen wird
 */

(function() {
    'use strict';

    const state = {
        previousContentHTML: null,
        previousContentContainer: null,
        isAdBuilderActive: false,
        mainContentSelector: null
    };

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
         * === NEUER SUPER-DEBUG BEFEHL ===
         * Zeigt ALLES was im DOM passiert
         */
        fullDiagnostics: function() {
            console.clear();
            console.log('%c🔍 === FULL DIAGNOSTICS === 🔍', 'font-size: 18px; font-weight: bold; color: #667eea; padding: 10px; background: #f0f0f0;');

            // 1. Finde die Sidebar
            console.log('%c\n1️⃣ SIDEBAR:', 'font-size: 14px; font-weight: bold;');
            const sidebar = document.querySelector('#sidebar, .sidebar, nav.sidebar, aside, [role="navigation"]');
            if (sidebar) {
                console.log('✅ Sidebar gefunden!');
                console.log('   Tag:', sidebar.tagName);
                console.log('   ID:', sidebar.id || '-');
                console.log('   Classes:', sidebar.className);
            } else {
                console.log('❌ Sidebar NICHT gefunden!');
            }

            // 2. Finde den adBuilder-Button
            console.log('%c\n2️⃣ adBuilder BUTTON:', 'font-size: 14px; font-weight: bold;');
            const btn = document.getElementById('adbuilder-btn');
            if (btn) {
                console.log('✅ Button gefunden!');
                console.log('   Parent:', btn.parentElement.tagName);
                console.log('   Display:', getComputedStyle(btn).display);
            } else {
                console.log('❌ Button NICHT gefunden!');
            }

            // 3. Finde ALL mögliche Container
            console.log('%c\n3️⃣ ALLE MÖGLICHEN CONTAINER:', 'font-size: 14px; font-weight: bold;');
            const containers = document.querySelectorAll('main, [role="main"], .main-content, [class*="ml-64"], [class*="flex-1"], .container, .content, .page-content, [class*="main"]');
            console.log(`Gefunden: ${containers.length} Kandidaten`);

            containers.forEach((el, idx) => {
                if (el.offsetHeight > 0) {
                    console.log(`\n   ${idx + 1}. <${el.tagName.toLowerCase()}>`);
                    console.log(`      ID: ${el.id || '-'}`);
                    console.log(`      Class: ${el.className || '-'}`);
                    console.log(`      Height: ${el.offsetHeight}px`);
                    console.log(`      Children: ${el.children.length}`);
                }
            });

            // 4. Teste die verschiedenen Selektoren
            console.log('%c\n4️⃣ TEST VERSCHIEDENER SELEKTOREN:', 'font-size: 14px; font-weight: bold;');
            const selectors = [
                '[class*="lg:ml-64"]',
                '[class*="ml-64"]',
                '[class*="flex-1"]',
                'main',
                '.main-content',
                '[role="main"]',
                '#content',
                '.content'
            ];

            selectors.forEach(sel => {
                try {
                    const el = document.querySelector(sel);
                    const result = el ? '✅ GEFUNDEN' : '❌ nicht gefunden';
                    console.log(`   "${sel}" ... ${result}`);
                    if (el) {
                        console.log(`      └→ <${el.tagName.toLowerCase()}> ${el.className ? '.' + el.className.split(' ')[0] : ''}`);
                    }
                } catch (e) {
                    console.log(`   "${sel}" ... ⚠️ Selektor-Fehler`);
                }
            });

            // 5. Body Struktur
            console.log('%c\n5️⃣ BODY STRUKTUR:', 'font-size: 14px; font-weight: bold;');
            console.log(document.body.innerHTML.substring(0, 500) + '...');

            // 6. Window Size
            console.log('%c\n6️⃣ VIEWPORT:', 'font-size: 14px; font-weight: bold;');
            console.log(`   Width: ${window.innerWidth}px`);
            console.log(`   Height: ${window.innerHeight}px`);

            console.log('%c\n📝 NÄCHSTE SCHRITTE:', 'font-size: 12px; font-weight: bold; background: #fff3cd; padding: 5px;');
            console.log('1. Speichere diese Diagnostics (Ctrl+Shift+J für Console, Rechtsklick → Speichern)');
            console.log('2. Überprüfe welcher Container mit ✅ markiert ist');
            console.log('3. Schreibe: adDebug.setMainContainer("dein-selektor")');
        },

        /**
         * Setze den Main-Container manuell
         */
        setMainContainer: function(selector) {
            console.log(`%c🔧 Setze Main-Container auf: "${selector}"`, 'color: #f39c12; font-weight: bold;');
            const el = document.querySelector(selector);
            if (!el) {
                console.error(`❌ Selektor "${selector}" findet kein Element!`);
                return;
            }
            state.mainContentSelector = selector;
            console.log(`%c✅ Container gespeichert! Seite neu laden (F5)`, 'color: #2ecc71; font-weight: bold;');

            // Speichere in LocalStorage als Fallback
            try {
                localStorage.setItem('adbuilder_container_selector', selector);
            } catch (e) {}
        },

        help: function() {
            console.clear();
            console.log('%c📚 adBuilder Debug v1.0.8', 'font-size: 16px; font-weight: bold; color: #667eea;');
            console.log(`
🚨 WENN NICHTS GELADEN WIRD:

1. Führe aus:
   adDebug.fullDiagnostics()

2. Warte auf die Ausgabe

3. Suche nach ✅ GEFUNDEN

4. Schreibe:
   adDebug.setMainContainer("dein-selektor")

5. Seite neu laden (F5)

Beispiel:
   adDebug.setMainContainer('[class*="ml-64"]')
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
        adDebug.log('Initialisierung...', 'log');

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
                adDebug.log('Button geklickt → laden...', 'info');
                loadContent(config);
            });

            adDebug.log('🎉 Bereit! adBuilder-Button aktiv', 'success');
        }
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

    function findMainContent() {
        // Probiere gespeicherten Selektor zuerst
        if (state.mainContentSelector) {
            const element = document.querySelector(state.mainContentSelector);
            if (element && element.offsetHeight > 50) return element;
        }

        // Probiere LocalStorage
        try {
            const saved = localStorage.getItem('adbuilder_container_selector');
            if (saved) {
                const element = document.querySelector(saved);
                if (element && element.offsetHeight > 50) {
                    state.mainContentSelector = saved;
                    return element;
                }
            }
        } catch (e) {}

        const selectors = [
            '[class*="lg:ml-64"]',
            '[class*="ml-64"]',
            '[class*="flex-1"]',
            'main',
            '.main-content',
            '[role="main"]',
            '#content',
            '.content',
            '[class*="main"]'
        ];

        for (const selector of selectors) {
            try {
                const element = document.querySelector(selector);
                if (element && element.offsetHeight > 50 && element.id !== 'sidebar') {
                    state.mainContentSelector = selector;
                    adDebug.log(`✅ Container gefunden: "${selector}"`, 'success');
                    return element;
                }
            } catch (e) {}
        }

        adDebug.log('❌ Kein Container gefunden!', 'error');
        adDebug.log('📋 Führe aus: adDebug.fullDiagnostics()', 'warning');

        // Auto-Diagnostics
        setTimeout(() => {
            window.adDebug.fullDiagnostics();
        }, 500);

        return null;
    }

    function loadContent(config) {
        adDebug.log(`Lade: ${config.htmlPath}`, 'info');

        const mainContent = findMainContent();

        if (!mainContent) {
            adDebug.log('⚠️ Main-Content nicht gefunden!', 'error');
            return;
        }

        if (!state.previousContentHTML) {
            state.previousContentHTML = mainContent.innerHTML;
            state.previousContentContainer = mainContent;
        }

        mainContent.innerHTML = '';
        state.isAdBuilderActive = true;

        mainContent.innerHTML = '<div style="padding: 20px; text-align: center; color: #667eea; font-weight: bold;">⏳ adBuilder wird geladen...</div>';

        adDebug.log(`Lade HTML von: ${config.htmlPath}`, 'info');

        fetch(config.htmlPath)
            .then(r => {
                adDebug.log(`HTTP ${r.status}: ${r.statusText}`, r.ok ? 'success' : 'error');
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.text();
            })
            .then(html => {
                adDebug.log(`✅ HTML geladen (${html.length} chars)`, 'success');
                mainContent.innerHTML = html;
                adDebug.log('✅ HTML eingefügt', 'success');

                if (window.AdBuilderLogic) {
                    window.AdBuilderLogic.init();
                }
            })
            .catch(err => {
                adDebug.log(`❌ Fehler: ${err.message}`, 'error');
                mainContent.innerHTML = `<div style="padding: 20px; background: #fee; color: #c00; border-radius: 8px;"><h3>Fehler</h3><p>${err.message}</p></div>`;
            });
    }

    window.AdBuilderIntegration = { 
        init: initAdBuilder, 
        version: '1.0.8'
    };
})();

console.log('%c🎉 adBuilder v1.0.8 DEBUG geladen!', 'font-size: 14px; font-weight: bold; color: #2ecc71;');
console.log('%cTippe: adDebug.help()', 'color: #667eea; font-weight: bold;');
