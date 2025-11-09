/**
 * adBuilder Integration Module
 * Version: 1.0.0
 * 
 * Integriert den adBuilder-Button in die bestehende Sidebar
 * ohne die index.html unter /template oder Dateien unter /static zu modifizieren
 * 
 * Verwendung:
 * - Diese Datei wird automatisch geladen
 * - Der Button wird nach dem "Settings"-Button eingefügt
 * - Beim Klick wird adbuilder.html dynamisch geladen
 */

(function() {
    'use strict';

    // Initialisierung beim DOM-Ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAdBuilder);
    } else {
        initAdBuilder();
    }

    /**
     * Hauptinitialisierungsfunktion
     */
    function initAdBuilder() {
        console.log('[adBuilder] Initialisierung gestartet...');

        // Konfiguration
        const config = {
            buttonId: 'adbuilder-btn',
            buttonText: 'adBuilder',
            buttonIcon: '📱', // Optional: Icon vor dem Text
            contentContainerId: 'adbuilder-container',
            htmlPath: '/app/addons/adbuilder.html',
            // Mögliche Selektoren für den Settings-Button
            settingsSelectors: [
                '[data-action="settings"]',
                '[data-btn="settings"]',
                '.settings-btn',
                '.btn-settings',
                'button[id*="settings"]',
                'a[href*="settings"]'
            ],
            // Mögliche Selektoren für die Sidebar
            sidebarSelectors: [
                '.sidebar',
                'nav.sidebar',
                'aside',
                '[role="navigation"]',
                '.side-nav',
                '#sidebar'
            ]
        };

        // 1. Finde die Sidebar
        const sidebar = findElementBySelectors(config.sidebarSelectors);
        if (!sidebar) {
            console.error('[adBuilder] Sidebar nicht gefunden. Integration abgebrochen.');
            return;
        }
        console.log('[adBuilder] Sidebar gefunden:', sidebar);

        // 2. Finde den Settings-Button
        let settingsBtn = findElementBySelectors(config.settingsSelectors, sidebar);

        if (!settingsBtn) {
            console.warn('[adBuilder] Settings-Button nicht gefunden. Suche nach letztem Button...');
            // Fallback: Nimm den letzten Button in der Sidebar
            const buttons = sidebar.querySelectorAll('button, a[role="button"], .btn');
            if (buttons.length > 0) {
                settingsBtn = buttons[buttons.length - 1];
                console.log('[adBuilder] Letzter Button gefunden:', settingsBtn);
            }
        } else {
            console.log('[adBuilder] Settings-Button gefunden:', settingsBtn);
        }

        // 3. Erstelle den adBuilder-Button
        const adBuilderBtn = createAdBuilderButton(config);

        // 4. Füge den Button in die Sidebar ein
        if (settingsBtn && settingsBtn.parentNode) {
            // Füge nach dem Settings-Button ein
            settingsBtn.parentNode.insertBefore(adBuilderBtn, settingsBtn.nextSibling);
            console.log('[adBuilder] Button nach Settings eingefügt');
        } else {
            // Fallback: Am Ende der Sidebar anhängen
            sidebar.appendChild(adBuilderBtn);
            console.log('[adBuilder] Button am Ende der Sidebar eingefügt');
        }

        // 5. Registriere Click-Handler
        adBuilderBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('[adBuilder] Button geklickt');
            loadAdBuilderContent(config);

            // Markiere Button als aktiv
            markButtonActive(adBuilderBtn);
        });

        console.log('[adBuilder] Integration erfolgreich abgeschlossen!');
    }

    /**
     * Suche Element mit mehreren Selektoren
     */
    function findElementBySelectors(selectors, parent = document) {
        for (const selector of selectors) {
            try {
                const element = parent.querySelector(selector);
                if (element) return element;
            } catch (e) {
                console.warn('[adBuilder] Ungültiger Selektor:', selector);
            }
        }
        return null;
    }

    /**
     * Erstelle den adBuilder-Button mit Styling
     */
    function createAdBuilderButton(config) {
        const button = document.createElement('button');
        button.id = config.buttonId;
        button.className = 'sidebar-btn adbuilder-btn';
        button.setAttribute('data-action', 'adbuilder');
        button.setAttribute('aria-label', 'adBuilder öffnen');
        button.setAttribute('type', 'button');

        // Button-Inhalt mit optionalem Icon
        if (config.buttonIcon) {
            button.innerHTML = `<span class="btn-icon">${config.buttonIcon}</span> <span class="btn-text">${config.buttonText}</span>`;
        } else {
            button.textContent = config.buttonText;
        }

        // Inline-Styling (falls keine CSS-Klasse vorhanden)
        button.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            width: 100%;
            padding: 10px 15px;
            text-align: left;
            background: none;
            border: none;
            cursor: pointer;
            font-size: inherit;
            font-family: inherit;
            color: inherit;
            transition: background-color 0.3s ease, transform 0.1s ease;
        `;

        // Hover-Effekt
        button.addEventListener('mouseenter', function() {
            this.style.backgroundColor = 'rgba(0, 0, 0, 0.08)';
        });

        button.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active')) {
                this.style.backgroundColor = '';
            }
        });

        // Active-Effekt beim Klicken
        button.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.98)';
        });

        button.addEventListener('mouseup', function() {
            this.style.transform = '';
        });

        return button;
    }

    /**
     * Markiere Button als aktiv
     */
    function markButtonActive(button) {
        // Entferne "active" von allen Sidebar-Buttons
        const allButtons = document.querySelectorAll('.sidebar button, .sidebar a');
        allButtons.forEach(btn => {
            btn.classList.remove('active');
            btn.style.backgroundColor = '';
        });

        // Markiere den adBuilder-Button als aktiv
        button.classList.add('active');
        button.style.backgroundColor = 'rgba(0, 0, 0, 0.12)';
    }

    /**
     * Lade den adBuilder HTML-Inhalt
     */
    function loadAdBuilderContent(config) {
        console.log('[adBuilder] Lade Inhalt von:', config.htmlPath);

        // Finde oder erstelle den Content-Container
        let container = document.getElementById(config.contentContainerId);

        if (!container) {
            container = document.createElement('div');
            container.id = config.contentContainerId;
            container.className = 'adbuilder-content';

            // Suche nach Main-Content-Bereich
            const mainContentSelectors = [
                'main',
                '.main-content',
                '.content',
                '[role="main"]',
                '#content',
                '.page-content'
            ];

            let mainContent = findElementBySelectors(mainContentSelectors);

            if (mainContent) {
                // Ersetze den Inhalt des Main-Bereichs
                mainContent.innerHTML = '';
                mainContent.appendChild(container);
            } else {
                // Fallback: Direkt in Body einfügen
                document.body.appendChild(container);
            }

            console.log('[adBuilder] Container erstellt');
        }

        // Zeige Loading-Indikator
        container.innerHTML = '<div class="loading">Lädt adBuilder...</div>';

        // Lade HTML via Fetch
        fetch(config.htmlPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return response.text();
            })
            .then(html => {
                console.log('[adBuilder] Inhalt erfolgreich geladen');
                container.innerHTML = html;

                // Initialisiere adBuilder-Logik
                initAdBuilderLogic();

                // Triggere Custom Event für externe Hooks
                const event = new CustomEvent('adBuilderLoaded', { 
                    detail: { 
                        container: container,
                        timestamp: Date.now()
                    } 
                });
                document.dispatchEvent(event);

                console.log('[adBuilder] Event "adBuilderLoaded" ausgelöst');
            })
            .catch(error => {
                console.error('[adBuilder] Fehler beim Laden:', error);
                container.innerHTML = `
                    <div class="error-message">
                        <h3>⚠️ Fehler beim Laden</h3>
                        <p>Der adBuilder konnte nicht geladen werden.</p>
                        <p><strong>Fehler:</strong> ${error.message}</p>
                        <p><small>Pfad: ${config.htmlPath}</small></p>
                    </div>
                `;
            });
    }

    /**
     * Initialisiere adBuilder-Logik (falls vorhanden)
     */
    function initAdBuilderLogic() {
        // Warte kurz, damit das DOM vollständig gerendert ist
        setTimeout(() => {
            if (typeof window.AdBuilderLogic !== 'undefined') {
                console.log('[adBuilder] Initialisiere AdBuilderLogic');
                window.AdBuilderLogic.init();
            } else {
                console.warn('[adBuilder] AdBuilderLogic nicht gefunden - adbuilder-logic.js geladen?');
            }
        }, 100);
    }

    // Exportiere für externe Nutzung
    window.AdBuilderIntegration = {
        init: initAdBuilder,
        version: '1.0.0'
    };

})();
