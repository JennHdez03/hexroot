
(() => {
    "use strict";

    const nav = document.getElementById("hexNav");
    const toggle = document.getElementById("hexNavToggle");
    const items = document.getElementById("hexNavItems");

    if (!nav || !toggle || !items) return;
    if (nav.dataset.initialized === "true") return;

    nav.dataset.initialized = "true";

    // Tablet y móvil utilizan el mismo comportamiento táctil.
    const touchLayout = window.matchMedia("(max-width: 1024px)");

    function isTouchLayout() {
        return touchLayout.matches;
    }

    function openMenu() {
        nav.classList.add("is-open");
        toggle.setAttribute("aria-expanded", "true");
        toggle.setAttribute("aria-label", "Cerrar menú de navegación");
    }

    function closeMenu() {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Abrir menú de navegación");
    }

    function toggleMenu() {
        if (nav.classList.contains("is-open")) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    // Botón central: abre/cierra en tablet y móvil.
    // En escritorio, conserva el acceso a Inicio.
    
toggle.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    toggleMenu();
});


    // Escritorio: abrir con el ratón.
    nav.addEventListener("pointerenter", (event) => {
        if (!isTouchLayout() && event.pointerType === "mouse") {
            openMenu();
        }
    });

    nav.addEventListener("pointerleave", (event) => {
        if (!isTouchLayout() && event.pointerType === "mouse") {
            closeMenu();
        }
    });

    // Evita que los clics internos se propaguen al documento.
    items.addEventListener("click", (event) => {
        event.stopPropagation();
    });

    // Tablet y móvil: tocar fuera cierra el menú.
    document.addEventListener("click", (event) => {
        if (isTouchLayout() && !nav.contains(event.target)) {
            closeMenu();
        }
    });

    // Escape cierra el menú.
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && nav.classList.contains("is-open")) {
            closeMenu();
            toggle.focus();
        }
    });

    // Cerrar después de seleccionar una opción.
    items.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeMenu);
    });

    // Al cambiar el tamaño, restablecer el estado.
    touchLayout.addEventListener("change", closeMenu);

    closeMenu();
})();
