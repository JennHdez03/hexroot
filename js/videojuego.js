(() => {
    "use strict";

    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    /* =========================================
       MENÚ DE NAVEGACIÓN
    ========================================= */

    const menuButton = document.getElementById("gameMenuButton");
    const menu = document.getElementById("gameMenu");

    function closeMenu() {
        if (!menuButton || !menu) return;

        menuButton.setAttribute("aria-expanded", "false");
        menu.setAttribute("aria-hidden", "true");
        menu.classList.remove("open");
        document.body.classList.remove("menu-open");
    }

    function toggleMenu() {
        if (!menuButton || !menu) return;

        const isOpen =
            menuButton.getAttribute("aria-expanded") === "true";

        menuButton.setAttribute("aria-expanded", String(!isOpen));
        menu.setAttribute("aria-hidden", String(isOpen));
        menu.classList.toggle("open", !isOpen);
        document.body.classList.toggle("menu-open", !isOpen);
    }

    menuButton?.addEventListener("click", toggleMenu);

    menu?.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") closeMenu();
    });


    /* =========================================
       BRILLO QUE SIGUE AL CURSOR
    ========================================= */

    const cursorGlow = document.getElementById("cursorGlow");

    if (cursorGlow && !prefersReducedMotion) {
        window.addEventListener("pointermove", event => {
            cursorGlow.style.left = `${event.clientX}px`;
            cursorGlow.style.top = `${event.clientY}px`;
        }, { passive: true });
    } else if (cursorGlow) {
        cursorGlow.hidden = true;
    }


    /* =========================================
       BARRA DE PROGRESO GLOBAL
    ========================================= */

    const progressBar = document.getElementById("gameProgressBar");

    function updateProgress() {
        if (!progressBar) return;

        const scrollableHeight =
            document.documentElement.scrollHeight - window.innerHeight;

        const progress = scrollableHeight > 0
            ? (window.scrollY / scrollableHeight) * 100
            : 0;

        progressBar.style.width =
            `${Math.min(100, Math.max(0, progress))}%`;
    }

    window.addEventListener("scroll", updateProgress, {
        passive: true
    });

    window.addEventListener("resize", updateProgress);
    updateProgress();


    /* =========================================
       HEX ROOT — RECORRIDO CINEMATOGRÁFICO
       Sin pin para evitar pantallas negras
    ========================================= */

    const cinematicScenes = [
        {
            id: "escape-room",
            target: ".hero-content",
            from: {
                x: -2000,
                y: 455,
                z: -100,
                rotateY: -8,
                rotateX: 90,
                scale: 0.7
            }
        },
        {
            id: "objetivo",
            target: ".objective-layout",
            from: {
                x: 90,
                y: 25,
                z: -80,
                rotateY: 8,
                rotateX: -2,
                scale: 0.95
            }
        },
        {
            id: "pruebas",
            target: ".challenge-heading",
            from: {
                x: -75,
                y: 30,
                z: -80,
                rotateY: -7,
                rotateX: 2,
                scale: 0.96
            }
        },
        {
            id: "sala-profesores",
            target: ".room-content",
            from: {
                x: 65,
                y: 45,
                z: -90,
                rotateY: 7,
                rotateX: 3,
                scale: 0.95
            }
        },
        {
            id: "tiempo-limite",
            target: ".timer-heading",
            from: {
                x: -55,
                y: -35,
                z: -80,
                rotateY: -6,
                rotateX: -3,
                scale: 0.96
            }
        },
        {
            id: "protocolo-final",
            target: ".ending-content",
            from: {
                x: 0,
                y: 45,
                z: -100,
                rotateY: 0,
                rotateX: 5,
                scale: 0.94
            }
        }
    ];

    function activateScene(activeScene) {
        document.querySelectorAll(".game-scene").forEach(scene => {
            scene.classList.toggle(
                "is-active",
                scene === activeScene
            );
        });
    }

    function initCinematicCamera() {
        const scenes = document.querySelectorAll(".game-scene");

        // Si GSAP no carga, el contenido sigue visible.
        if (!window.gsap || !window.ScrollTrigger) {
            scenes.forEach(scene => {
                scene.style.opacity = "1";
                scene.style.visibility = "visible";
            });
            return;
        }

        gsap.registerPlugin(ScrollTrigger);

        const mobile =
            window.matchMedia("(max-width: 700px)").matches;

        const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        // Limpiar animaciones anteriores de este recorrido.
        ScrollTrigger.getAll().forEach(trigger => {
            if (
                typeof trigger.vars.id === "string" &&
                trigger.vars.id.startsWith("hex-camera-")
            ) {
                trigger.kill();
            }
        });

        // Restablecer visibilidad de las secciones.
        scenes.forEach(scene => {
            scene.style.opacity = "1";
            scene.style.visibility = "visible";
        });

        if (reduceMotion) {
            scenes.forEach(scene => {
                scene.classList.add("is-active");
            });
            return;
        }

        cinematicScenes.forEach((config, index) => {
            const scene = document.getElementById(config.id);
            const target = scene?.querySelector(config.target);

            if (!scene || !target) return;

            // Detectar la sección activa sin superponer las escenas.
            ScrollTrigger.create({
                id: `hex-camera-active-${config.id}`,
                trigger: scene,
                start: "top 60%",
                end: "bottom 40%",
                onEnter: () => activateScene(scene),
                onEnterBack: () => activateScene(scene)
            });

            const from = { ...config.from };

            if (mobile) {
                from.x *= 0.45;
                from.y *= 0.5;
                from.z *= 0.45;
                from.rotateX *= 0.5;
                from.rotateY *= 0.5;
            }

            // Entrada 3D del contenido.
            gsap.fromTo(
                target,
                {
                    x: from.x,
                    y: from.y,
                    z: from.z,
                    rotateY: from.rotateY,
                    rotateX: from.rotateX,
                    scale: from.scale,
                    opacity: 0.65,
                    transformPerspective: 1100,
                    transformOrigin: "50% 50%",
                    force3D: true
                },
                {
                    x: 0,
                    y: 0,
                    z: 0,
                    rotateY: 0,
                    rotateX: 0,
                    scale: 1,
                    opacity: 1,
                    duration: mobile ? 0.75 : 1.05,
                    ease: "power3.out",
                    clearProps: "transform",
                    immediateRender: false,
                    scrollTrigger: {
                        id: `hex-camera-${config.id}`,
                        trigger: scene,
                        start: index === 0
                            ? "top 85%"
                            : "top 72%",
                        toggleActions: "play none none reverse",
                        invalidateOnRefresh: true
                    }
                }
            );
        });

        const firstScene = document.getElementById("escape-room");

        if (
            firstScene &&
            window.scrollY < firstScene.offsetHeight * 0.5
        ) {
            activateScene(firstScene);
        }

        ScrollTrigger.refresh();
    }

    if (document.readyState === "complete") {
        initCinematicCamera();
    } else {
        window.addEventListener(
            "load",
            initCinematicCamera,
            { once: true }
        );
    }


    /* =========================================
       CARRUSEL HORIZONTAL — LAS PRUEBAS
    ========================================= */

    const viewport = document.getElementById("challengeViewport");
    const track = document.getElementById("challengeTrack");
    const previousButton = document.getElementById("challengePrev");
    const nextButton = document.getElementById("challengeNext");
    const counter = document.getElementById("challengeCounter");
    const challengeProgress =
        document.getElementById("challengeProgressBar");

    if (viewport && track) {
        let currentIndex = 0;
        let startX = 0;
        let startTranslate = 0;
        let dragging = false;
        let pointerStartX = 0;
        let moved = false;

        const cards = Array.from(
            track.querySelectorAll(".challenge-card")
        );

        const clamp = (value, min, max) =>
            Math.min(max, Math.max(min, value));

        function getMaxTranslate() {
            return Math.max(
                0,
                track.scrollWidth - viewport.clientWidth
            );
        }

        function getCardTranslate(index) {
            const card = cards[index];
            if (!card) return 0;

            const cardCenter =
                card.offsetLeft + card.offsetWidth / 2;

            const viewportCenter = viewport.clientWidth / 2;

            return clamp(
                cardCenter - viewportCenter,
                0,
                getMaxTranslate()
            );
        }

        function getNearestIndex(translate) {
            let nearest = 0;
            let nearestDistance = Infinity;

            cards.forEach((card, index) => {
                const distance = Math.abs(
                    getCardTranslate(index) - translate
                );

                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearest = index;
                }
            });

            return nearest;
        }

        function renderCarousel(animate = true) {
            if (!cards.length) return;

            currentIndex = clamp(
                currentIndex,
                0,
                cards.length - 1
            );

            const translate = getCardTranslate(currentIndex);

            if (window.gsap && !prefersReducedMotion && animate) {
                gsap.to(track, {
                    x: -translate,
                    duration: 0.55,
                    ease: "power3.out",
                    overwrite: true
                });
            } else {
                if (window.gsap) {
                    gsap.killTweensOf(track);
                }

                track.style.transform =
                    `translate3d(${-translate}px, 0, 0)`;
            }

            if (counter) {
                counter.textContent =
                    `${String(currentIndex + 1).padStart(2, "0")} / ${String(cards.length).padStart(2, "0")}`;
            }

            if (challengeProgress) {
                challengeProgress.style.width =
                    `${((currentIndex + 1) / cards.length) * 100}%`;
            }

            if (previousButton) {
                previousButton.disabled = currentIndex === 0;
            }

            if (nextButton) {
                nextButton.disabled =
                    currentIndex >= cards.length - 1;
            }

            cards.forEach((card, index) => {
                card.setAttribute(
                    "aria-current",
                    index === currentIndex ? "true" : "false"
                );
            });
        }

        function goToCard(index) {
            currentIndex = clamp(
                index,
                0,
                cards.length - 1
            );

            renderCarousel();
        }

        previousButton?.addEventListener("click", () => {
            goToCard(currentIndex - 1);
        });

        nextButton?.addEventListener("click", () => {
            goToCard(currentIndex + 1);
        });

        // Arrastre con ratón y pantalla táctil.
        viewport.addEventListener("pointerdown", event => {
            if (
                event.pointerType === "mouse" &&
                event.button !== 0
            ) {
                return;
            }

            dragging = true;
            moved = false;
            startX = event.clientX;
            pointerStartX = event.clientX;

            const transform = getComputedStyle(track).transform;
            const matrix = new DOMMatrixReadOnly(
                transform === "none"
                    ? "matrix(1, 0, 0, 1, 0, 0)"
                    : transform
            );

            startTranslate = -matrix.m41;

            viewport.classList.add("dragging");

            if (viewport.setPointerCapture) {
                viewport.setPointerCapture(event.pointerId);
            }
        });

        viewport.addEventListener("pointermove", event => {
            if (!dragging) return;

            const delta = event.clientX - startX;

            if (Math.abs(event.clientX - pointerStartX) > 5) {
                moved = true;
            }

            if (moved) {
                if (window.gsap) {
                    gsap.killTweensOf(track);
                }

                const translate = clamp(
                    startTranslate - delta,
                    0,
                    getMaxTranslate()
                );

                track.style.transform =
                    `translate3d(${-translate}px, 0, 0)`;
            }
        });

        function finishDrag() {
            if (!dragging) return;

            dragging = false;
            viewport.classList.remove("dragging");

            if (moved) {
                const transform = getComputedStyle(track).transform;
                const matrix = new DOMMatrixReadOnly(
                    transform === "none"
                        ? "matrix(1, 0, 0, 1, 0, 0)"
                        : transform
                );

                currentIndex = getNearestIndex(-matrix.m41);
                renderCarousel();
            }
        }

        viewport.addEventListener("pointerup", finishDrag);
        viewport.addEventListener("pointercancel", finishDrag);
        viewport.addEventListener(
            "lostpointercapture",
            finishDrag
        );

        viewport.tabIndex = 0;

        viewport.addEventListener("keydown", event => {
            if (event.key === "ArrowRight") {
                event.preventDefault();
                goToCard(currentIndex + 1);
            }

            if (event.key === "ArrowLeft") {
                event.preventDefault();
                goToCard(currentIndex - 1);
            }
        });

        window.addEventListener("resize", () => {
            renderCarousel(false);
        });

        renderCarousel(false);
    }


    /* =========================================
       CRONOLOGÍA VISUAL DEL TIEMPO LÍMITE
       No es un cronómetro real del videojuego
    ========================================= */

    const timelineEvents = Array.from(
        document.querySelectorAll(".timeline-event")
    );

    if (
        timelineEvents.length &&
        window.gsap &&
        window.ScrollTrigger
    ) {
        timelineEvents.forEach(eventElement => {
            ScrollTrigger.create({
                trigger: eventElement,
                start: "top 75%",
                end: "bottom 35%",
                onEnter: () => setActiveTimeline(eventElement),
                onEnterBack: () => setActiveTimeline(eventElement)
            });
        });
    }

    function setActiveTimeline(activeElement) {
        timelineEvents.forEach(eventElement => {
            eventElement.classList.toggle(
                "active",
                eventElement === activeElement
            );
        });
    }


    /* =========================================
       ACTUALIZACIÓN FINAL
    ========================================= */

    window.addEventListener("load", () => {
        if (window.ScrollTrigger) {
            ScrollTrigger.refresh();
        }

        updateProgress();
    });



    window.addEventListener("load", () => {
        if (window.ScrollTrigger) {
            ScrollTrigger.refresh();
        }

        updateProgress();
    });

})();

