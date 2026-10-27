
/* ==========================================
   HEX ROOT — COMPATIBILIDAD DE EFECTOS
   Escritorio · Tablet · Celular
   ========================================== */

(() => {
    "use strict";

    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    // Detectar capacidades del dispositivo
    const device = {
        touch: navigator.maxTouchPoints > 0 ||
            "ontouchstart" in window,

        reducedMotion: reduceMotion.matches,

        smallScreen: window.matchMedia(
            "(max-width: 768px)"
        ).matches
    };

    document.documentElement.classList.toggle(
        "has-touch",
        device.touch
    );

    document.documentElement.classList.toggle(
        "reduced-motion",
        device.reducedMotion
    );

    // Unificar mouse, lápiz y tacto
    document.addEventListener("pointerdown", event => {
        document.documentElement.dataset.pointer =
            event.pointerType || "mouse";
    }, { passive: true });

    // Canvas nítidos y adaptados al tamaño real
    function resizeCanvas(canvas) {
        const rect = canvas.getBoundingClientRect();

        if (!rect.width || !rect.height) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        const dpr = Math.min(
            window.devicePixelRatio || 1,
            device.smallScreen ? 1.5 : 2
        );

        const width = Math.round(rect.width * dpr);
        const height = Math.round(rect.height * dpr);

        if (
            canvas.width !== width ||
            canvas.height !== height
        ) {
            canvas.width = width;
            canvas.height = height;

            // Dibujar usando coordenadas CSS
            context.setTransform(dpr, 0, 0, dpr, 0, 0);

            // Avisar al código de cada efecto
            canvas.dispatchEvent(
                new CustomEvent("hexroot:canvasresize", {
                    detail: {
                        width: rect.width,
                        height: rect.height,
                        dpr
                    }
                })
            );
        }
    }

    const canvases = [...document.querySelectorAll("canvas")];

    canvases.forEach(canvas => {
        if ("ResizeObserver" in window) {
            const observer = new ResizeObserver(() => {
                resizeCanvas(canvas);
            });

            observer.observe(canvas);

            // Conservar referencia para el ciclo de vida
            canvas._hexResizeObserver = observer;
        } else {
            window.addEventListener("resize", () => {
                resizeCanvas(canvas);
            }, { passive: true });
        }

        resizeCanvas(canvas);
    });

    // Avisar cuando cambia la orientación
    window.addEventListener("orientationchange", () => {
        window.setTimeout(() => {
            canvases.forEach(resizeCanvas);
            window.dispatchEvent(new Event("resize"));
        }, 250);
    }, { passive: true });

    // Notificar a los efectos cuando la pestaña se oculta
    document.addEventListener("visibilitychange", () => {
        document.dispatchEvent(
            new CustomEvent(
                document.hidden
                    ? "hexroot:pause"
                    : "hexroot:resume"
            )
        );
    });

    // Recalcular canvas cuando se activa una sección oculta
    const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            entry.target
                .querySelectorAll("canvas")
                .forEach(resizeCanvas);
        });
    });

    document.querySelectorAll("section").forEach(section => {
        sectionObserver.observe(section);
    });

    // Compatibilidad con preferencias de movimiento
    reduceMotion.addEventListener?.("change", event => {
        document.documentElement.classList.toggle(
            "reduced-motion",
            event.matches
        );

        document.dispatchEvent(
            new CustomEvent("hexroot:motionchange", {
                detail: { reducedMotion: event.matches }
            })
        );
    });

    console.info(
        "[HEX ROOT] Compatibilidad de efectos inicializada.",
        device
    );
})();
