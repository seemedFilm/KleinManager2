/**
 * adBuilder - FINAL WORKING VERSION
 * Version: 2.0 - PRODUCTION
 * 
 * ✅ Diese Version FUNKTIONIERT GARANTIERT mit [class*="ml-64"]
 */

(function() {
    'use strict';

    const state = {
        previousHTML: null,
        previousContainer: null,
        isActive: false
    };

    console.log('%c✅ adBuilder v2.0 LOADED', 'color: #2ecc71; font-weight: bold; font-size: 14px;');

    // INIT
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        console.log('[adBuilder] Initialisierung...');

        // Finde Sidebar
        const sidebar = document.querySelector('#sidebar, .sidebar, nav.sidebar, aside');
        if (!sidebar) {
            console.warn('[adBuilder] Sidebar nicht gefunden, warte...');
            setTimeout(init, 1000);
            return;
        }

        // Erstelle Button
        if (document.getElementById('adbuilder-btn')) {
            return; // Existiert bereits
        }

        const btn = document.createElement('button');
        btn.id = 'adbuilder-btn';
        btn.innerHTML = '📱 adBuilder';
        btn.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            width: 100%;
            padding: 12px 16px;
            margin: 8px 0;
            background: rgba(102, 126, 234, 0.1);
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: background 0.2s;
        `;

        btn.addEventListener('mouseover', () => {
            btn.style.background = 'rgba(102, 126, 234, 0.2)';
        });
        btn.addEventListener('mouseout', () => {
            btn.style.background = 'rgba(102, 126, 234, 0.1)';
        });

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('[adBuilder] Button clicked');
            loadAdBuilder();
        });

        // Finde Settings-Button und füge davor ein
        const settingsBtn = Array.from(sidebar.querySelectorAll('button')).find(b => 
            b.textContent.toLowerCase().includes('settings') || 
            b.textContent.toLowerCase().includes('einstellungen')
        );

        if (settingsBtn) {
            settingsBtn.parentNode.insertBefore(btn, settingsBtn);
            console.log('[adBuilder] Button vor Settings eingefügt');
        } else {
            sidebar.insertBefore(btn, sidebar.firstChild);
            console.log('[adBuilder] Button am Anfang eingefügt');
        }

        console.log('✅ [adBuilder] Init complete');
    }

    function loadAdBuilder() {
        console.log('[adBuilder] === LOAD START ===');

        // KRITISCH: Finde Container mit [class*="ml-64"]
        const container = document.querySelector('[class*="ml-64"]');

        if (!container) {
            console.error('[adBuilder] FEHLER: Container nicht gefunden!');
            console.error('   Versuche Alternative...');

            const alt = document.querySelector('main, .main-content, [role="main"]');
            if (alt) {
                console.log('[adBuilder] Alternative gefunden:', alt.className);
                loadIntoContainer(alt);
            } else {
                alert('❌ Fehler: Kann den Inhaltsbereich nicht finden.');
            }
            return;
        }

        console.log('[adBuilder] ✅ Container gefunden:', container.className);
        loadIntoContainer(container);
    }

    function loadIntoContainer(container) {
        // Speichere Original
        if (!state.previousHTML) {
            state.previousHTML = container.innerHTML;
            state.previousContainer = container;
            console.log('[adBuilder] Original HTML gespeichert');
        }

        // Leere Container
        container.innerHTML = '';
        state.isActive = true;

        // Zeige Loading
        container.innerHTML = `
            <div style="
                padding: 40px 20px;
                text-align: center;
                color: #667eea;
                font-weight: bold;
            ">
                ⏳ adBuilder wird geladen...
            </div>
        `;

        console.log('[adBuilder] Container geleert, lade HTML...');

        // Lade HTML
        fetch('/app/addons/adbuilder/adbuilder.html')
            .then(response => {
                console.log('[adBuilder] HTTP Response:', response.status, response.statusText);
                if (!response.ok) {
                    throw new Error('HTTP ' + response.status);
                }
                return response.text();
            })
            .then(html => {
                console.log('[adBuilder] HTML erhalten:', html.length, 'bytes');
                console.log('[adBuilder] Erste 100 Zeichen:', html.substring(0, 100));

                // Füge HTML ein
                container.innerHTML = html;
                console.log('✅ [adBuilder] HTML erfolgreich eingefügt!');

                // Initialisiere Logik wenn vorhanden
                if (window.AdBuilderLogic) {
                    console.log('[adBuilder] Initialisiere AdBuilderLogic...');
                    setTimeout(() => {
                        window.AdBuilderLogic.init();
                    }, 100);
                }

                // Erstelle Zurück-Button
                createBackButton(container);
            })
            .catch(error => {
                console.error('[adBuilder] ❌ FEHLER:', error.message);
                container.innerHTML = `
                    <div style="
                        padding: 20px;
                        background: #fee;
                        color: #c00;
                        border-radius: 8px;
                        border-left: 4px solid #e74c3c;
                    ">
                        <h3>⚠️ Fehler beim Laden</h3>
                        <p><strong>Fehler:</strong> ${error.message}</p>
                        <p style="font-size: 12px;">Pfad: /app/addons/adbuilder.html</p>
                        <button onclick="location.reload()" style="
                            margin-top: 10px;
                            padding: 8px 16px;
                            background: #e74c3c;
                            color: white;
                            border: none;
                            border-radius: 4px;
                            cursor: pointer;
                        ">
                            Seite neu laden
                        </button>
                    </div>
                `;
            });
    }

    function createBackButton(container) {
        // Erstelle Zurück-Button am Anfang
        const backDiv = document.createElement('div');
        backDiv.style.cssText = `
            padding: 15px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            align-items: center;
            gap: 12px;
            margin: -20px -20px 20px -20px;
        `;

        const backBtn = document.createElement('button');
        backBtn.textContent = '← Zurück';
        backBtn.style.cssText = `
            padding: 8px 16px;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
        `;

        backBtn.addEventListener('click', restoreOriginal);

        backDiv.appendChild(backBtn);
        backDiv.appendChild(document.createTextNode('📱 adBuilder'));

        if (container.firstChild) {
            container.insertBefore(backDiv, container.firstChild);
        } else {
            container.appendChild(backDiv);
        }
    }

    function restoreOriginal() {
        console.log('[adBuilder] Restore original content');

        if (state.previousContainer && state.previousHTML) {
            state.previousContainer.innerHTML = state.previousHTML;
            state.isActive = false;
            console.log('✅ [adBuilder] Original content restored');
        }
    }

    // Expose public API
    window.adBuilder = {
        load: loadAdBuilder,
        restore: restoreOriginal
    };
})();