/* =========================================
   ESCAPE ROOM — DESCIFRADO DE INFORMACIÓN
========================================= */

const escapeTrigger = document.getElementById("escapeImageTrigger");
const escapePanel = document.querySelector("#escape-room .escape-info-panel");
const escapeVisual = document.querySelector("#escape-room .escape-game-visual");
const escapeTextOne = document.getElementById("escapeParagraphOne");
const escapeTextTwo = document.getElementById("escapeParagraphTwo");
const escapeStatus = document.getElementById("escapeTerminalStatus");
const escapePrompt = document.getElementById("escapeImagePrompt");
const escapeCursor = document.getElementById("escapeTextCursor");

let escapeIsDecoding = false;

const escapeMessages = [
    "En HEX ROOT, el jugador debe explorar la Sala de Profesores y resolver diferentes pruebas para obtener los fragmentos necesarios para formar la contraseña de salida.",
    "Cada prueba superada proporciona una parte de la información necesaria para avanzar. Encuentra las pistas, reconstruye el código y escapa antes de que el sistema colapse."
];


function escapeTypeText(element, text, speed = 18) {
    return new Promise(resolve => {
        if (!element) {
            resolve();
            return;
        }

        element.textContent = "";

        const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        if (reduceMotion) {
            element.textContent = text;
            resolve();
            return;
        }

        let index = 0;

        function writeNext() {
            element.textContent += text.charAt(index);
            index++;

            if (index < text.length) {
                window.setTimeout(writeNext, speed);
            } else {
                resolve();
            }
        }

        writeNext();
    });
}



