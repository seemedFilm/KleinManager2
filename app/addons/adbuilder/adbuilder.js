/**
 * adBuilder - Dynamic Section Integration
 * Version: 4.0 - DYNAMIC (ohne index.html zu ändern)
 * 
 * ✅ Lädt adBuilder dynamisch in den DOM
 * ✅ Integriert als normale Section
 * ✅ Keine index.html Änderungen nötig
 */

(function() {
    'use strict';

    console.log('%c✅ adBuilder v4.0 Dynamic', 'color: #2ecc71; font-weight: bold; font-size: 14px;');

    const state = {
        sectionLoaded: false
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 500);
    }

    function init() {
        console.log('[adBuilder] Initialisierung...');

        // Warte kurz damit other scripts laden
        // setTimeout(() => {
        //     setupButton();
        // }, 100);
    }

    // function setupButton() {
    //     const sidebar = document.querySelector('.sidebar');
    //     if (!sidebar) {
    //         console.warn('[adBuilder] Sidebar nicht gefunden, warte...');
    //         setTimeout(setupButton, 1000);
    //         return;
    //     }

    //     // Prüfe ob Button bereits existiert
    //     if (document.getElementById('adbuilder-btn')) {
    //         console.log('[adBuilder] Button existiert bereits');
    //         return;
    //     }

    //     console.log('[adBuilder] Sidebar gefunden, erstelle Button');

    //     // Erstelle Button
    //     const btn = document.createElement('button');
    //     btn.id = 'adbuilder-btn';
    //     btn.className = 'sidebar-btn';
    //     btn.innerHTML = '<span>📱</span> adBuilder';
    //     btn.setAttribute('data-action', 'adbuilder');

    //     btn.addEventListener('click', function(e) {
    //         e.preventDefault();
    //         console.log('[adBuilder] Button clicked');
    //         showAdBuilder();
    //     });

    //     // Finde Settings-Button und füge davor ein
    //     const buttons = sidebar.querySelectorAll('button');
    //     let insertAfter = null;

    //     for (let b of buttons) {
    //         if (b.textContent.toLowerCase().includes('settings') || 
    //             b.getAttribute('data-action') === 'settings') {
    //             insertAfter = b;
    //             break;
    //         }
    //     }

    //     if (insertAfter) {
    //         // Füge vor Settings ein
    //         if (insertAfter.nextSibling) {
    //             insertAfter.parentNode.insertBefore(btn, insertAfter.nextSibling);
    //         } else {
    //             insertAfter.parentNode.appendChild(btn);
    //         }
    //         console.log('[adBuilder] Button vor/nach Settings');
    //     } else {
    //         sidebar.insertBefore(btn, sidebar.firstChild);
    //         console.log('[adBuilder] Button am Anfang');
    //     }

    //     console.log('✅ [adBuilder] Button ready');
    // }

    function showAdBuilder() {
        console.log('[adBuilder] Show section');

        // Finde oder erstelle Container
        let adbuilderSection = document.getElementById('adbuilder');

        if (!adbuilderSection) {
            console.log('[adBuilder] Section existiert noch nicht, lade...');
            loadAdBuilderSection();
            return;
        }

        // Verstecke alle anderen Sections
        hideAllSections();

        // Zeige adBuilder
        adbuilderSection.classList.remove('hidden');
        console.log('✅ [adBuilder] Section shown');
    }

    function hideAllSections() {
        // Finde alle Sections (die bestehen oder die wir erstellt haben)
        document.querySelectorAll('[class*="section"], [id*="section"]').forEach(el => {
            // Ignoriere adbuilder Section
            if (el.id !== 'adbuilder') {
                // Nur Elemente mit .section Klasse
                if (el.classList.contains('section') && !el.classList.contains('hidden')) {
                    el.classList.add('hidden');
                    console.log('[adBuilder] Hidden:', el.id || el.className);
                }
            }
        });
    }

    function loadAdBuilderSection() {
        console.log('[adBuilder] Lade adbuilder.html...');

        fetch('/app/addons/adbuilder/adbuilder.html')
            .then(r => {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.text();
            })
            .then(html => {
                console.log('[adBuilder] HTML erhalten:', html.length, 'bytes');

                // Bereinige HTML (entferne DOCTYPE, html, body Tags)
                let cleanHTML = html
                    .replace(/<!DOCTYPE[^>]*>/gi, '')
                    .replace(/<\/?html[^>]*>/gi, '')
                    .replace(/<body[^>]*>/gi, '')
                    .replace(/<\/body>/gi, '')
                    .replace(/<head[^>]*>.*?<\/head>/gi, '');

                // Prüfe ob schon ein <div id="adbuilder"> existiert
                if (!cleanHTML.includes('id="adbuilder"')) {
                    console.log('[adBuilder] Wickel HTML in adbuilder Section');
                    cleanHTML = `<div id="adbuilder" class="section">${cleanHTML}</div>`;
                }

                // Finde Einfügungspunkt
                // Bevorzugt nach settings Section
                let insertPoint = document.body;

                const settingsSection = document.querySelector('[id="settings"]');
                if (settingsSection) {
                    console.log('[adBuilder] Füge nach settings ein');
                    // Finde das Eltern-Element wo settings ist
                    insertPoint = settingsSection.parentElement || document.body;
                }

                // Erstelle temporäres Container für innerHTML
                const temp = document.createElement('div');
                temp.innerHTML = cleanHTML;
                const adbuilderDiv = temp.firstElementChild;

                // Setze hidden class
                if (!adbuilderDiv.classList.contains('hidden')) {
                    adbuilderDiv.classList.add('hidden');
                }

                // Füge in DOM ein
                insertPoint.appendChild(adbuilderDiv);

                console.log('✅ [adBuilder] HTML eingefügt');
                state.sectionLoaded = true;

                // Jetzt zeige die Section
                hideAllSections();
                adbuilderDiv.classList.remove('hidden');

                // Initialisiere Logik falls vorhanden
                if (window.AdBuilderLogic) {
                    console.log('[adBuilder] Initialisiere Logik');
                    window.AdBuilderLogic.init();
                }
            })
            .catch(err => {
                console.error('[adBuilder] ❌ Fehler:', err.message);
                alert('adBuilder Fehler: ' + err.message);
            });
    }

    // Public API
    window.adBuilder = {
        show: showAdBuilder,
        load: loadAdBuilderSection
    };
})();
