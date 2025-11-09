/**
 * Debug-Helper für adBuilder Integration
 * 
 * Verwendung:
 * - Lade dieses Script STATT adbuilder.js
 * - Oder laden nach adbuilder.js für zusätzliches Debugging
 * 
 * Nutzen:
 * - Detailliertes Logging in der Console
 * - Visuelle Marker für gefundene Elemente
 * - Manuelle Teststufen
 */

console.clear();

window.adBuilderDebug = {
    // Zeige die Sidebar-Struktur
    showSidebarStructure: function() {
        const sidebar = document.querySelector('#sidebar, .sidebar, nav.sidebar, aside');
        if (!sidebar) {
            console.error('❌ Sidebar nicht gefunden!');
            return;
        }

        console.log('%c🔍 SIDEBAR STRUKTUR', 'font-size: 16px; font-weight: bold; color: #667eea;');
        console.table({
            'Element': sidebar.tagName,
            'ID': sidebar.id || '-',
            'Klasse': sidebar.className || '-',
            'Kinder': sidebar.children.length,
            'Buttons': sidebar.querySelectorAll('button').length,
            'Links': sidebar.querySelectorAll('a').length
        });

        console.log('%c📋 Alle Buttons in der Sidebar:', 'font-weight: bold; color: #f39c12;');
        sidebar.querySelectorAll('button').forEach((btn, idx) => {
            console.log(`${idx}: ${btn.textContent.trim().substring(0, 30)} [${btn.className}]`);
        });

        console.log('%c📋 HTML-Struktur der Sidebar:', 'font-weight: bold; color: #3498db;');
        console.log(sidebar.innerHTML);
    },

    // Markiere die Sidebar visuell
    highlightSidebar: function() {
        const sidebar = document.querySelector('#sidebar, .sidebar, nav.sidebar, aside');
        if (!sidebar) {
            console.error('❌ Sidebar nicht gefunden!');
            return;
        }

        sidebar.style.border = '3px solid red';
        sidebar.style.boxShadow = 'inset 0 0 10px rgba(255,0,0,0.3)';
        console.log('✅ Sidebar ist jetzt mit ROT markiert');
    },

    // Entferne die Markierung
    unhighlightSidebar: function() {
        const sidebar = document.querySelector('#sidebar, .sidebar, nav.sidebar, aside');
        if (sidebar) {
            sidebar.style.border = '';
            sidebar.style.boxShadow = '';
            console.log('✅ Markierung entfernt');
        }
    },

    // Teste Button-Einfügung manuell
    testButtonInsertion: function() {
        console.log('%c🧪 Teste Button-Einfügung...', 'font-size: 14px; font-weight: bold; color: #e74c3c;');

        const sidebar = document.querySelector('#sidebar, .sidebar, nav.sidebar, aside');
        if (!sidebar) {
            console.error('❌ Sidebar nicht gefunden!');
            return;
        }

        const testBtn = document.createElement('button');
        testBtn.id = 'test-btn-' + Date.now();
        testBtn.textContent = '🧪 TEST BUTTON';
        testBtn.style.cssText = `
            display: block;
            width: 100%;
            padding: 12px 16px;
            margin: 8px 0;
            background: yellow;
            color: black;
            border: 2px solid red;
            cursor: pointer;
            font-weight: bold;
        `;

        sidebar.appendChild(testBtn);
        console.log('✅ Test-Button eingefügt:', testBtn.id);
        console.log('   Sichtbar in der Sidebar? Schau in den Browser!');
    },

    // Zeige alle globalen Variablen von adBuilder
    showGlobals: function() {
        console.log('%c🌍 Globale adBuilder-Variablen:', 'font-size: 14px; font-weight: bold; color: #2ecc71;');

        const globals = {
            'AdBuilderIntegration': window.AdBuilderIntegration,
            'AdBuilderLogic': window.AdBuilderLogic,
            'adBuilderDebug': window.adBuilderDebug,
            '__adBuilderData': window.__adBuilderData
        };

        for (const [key, value] of Object.entries(globals)) {
            console.log(`${key}:`, value);
        }
    },

    // Zeige Console-Befehle
    help: function() {
        console.clear();
        console.log('%c📚 adBuilder Debug Helper', 'font-size: 18px; font-weight: bold; color: #667eea;');
        console.log('%c Verfügbare Befehle:', 'font-size: 14px; font-weight: bold;');
        console.log(`
        adBuilderDebug.showSidebarStructure()  - Zeige Sidebar-Details
        adBuilderDebug.highlightSidebar()      - Markiere Sidebar visuell (ROT)
        adBuilderDebug.unhighlightSidebar()    - Entferne Markierung
        adBuilderDebug.testButtonInsertion()   - Füge Test-Button ein
        adBuilderDebug.showGlobals()           - Zeige globale Variablen
        adBuilderDebug.help()                  - Diese Hilfe
        `);
    }
};

// Auto-Run bei Load
window.adBuilderDebug.help();
console.log('%c⏸️  Weitere Befehle in der Console eingeben (siehe oben)', 'color: #f39c12; font-weight: bold;');