function escapeWait(ms) {
    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    return new Promise(resolve => {
        window.setTimeout(
            resolve,
            reduceMotion ? 0 : ms
        );
    });
}


async function startEscapeDecoding() {
    if (escapeIsDecoding) return;

    escapeIsDecoding = true;

    if (escapeTrigger) {
        escapeTrigger.setAttribute("aria-busy", "true");
    }

    escapePanel?.classList.add("is-decoding");
    escapeVisual?.classList.add("is-decoding");

    if (escapeTextOne) escapeTextOne.textContent = "";
    if (escapeTextTwo) escapeTextTwo.textContent = "";

    if (escapeStatus) {
        escapeStatus.textContent = "CONNECTING TO M.A.T.E.O...";
    }

    if (escapePrompt) {
        escapePrompt.textContent = "DECODING DATA...";
    }

    if (escapeCursor) escapeCursor.hidden = false;

    await escapeWait(500);

    if (escapeStatus) {
        escapeStatus.textContent = "RECOVERING ARCHIVE_001...";
    }

    await escapeTypeText(escapeTextOne, escapeMessages[0], 15);

    await escapeWait(300);

    await escapeTypeText(escapeTextTwo, escapeMessages[1], 15);

    if (escapeStatus) {
        escapeStatus.textContent = "ACCESS GRANTED // DATA RECOVERED";
    }

    if (escapePrompt) {
        escapePrompt.textContent = "ARCHIVE DECRYPTED";
    }

    if (escapeCursor) escapeCursor.hidden = true;

    escapePanel?.classList.remove("is-decoding");
    escapeVisual?.classList.remove("is-decoding");

    if (escapeTrigger) {
        escapeTrigger.setAttribute("aria-busy", "false");
        escapeTrigger.setAttribute(
            "aria-label",
            "Archivo descifrado"
        );
    }

    escapeIsDecoding = false;
}

if (escapeTrigger) {
    escapeTrigger.addEventListener("click", startEscapeDecoding);
}
