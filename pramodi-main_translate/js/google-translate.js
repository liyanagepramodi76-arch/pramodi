/* =========================================================
   RUBORA - CENTRAL GOOGLE TRANSLATE
   English / Sinhala / Tamil

   Works with:
   - Normal Bootstrap navbar pages
   - Farmer profile custom navbar
   - Newcal (.top-icons)
   - Login pages
   - Pages without navbar

   Language selector:
   EN | සිං | தமிழ்
   ========================================================= */

(function () {

    "use strict";

    /* =====================================================
       SETTINGS
       ===================================================== */

    const STORAGE_KEY = "rubora-language";


    /* =====================================================
       GOOGLE TRANSLATE INITIALIZATION
       ===================================================== */

   window.googleTranslateElementInit = function () {

    new google.translate.TranslateElement(
        {
            pageLanguage: "en",
            includedLanguages: "en,si,ta",
            autoDisplay: false
        },
        "google_translate_element"
    );

    setTimeout(function () {
        restoreLanguage();
    }, 1000);
};


    /* =====================================================
       CREATE HIDDEN GOOGLE TRANSLATE ELEMENT
       ===================================================== */

    function createTranslateElement() {

        if (
            document.getElementById(
                "google_translate_element"
            )
        ) {
            return;
        }

        const element =
            document.createElement("div");

        element.id =
            "google_translate_element";

        document.body.insertBefore(
            element,
            document.body.firstChild
        );
    }


    /* =====================================================
       LOAD GOOGLE TRANSLATE API
       ===================================================== */

    function loadGoogleTranslate() {

        if (
            document.getElementById(
                "google-translate-api"
            )
        ) {
            return;
        }

        const script =
            document.createElement("script");

        script.id =
            "google-translate-api";

        script.src =
            "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";

        script.async = true;

        document.head.appendChild(script);
    }


    /* =====================================================
       CHANGE LANGUAGE
       ===================================================== */

    window.changeLanguage = function (
        language,
        attempt
    ) {

        attempt = attempt || 0;

        const select =
            document.querySelector(
                ".goog-te-combo"
            );

        /*
         * Google Translate may not be ready yet.
         */
        if (!select) {

            if (attempt >= 30) {
                return;
            }

            setTimeout(function () {

                window.changeLanguage(
                    language,
                    attempt + 1
                );

            }, 400);

            return;
        }


        /*
         * Change Google Translate language.
         */
        select.value = language;

        select.dispatchEvent(
            new Event("change")
        );


        /*
         * Save language.
         */
        localStorage.setItem(
            STORAGE_KEY,
            language
        );


        /*
         * Update selected button.
         */
        updateActiveButton(
            language
        );


        /*
         * Hide Google UI.
         */
        setTimeout(
            hideGoogleElements,
            100
        );
    };


    /* =====================================================
       CREATE LANGUAGE BUTTONS
       ===================================================== */

    function createLanguageButtons() {

        /*
         * Do not create twice.
         */
        if (
            document.getElementById(
                "rubora-language-buttons"
            )
        ) {
            return;
        }


        /* -------------------------------------------------
           CREATE CONTAINER
           ------------------------------------------------- */

        const container =
            document.createElement("div");

        container.id =
            "rubora-language-buttons";


        /* -------------------------------------------------
           BUTTON HTML
           ------------------------------------------------- */

        container.innerHTML = `

            <button
                type="button"
                data-language="en"
                aria-label="English">
                EN
            </button>

            <span class="language-divider">|</span>

            <button
                type="button"
                data-language="si"
                aria-label="Sinhala">
                සිං
            </button>

            <span class="language-divider">|</span>

            <button
                type="button"
                data-language="ta"
                aria-label="Tamil">
                தமிழ்
            </button>

        `;


        /* =================================================
           PAGE TYPE 1:
           NEWCAL / TOP ICON PAGES
           ================================================= */

        const topIcons =
            document.querySelector(
                ".top-icons"
            );


        if (topIcons) {

            /*
             * Newcal:
             *
             * Back Home
             * Dark Mode
             * EN | සිං | தமிழ்
             */

            container.classList.add(
                "rubora-top-icons-language"
            );

            topIcons.appendChild(
                container
            );
        }


        /* =================================================
           PAGE TYPE 2:
           FARMER PROFILE CUSTOM NAVBAR
           ================================================= */

        else {

            const farmerMenu =
                document.querySelector(
                    ".top-navbar .top-menu"
                );


            if (farmerMenu) {

                /*
                 * IMPORTANT:
                 * farmer-profile.html does NOT use
                 * Bootstrap .navbar.
                 *
                 * Put the language selector directly
                 * inside .top-menu.
                 */

                container.classList.add(
                    "rubora-farmer-language"
                );


                /*
                 * Force the custom menu to behave
                 * as a horizontal flex menu.
                 */
                farmerMenu.style.display =
                    "flex";

                farmerMenu.style.alignItems =
                    "center";


                /*
                 * Add selector as the final
                 * item in the menu.
                 */
                farmerMenu.appendChild(
                    container
                );
            }


            /* =================================================
               PAGE TYPE 3:
               NORMAL BOOTSTRAP NAVBAR
               ================================================= */

            else {

                const navbar =
                    document.querySelector(
                        "nav.navbar, .navbar"
                    );


                if (navbar) {

                    const navContainer =
                        navbar.querySelector(
                            ".container, .container-fluid"
                        );


                    if (navContainer) {

                        /*
                         * Try to find the right side.
                         */
                        const rightSide =
                            navContainer.querySelector(
                                ".ms-auto"
                            );


                        if (rightSide) {

                            rightSide.appendChild(
                                container
                            );

                        }

                        else {

                            navContainer.appendChild(
                                container
                            );
                        }

                    }

                    else {

                        navbar.appendChild(
                            container
                        );
                    }
                }


                /* =============================================
                   PAGE TYPE 4:
                   NO NAVBAR
                   ============================================= */

                else {

                    /*
                     * Login and other pages without
                     * a navbar use fixed top-right.
                     */

                    container.classList.add(
                        "rubora-floating-language"
                    );

                    document.body.appendChild(
                        container
                    );
                }
            }
        }


        /* =================================================
           BUTTON CLICK EVENTS
           ================================================= */

        container
            .querySelectorAll(
                "button[data-language]"
            )
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const language =
                            this.dataset.language;

                        window.changeLanguage(
                            language
                        );
                    }
                );
            });


        /* =================================================
           SET ACTIVE LANGUAGE
           ================================================= */

        updateActiveButton(
            localStorage.getItem(
                STORAGE_KEY
            ) || "en"
        );
    }


    /* =====================================================
       UPDATE ACTIVE LANGUAGE BUTTON
       ===================================================== */

    function updateActiveButton(language) {

        document
            .querySelectorAll(
                "#rubora-language-buttons button"
            )
            .forEach(function (button) {

                button.classList.remove(
                    "active-language"
                );


                if (
                    button.dataset.language ===
                    language
                ) {

                    button.classList.add(
                        "active-language"
                    );
                }
            });
    }


    /* =====================================================
       ADD CSS
       ===================================================== */

    function addStyles() {

        /*
         * Do not add CSS twice.
         */

        if (
            document.getElementById(
                "rubora-google-translate-css"
            )
        ) {
            return;
        }


        const style =
            document.createElement("style");

        style.id =
            "rubora-google-translate-css";


        style.textContent = `

            /* =============================================
               HIDE GOOGLE TRANSLATE ELEMENT
               ============================================= */

            #google_translate_element {

                position: absolute !important;

                left: -99999px !important;

                top: -99999px !important;

                width: 1px !important;

                height: 1px !important;

                overflow: hidden !important;
            }


            .goog-te-gadget {

                display: none !important;
            }


            /* =============================================
               HIDE GOOGLE TRANSLATE BANNER
               ============================================= */

            .goog-te-banner-frame,
            .goog-te-banner-frame.skiptranslate,
            iframe.goog-te-banner-frame {

                display: none !important;

                visibility: hidden !important;

                height: 0 !important;

                width: 0 !important;
            }


            body > .skiptranslate {

                display: none !important;

                visibility: hidden !important;

                height: 0 !important;
            }


            body {

                top: 0 !important;
            }


            html {

                margin-top: 0 !important;
            }


            /* =============================================
               HIDE GOOGLE TOOLTIP
               ============================================= */

            .goog-tooltip,
            .goog-text-highlight {

                display: none !important;
            }


            /* =============================================
               MAIN LANGUAGE SELECTOR
               ============================================= */

            #rubora-language-buttons {

                display: flex !important;

                align-items: center !important;

                justify-content: center !important;

                gap: 3px;

                margin-left: 12px;

                flex: 0 0 auto !important;

                flex-shrink: 0 !important;

                width: auto !important;

                height: auto !important;

                white-space: nowrap;

                z-index: 99999;
            }


            /* =============================================
               LANGUAGE BUTTON
               ============================================= */

            #rubora-language-buttons button {

                width: auto !important;

                height: auto !important;

                min-width: auto !important;

                min-height: auto !important;

                max-width: none !important;

                border: none !important;

                background: transparent;

                color: #166534;

                padding: 5px 6px;

                margin: 0 !important;

                border-radius: 5px;

                cursor: pointer;

                font-size: 12px;

                font-weight: 600;

                line-height: 1.2;

                white-space: nowrap;

                box-shadow: none !important;

                flex: 0 0 auto !important;

                transition:
                    background 0.2s ease,
                    color 0.2s ease;
            }


            /* =============================================
               HOVER
               ============================================= */

            #rubora-language-buttons button:hover {

                background: #166534;

                color: #ffffff;
            }


            /* =============================================
               ACTIVE LANGUAGE
               ============================================= */

            #rubora-language-buttons button.active-language {

                background: #166534;

                color: #ffffff;
            }


            /* =============================================
               DIVIDER
               ============================================= */

            .language-divider {

                color: #999;

                font-size: 12px;

                line-height: 1;

                user-select: none;

                flex: 0 0 auto;
            }


            /* =============================================
               NEWCAL TOP ICONS
               ============================================= */

            .top-icons #rubora-language-buttons {

                position: static !important;

                margin-left: 4px !important;

                margin-right: 0 !important;

                padding: 0 !important;

                flex: 0 0 auto !important;
            }


            /* =============================================
               FARMER PROFILE
               ============================================= */

            .top-navbar .top-menu {

                align-items: center !important;
            }


            .top-navbar
            .top-menu
            #rubora-language-buttons {

                position: static !important;

                display: flex !important;

                align-items: center !important;

                justify-content: center !important;

                flex: 0 0 auto !important;

                width: auto !important;

                height: auto !important;

                margin-left: 10px !important;

                margin-right: 0 !important;

                padding: 0 !important;

                white-space: nowrap !important;

                z-index: 99999 !important;
            }


            .top-navbar
            .top-menu
            #rubora-language-buttons button {

                position: static !important;

                display: inline-flex !important;

                align-items: center !important;

                justify-content: center !important;

                width: auto !important;

                height: auto !important;

                padding: 5px 6px !important;

                margin: 0 !important;
            }


            /* =============================================
               NO NAVBAR / LOGIN
               ============================================= */

            #rubora-language-buttons.rubora-floating-language {

                position: fixed !important;

                top: 20px !important;

                right: 25px !important;

                left: auto !important;

                bottom: auto !important;

                width: auto !important;

                height: auto !important;

                margin: 0 !important;

                padding: 5px 7px !important;

                background:
                    rgba(255, 255, 255, 0.97);

                border-radius: 8px;

                box-shadow:
                    0 4px 15px
                    rgba(0, 0, 0, 0.15);

                z-index: 999999 !important;
            }


            /* =============================================
               MOBILE
               ============================================= */

            @media (max-width: 991px) {

                #rubora-language-buttons {

                    margin-left: 8px;

                    gap: 2px;
                }


                #rubora-language-buttons button {

                    padding: 5px 5px;

                    font-size: 11px;
                }
            }


            @media (max-width: 576px) {

                #rubora-language-buttons.rubora-floating-language {

                    top: 12px !important;

                    right: 12px !important;
                }


                .top-icons {

                    gap: 6px !important;
                }


                .top-icons
                #rubora-language-buttons button {

                    padding: 4px 5px !important;

                    font-size: 11px !important;
                }


                .top-navbar .top-menu {

                    flex-wrap: wrap !important;
                }


                .top-navbar
                .top-menu
                #rubora-language-buttons {

                    margin-left: 0 !important;

                    margin-top: 4px !important;
                }
            }

        `;


        document.head.appendChild(
            style
        );
    }


    /* =====================================================
       HIDE GOOGLE ELEMENTS
       ===================================================== */

    function hideGoogleElements() {

        /*
         * Google banner
         */

        document
            .querySelectorAll(
                ".goog-te-banner-frame, " +
                ".goog-te-banner-frame.skiptranslate, " +
                "iframe.goog-te-banner-frame"
            )
            .forEach(function (element) {

                element.style.display =
                    "none";

                element.style.visibility =
                    "hidden";

                element.style.height =
                    "0";

                element.style.width =
                    "0";
            });


        /*
         * Google body translation container
         */

        document
            .querySelectorAll(
                "body > .skiptranslate"
            )
            .forEach(function (element) {

                element.style.display =
                    "none";

                element.style.visibility =
                    "hidden";

                element.style.height =
                    "0";
            });


        /*
         * Reset Google body movement.
         */

        document.body.style.top =
            "0px";

        document.documentElement.style.marginTop =
            "0px";


        /*
         * Hide Google tooltip.
         */

        document
            .querySelectorAll(
                ".goog-tooltip, " +
                ".goog-text-highlight"
            )
            .forEach(function (element) {

                element.style.display =
                    "none";
            });
    }


    /* =====================================================
       RESTORE SAVED LANGUAGE
       ===================================================== */

    function restoreLanguage() {

    const savedLanguage =
        localStorage.getItem(STORAGE_KEY);

    /*
     * If there is no saved language,
     * keep the page in English.
     */
    if (!savedLanguage) {

        updateActiveButton("en");
        return;
    }

    let attempts = 0;

    const timer = setInterval(function () {

        const select =
            document.querySelector(".goog-te-combo");

        attempts++;

        if (select) {

            select.value = savedLanguage;

            select.dispatchEvent(
                new Event("change")
            );

            updateActiveButton(
                savedLanguage
            );

            clearInterval(timer);

            /*
             * Hide Google elements again
             * after translation starts.
             */
            setTimeout(
                hideGoogleElements,
                300
            );
        }

        /*
         * Stop after 15 seconds.
         */
        if (attempts >= 30) {

            clearInterval(timer);
        }

    }, 500);
}


    /* =====================================================
       INITIALIZE
       ===================================================== */

    function initialize() {

        createTranslateElement();

        addStyles();

        createLanguageButtons();

        loadGoogleTranslate();

        /*restoreLanguage();*/

        hideGoogleElements();
    }


    /* =====================================================
       START SCRIPT
       ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize
        );

    } else {

        initialize();
    }


    /* =====================================================
       CONTINUOUS GOOGLE UI CLEANUP
       ===================================================== */

    setInterval(
        hideGoogleElements,
        500
    );

})();