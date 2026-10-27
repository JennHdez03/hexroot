/* =========================================
   HEX ROOT — JAVASCRIPT PRINCIPAL
========================================= */

document.addEventListener("DOMContentLoaded", () => {
    const systemUser = document.getElementById("systemUser");

    function updateSystemUser(name) {
        if (!systemUser) return;

        systemUser.textContent = name
            ? "USER: " + name.trim().toUpperCase()
            : "USER: GUEST";
    }

    // Mostrar el nombre guardado al cargar la página
    updateSystemUser(sessionStorage.getItem("hexroot_username"));

    const $ = (id) => document.getElementById(id);

    const body = document.body;
    const boot = $("bootScreen");
    const access = $("accessSection");

    const form = $("accessForm");
    const input = $("username");
    const button = $("accessButton");

    const response = $("terminalResponse");
    const responseText = $("responseText");

    let progress = 0;
    let granted = false;

    /* =====================================
       1. RELOJ DIGITAL
    ===================================== */

    function updateClock() {

        const clock = $("hudClock");

        if (!clock) return;

        clock.textContent = new Date().toLocaleTimeString(
            "es-CO",
            {
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );
    }

    updateClock();

    setInterval(updateClock, 1000);


    /* =====================================
       2. SIMULACIÓN DE CÓDIGO BINARIO
    ===================================== */

    const dataTimer = setInterval(() => {

        if (granted) {
            clearInterval(dataTimer);
            return;
        }

        const binary = $("binaryDisplay");
        const decrypt = $("decryptText");
        const cpu = $("cpuStatus");

        if (binary) {

            binary.textContent = Array.from(
                { length: 6 },
                () => Array.from(
                    { length: 8 },
                    () => Math.random() > 0.5 ? "1" : "0"
                ).join("")
            ).join(" ");
        }

        if (decrypt) {

            const symbols = "01#$%<>[]{}";

            decrypt.textContent = Array.from(
                { length: 12 },
                () => symbols[
                    Math.floor(Math.random() * symbols.length)
                ]
            ).join("");
        }

        if (cpu) {
            cpu.textContent =
                `${Math.floor(65 + Math.random() * 30)}% ACTIVE`;
        }

    }, 180);


    /* =====================================
       3. MENSAJES DE LA CONSOLA
    ===================================== */

    const logMessages = [
        "> VERIFYING MEMORY INTEGRITY...",
        "> ANOMALY DETECTED IN SECTOR 07...",
        "> REALITY.EXE IS UNSTABLE...",
        "> USER IDENTIFICATION REQUIRED..."
    ];

    let logIndex = 0;

    const logTimer = setInterval(() => {

        if (granted) {
            clearInterval(logTimer);
            return;
        }

        const consoleElement = $("terminalConsole");

        if (!consoleElement) return;

        if (logIndex >= logMessages.length) {
            clearInterval(logTimer);
            return;
        }

        const paragraph = document.createElement("p");

        paragraph.textContent = logMessages[logIndex++];
        paragraph.classList.add("pink");

        consoleElement.appendChild(paragraph);

        while (consoleElement.children.length > 5) {
            consoleElement.removeChild(
                consoleElement.firstElementChild
            );
        }

    }, 900);


    /* =====================================
       4. BARRA DE CARGA
    ===================================== */

    const progressTimer = setInterval(() => {

        if (granted) {
            clearInterval(progressTimer);
            return;
        }

        progress = Math.min(
            100,
            progress + Math.floor(Math.random() * 4) + 1
        );

        const bar = $("coreProgress");
        const percentage = $("corePercentage");
        const status = $("coreStatus");

        if (bar) {
            bar.style.width = progress + "%";
        }

        if (percentage) {

            percentage.textContent =
                String(progress).padStart(2, "0") + "%";
        }

        if (status) {

            if (progress < 35) {
                status.textContent = "INITIALIZING SYSTEM...";
            } else if (progress < 70) {
                status.textContent = "SCANNING QUANTUM CORE...";
            } else if (progress < 100) {
                status.textContent = "ANOMALY DETECTED...";
            } else {
                status.textContent = "IDENTITY REQUIRED";
            }
        }

        /* Mostrar formulario cuando termine la carga */

        if (progress >= 100) {

            clearInterval(progressTimer);

            const decrypt = $("decryptText");

            if (decrypt) {
                decrypt.textContent = "AWAITING USER...";
            }

            setTimeout(() => {

                if (!granted && access) {

                    access.classList.remove("is-hidden");
                    
const identityError = document.getElementById("identityError");

// Mostrar el aviso al aparecer el formulario
if (identityError) {
    identityError.classList.add("visible");

    // Ocultarlo automáticamente después de 4 segundos
    setTimeout(() => {
        identityError.classList.remove("visible");
    }, 4000);
}


                    if (input) {
                        input.focus({
                            preventScroll: true
                        });
                    }
                }

            }, 300);
        }

    }, 120);


    /* =====================================
       5. EFECTO DE LUZ DEL CURSOR
    ===================================== */

    const glow = $("cursorGlow");

    if (glow) {

        document.addEventListener("mousemove", (event) => {

            glow.style.left = event.clientX + "px";
            glow.style.top = event.clientY + "px";

        });
    }


    /* =====================================
       6. EFECTO GLITCH
    ===================================== */

    function triggerGlitch() {

        body.classList.add("glitching");

        setTimeout(() => {

            body.classList.remove("glitching");

        }, 350);
    }


   
/* =====================================
   7. VALIDAR EL NOMBRE
===================================== */

const identityError = document.getElementById("identityError");

// Ocultar el aviso en cuanto el usuario empiece a escribir
if (input && identityError) {
    input.addEventListener("input", () => {
        if (input.value.trim() !== "") {
            identityError.classList.remove("visible");
        }
    });
}

if (form) {
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        if (granted) return;

        const username = (input?.value || "").trim();

        
if (!username) {
    if (identityError) {
        identityError.textContent =
            "⚠ IDENTITY REQUIRED // ENTER YOUR ALIAS";

        identityError.classList.remove("visible");

        // Reiniciar la animación si se pulsa varias veces
        void identityError.offsetWidth;

        identityError.classList.add("visible");

        // Ocultar el aviso después de 3 segundos
        clearTimeout(window.hexrootErrorTimer);

        window.hexrootErrorTimer = setTimeout(() => {
            identityError.classList.remove("visible");
        }, 3000);
    }

    if (input) {
        input.focus();
    }

    return;
}


        // Ocultar el mensaje al validar una identidad correcta
        identityError?.classList.remove("visible");

       

            /* =====================================
               8. INICIAR AUTORIZACIÓN
            ===================================== */

            granted = true;

            const currentUsername = username.trim();

            sessionStorage.setItem("hexroot_username", currentUsername);

            // Actualizar el nombre del indicador inmediatamente
            const systemUser = document.getElementById("systemUser");

            if (systemUser) {
                systemUser.textContent = "USER: " + currentUsername.toUpperCase();
            }

            clearInterval(progressTimer);
            clearInterval(dataTimer);
            clearInterval(logTimer);

            if (input) {
                input.disabled = true;
            }

            if (button) {
                button.disabled = true;
            }

            /* Ocultar el formulario */

            if (access) {
                access.classList.add("is-hidden");
            }

            /* Mostrar mensaje de autorización */

            if (response) {
                response.classList.add("visible");
            }

            if (responseText) {

                responseText.textContent =
                    "IDENTITY ACCEPTED: " + username.toUpperCase();
            }

            if ($("coreStatus")) {
                $("coreStatus").textContent = "ACCESS AUTHORIZED";
            }

            triggerGlitch();


            /* =====================================
               9. SECUENCIA DE AUTORIZACIÓN
            ===================================== */

            setTimeout(() => {

                if (responseText) {
                    responseText.textContent =
                        "ACCESS GRANTED // WELCOME, " +
                        username.trim().toUpperCase();
                }

            }, 650);


            setTimeout(() => {

                if (responseText) {

                    responseText.textContent =
                        "WARNING: REALITY BREACH DETECTED";
                }

                if (boot) {
                    boot.classList.add("boot-glitch");
                }

                triggerGlitch();

            }, 1500);


            /* =====================================
               10. ABRIR EL MENÚ PRINCIPAL
            ===================================== */

            setTimeout(() => {

                body.classList.add("ready");
                body.classList.remove("booting");

                if (boot) {
                    boot.setAttribute("aria-hidden", "true");
                }

                if (response) {
                    response.classList.remove("visible");
                }

            }, 2400);


            /* Retirar la pantalla de carga */

            setTimeout(() => {

                if (boot) {
                    boot.style.display = "none";
                }

            }, 3300);


            /* =====================================
               11. GLITCH ALEATORIO EN EL MENÚ
            ===================================== */

            function randomGlitch() {

                if (!granted) return;

                setTimeout(() => {

                    triggerGlitch();

                    randomGlitch();

                }, 3500 + Math.random() * 5000);
            }

            setTimeout(randomGlitch, 3000);

        });
    }


    /* =====================================
       12. TECLA ESCAPE
    ===================================== */

    if (input) {

        input.addEventListener("keydown", (event) => {

            if (event.key === "Escape") {
                input.blur();
            }

        });
    }

});

/* ==========================================
   HEX ROOT — CURSOR HUD INTERACTIVO
   ========================================== */

(() => {
    const cursor = document.getElementById("hudCursor");
    const glow = document.getElementById("cursorGlow");
    const trail = document.getElementById("cursorTrail");
    const clickEffect = document.getElementById("cursorClickEffect");

    if (!cursor || window.matchMedia("(hover: none), (pointer: coarse)").matches) {
        return;
    }

    let mouseX = 0;
    let mouseY = 0;
    let trailTimer;

    const interactiveSelector = [
        "a",
        "button",
        "input",
        "textarea",
        "select",
        "label",
        "[role='button']",
        "[tabindex]:not([tabindex='-1'])"
    ].join(",");

    document.addEventListener("mousemove", (event) => {
        mouseX = event.clientX;
        mouseY = event.clientY;

        cursor.classList.add("visible");

        cursor.style.transform =
            `translate(${mouseX - 4}px, ${mouseY - 4}px)`;

        if (glow) {
            glow.style.left = `${mouseX}px`;
            glow.style.top = `${mouseY}px`;
        }

        if (trail) {
            trail.style.left = `${mouseX}px`;
            trail.style.top = `${mouseY}px`;

            trail.classList.remove("active");

            clearTimeout(trailTimer);

            trailTimer = setTimeout(() => {
                trail.classList.add("active");
            }, 35);
        }

        const target = event.target instanceof Element
            ? event.target.closest(
                "a, button, input, textarea, select, label, " +
                "[role='button'], [tabindex]:not([tabindex='-1'])"
            )
            : null;

        cursor.classList.toggle("is-interactive", Boolean(target));
    });

    document.addEventListener("mousedown", () => {
        if (!clickEffect) return;

        clickEffect.style.left = `${mouseX}px`;
        clickEffect.style.top = `${mouseY}px`;

        clickEffect.classList.remove("active");

        void clickEffect.offsetWidth;

        clickEffect.classList.add("active");
    });

    document.addEventListener("mouseleave", () => {
        cursor.classList.remove("visible");
    });

    document.addEventListener("mouseenter", () => {
        cursor.classList.add("visible");
    });
})();