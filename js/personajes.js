
document.addEventListener("DOMContentLoaded", () => {
    const section = document.querySelector("#personajes");
    if (!section) return;

    /* ======================================
       HEXAGONAL VAULT — FONDO INTERACTIVO
    ====================================== */

    const canvas = section.querySelector("#vaultCanvas");
    const ctx = canvas?.getContext("2d");

    if (canvas && ctx) {
        let width = 0;
        let height = 0;
        let dpr = 1;
        let raf = 0;

        const pointer = {
            x: -1000,
            y: -1000,
            active: false
        };

        const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        const spacing = 34;
        const radius = 19;

        function resizeVault() {
            const rect = section.getBoundingClientRect();

            width = rect.width;
            height = rect.height;
            dpr = Math.min(window.devicePixelRatio || 1, 1.5);

            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);

            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            drawVault();
        }

        function hexagon(x, y, r) {
            ctx.beginPath();

            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i + Math.PI / 6;
                const px = x + Math.cos(angle) * r;
                const py = y + Math.sin(angle) * r;

                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }

            ctx.closePath();
        }

        function drawVault() {
            if (!ctx || !width || !height) return;

            ctx.clearRect(0, 0, width, height);

            const verticalStep = spacing * 0.86;
            const columns = Math.ceil(width / spacing) + 2;
            const rows = Math.ceil(height / verticalStep) + 2;

            for (let row = -1; row < rows; row++) {
                for (let col = -1; col < columns; col++) {
                    const x = col * spacing +
                        (row % 2) * (spacing / 2);

                    const y = row * verticalStep;

                    const dx = x - pointer.x;
                    const dy = y - pointer.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    const influence = pointer.active
                        ? Math.max(0, 1 - distance / 210)
                        : 0;

                    const green = [22, 255, 0];
                    const magenta = [234, 0, 229];

                    const useMagenta =
                        influence > 0.22 &&
                        Math.sin(x * 0.025 + y * 0.018) > 0.2;

                    const baseAlpha = 0.12;
                    const glowAlpha = influence * 0.65;

                    const color = useMagenta ? magenta : green;

                    hexagon(x, y, radius);

                    ctx.lineWidth = 0.7 + influence * 0.9;
                    ctx.strokeStyle =
                        `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${baseAlpha + glowAlpha})`;

                    if (influence > 0.05) {
                        ctx.shadowBlur = influence * 13;
                        ctx.shadowColor = useMagenta
                            ? "#ea00e5"
                            : "#16ff00";
                    } else {
                        ctx.shadowBlur = 0;
                    }

                    ctx.stroke();

                    if (influence > 0.02) {
                        const gradient = ctx.createRadialGradient(
                            x, y, 0,
                            x, y, 32
                        );

                        gradient.addColorStop(
                            0,
                            `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${influence * 0.09})`
                        );

                        gradient.addColorStop(
                            1,
                            "rgba(0, 0, 0, 0)"
                        );

                        ctx.fillStyle = gradient;
                        ctx.fill();
                    }
                }
            }

            ctx.shadowBlur = 0;
        }

        function animateVault() {
            drawVault();

            if (!reduceMotion && pointer.active) {
                raf = requestAnimationFrame(animateVault);
            } else {
                raf = 0;
            }
        }

        function requestDraw() {
            if (raf) return;

            if (reduceMotion) {
                drawVault();
            } else {
                raf = requestAnimationFrame(animateVault);
            }
        }

        section.addEventListener("pointermove", (event) => {
            const rect = section.getBoundingClientRect();

            pointer.x = event.clientX - rect.left;
            pointer.y = event.clientY - rect.top;
            pointer.active = true;

            requestDraw();
        });

        section.addEventListener("pointerleave", () => {
            pointer.active = false;
            pointer.x = -1000;
            pointer.y = -1000;

            if (raf) cancelAnimationFrame(raf);
            raf = 0;

            drawVault();
        });

        if ("ResizeObserver" in window) {
            const observer = new ResizeObserver(resizeVault);
            observer.observe(section);
        } else {
            window.addEventListener("resize", resizeVault);
        }

        resizeVault();
    }

    /* ======================================
       HOLO CARD — INCLINACIÓN CON EL CURSOR
    ====================================== */

    const holoButtons = section.querySelectorAll(".holo-name");

    holoButtons.forEach((button) => {
        button.addEventListener("pointermove", (event) => {
            if (event.pointerType === "touch") return;

            const rect = button.getBoundingClientRect();

            const x = (event.clientX - rect.left) / rect.width;
            const y = (event.clientY - rect.top) / rect.height;

            const rotateY = (x - 0.5) * 8;
            const rotateX = (0.5 - y) * 6;

            button.style.transform =
                `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        button.addEventListener("pointerleave", () => {
            button.style.transform = "";
        });
    });

    /* ======================================
       BIOGRAFÍAS — EFECTO DE ESCRITURA
    ====================================== */

    const biographies = {
        nastya: [
            "Nastya proviene de un futuro donde la tecnología controla gran parte de la vida cotidiana.",
            "Es una joven analítica, reservada y observadora que descubre fallas dentro del sistema que gobierna su ciudad. Su investigación la lleva hasta WonderPunk, una red clandestina que representa una forma de resistencia frente al control tecnológico.",
            "Su principal conflicto es luchar contra un sistema del que ella misma forma parte."
        ],
        zuri: [
            "Zuri proviene de un mundo transformado después de La Gran Ruptura, un acontecimiento que destruyó gran parte del desarrollo tecnológico de la humanidad.",
            "En este nuevo mundo, la naturaleza recuperó territorios y criaturas mutadas comenzaron a ocupar espacios que alguna vez pertenecieron a los humanos.",
            "Zuri pertenece a la Orden de los Guardianes y posee un don particular: puede calmar a las criaturas mediante el contacto.",
            "Su misión es mantener el equilibrio entre los seres humanos y la naturaleza."
        ]
    };

    const activeTimers = new WeakMap();

    function typeParagraphs(container, paragraphs, onComplete) {
        const output = container.querySelector(".typed-text");

        if (!output) return;

        const previousTimer = activeTimers.get(output);

        if (previousTimer) {
            clearTimeout(previousTimer);
        }

        output.replaceChildren();

        let paragraphIndex = 0;
        let characterIndex = 0;
        let currentParagraph = null;
        let timer = null;

        function typeNextCharacter() {
            if (paragraphIndex >= paragraphs.length) {
                activeTimers.delete(output);
                if (onComplete) onComplete();
                return;
            }

            if (!currentParagraph) {
                currentParagraph = document.createElement("p");
                currentParagraph.className = "typed-paragraph";
                output.appendChild(currentParagraph);
                characterIndex = 0;
            }

            const text = paragraphs[paragraphIndex];

            currentParagraph.textContent += text.charAt(characterIndex);
            characterIndex++;

            if (characterIndex >= text.length) {
                paragraphIndex++;
                currentParagraph = null;
                timer = setTimeout(typeNextCharacter, 320);
            } else {
                timer = setTimeout(typeNextCharacter, 17);
            }

            activeTimers.set(output, timer);
        }

        typeNextCharacter();
    }

    function closeBiography(button) {
        const bioId = button.getAttribute("aria-controls");
        const bio = document.getElementById(bioId);

        button.setAttribute("aria-expanded", "false");

        if (bio) bio.hidden = true;
    }

    holoButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const character = button.dataset.character;
            const bioId = button.getAttribute("aria-controls");
            const bio = document.getElementById(bioId);

            if (!bio || !biographies[character]) return;

            const wasOpen = button.getAttribute("aria-expanded") === "true";

            holoButtons.forEach(closeBiography);

            if (wasOpen) return;

            button.setAttribute("aria-expanded", "true");
            bio.hidden = false;

            const status = bio.querySelector(".bio-status");

            if (status) {
                status.firstChild.textContent = "ACCESSING FILE... ";
            }

            typeParagraphs(bio, biographies[character], () => {
                if (status) {
                    status.firstChild.textContent = "FILE DECRYPTED // ";
                }
            });
        });
    });
});


/* =========================================
   GRAVITY LETTERS — HEX ROOT
   Partículas tipográficas, gravedad y reconstrucción
========================================= */

(() => {
    const canvas = document.getElementById("gravityCanvas");
    const title = document.getElementById("gravityTitle");

    if (!canvas || !title) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    const CONFIG = {
        text: ["DOS UNIVERSOS", "DOS ANOMALÍAS"],
        colors: ["#ff00ba", "#00ef64"],
        charset: "01000001 01011001 01010101 01000100 01000001 00101100 00100000 01010000 01001111 01010010 00100000 01000110 01000001 01010110 01001111 01010010",
        grainSize: 3,
        gravity: 1,
        throwForce: 1,
        healDelay: 1800,
        rebuildDuration: 700,
        fontWeight: 800
    };

    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles = [];
    let animationFrame = 0;
    let lastTime = 0;
    let state = "idle";
    let collapseStarted = 0;
    let rebuildStarted = 0;
    let pointerDown = null;

    const offscreen = document.createElement("canvas");
    const offCtx = offscreen.getContext("2d", {
        willReadFrequently: true
    });

    if (!offCtx) return;

    function resize() {
        const rect = canvas.getBoundingClientRect();

        width = rect.width;
        height = rect.height;
        dpr = Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = Math.max(1, Math.round(width * dpr));
        canvas.height = Math.max(1, Math.round(height * dpr));

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        createParticles();
        drawIdle();
    }

    function createParticles() {
        offscreen.width = Math.max(1, Math.round(width));
        offscreen.height = Math.max(1, Math.round(height));

        offCtx.clearRect(0, 0, width, height);
        offCtx.fillStyle = "#ffffff";
        offCtx.textAlign = "center";
        offCtx.textBaseline = "middle";
        offCtx.font =
    `${CONFIG.fontWeight} ${Math.min(width * 0.105, 100)}px "Space Mono", monospace`;

        const fontSize = Math.min(width * 0.105, 100);
        const lineHeight = fontSize * 1.15;
        const startY = height / 2 - lineHeight / 2;

        CONFIG.text.forEach((line, index) => {
            offCtx.fillText(
                line,
                width / 2,
                startY + index * lineHeight,
                width * 0.96
            );
        });

        const image = offCtx.getImageData(
            0, 0, offscreen.width, offscreen.height
        );

        const data = image.data;
        const gap = CONFIG.grainSize;
        const nextParticles = [];

        for (let y = 0; y < height; y += gap) {
            for (let x = 0; x < width; x += gap) {
                const index = (y * offscreen.width + x) * 4;

                if (data[index + 3] > 100) {
                    const glyphIndex = Math.floor(
                        Math.random() * CONFIG.charset.length
                    );

                    nextParticles.push({
                        x,
                        y,
                        homeX: x,
                        homeY: y,
                        vx: 0,
                        vy: 0,
                        char: CONFIG.charset[glyphIndex],
                        color: x < width / 2
                            ? CONFIG.colors[0]
                            : CONFIG.colors[1],
                        alpha: 0.75 + Math.random() * 0.25,
                        size: 5 + Math.random() * 2,
                        active: true
                    });
                }
            }
        }

        particles = nextParticles;
    }

    function drawIdle() {
        ctx.clearRect(0, 0, width, height);

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        particles.forEach((p) => {
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.font = `800 ${p.size}px monospace`;
            ctx.fillText(p.char, p.x, p.y);
        });

        ctx.globalAlpha = 1;
    }

    function collapse(event) {
        if (state === "falling") return;

        const rect = canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;

        state = "falling";
        collapseStarted = performance.now();

        particles.forEach((p) => {
            const dx = p.x - clickX;
            const dy = p.y - clickY;
            const distance = Math.sqrt(dx * dx + dy * dy) || 1;

            const direction = 0.35 + Math.random() * 0.8;

            p.vx = (dx / distance) *
                (1 + Math.random() * 3) *
                CONFIG.throwForce +
                (Math.random() - 0.5) * 2;

            p.vy = (dy / distance) *
                direction *
                CONFIG.throwForce;

            p.vy -= 1.5 + Math.random() * 2;
        });

        if (!reduceMotion) {
            lastTime = performance.now();
            cancelAnimationFrame(animationFrame);
            animationFrame = requestAnimationFrame(animate);
        } else {
            rebuildStarted = performance.now();
            state = "rebuilding";
            drawIdle();
        }
    }

    function animate(now) {
        const dt = Math.min((now - lastTime) / 16.67, 2);
        lastTime = now;

        ctx.clearRect(0, 0, width, height);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        if (state === "falling") {
            particles.forEach((p) => {
                p.vy += 0.18 * CONFIG.gravity * dt;
                p.vx *= 0.995;
                p.x += p.vx * dt;
                p.y += p.vy * dt;

                p.alpha = Math.max(0.12, p.alpha - 0.0015 * dt);

                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = p.color;
                ctx.font = `800 ${p.size}px monospace`;
                ctx.fillText(p.char, p.x, p.y);
            });

            ctx.globalAlpha = 1;

            if (now - collapseStarted > CONFIG.healDelay) {
                state = "rebuilding";
                rebuildStarted = now;
            }
        }

        if (state === "rebuilding") {
            const progress = Math.min(
                (now - rebuildStarted) / CONFIG.rebuildDuration,
                1
            );

            /* Barrido de reconstrucción de izquierda a derecha */
            const sweepX = width * progress;

            particles.forEach((p) => {
                const delay = p.homeX / width;
                const localProgress = Math.max(
                    0,
                    Math.min(1, (progress - delay * 0.45) / 0.55)
                );

                const eased = 1 - Math.pow(1 - localProgress, 3);

                p.x += (p.homeX - p.x) * eased * 0.25;
                p.y += (p.homeY - p.y) * eased * 0.25;
                p.alpha = Math.min(1, p.alpha + 0.025);

                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = p.homeX < sweepX
                    ? CONFIG.colors[1]
                    : p.color;

                ctx.font = `800 ${p.size}px monospace`;
                ctx.fillText(p.char, p.x, p.y);
            });

            ctx.globalAlpha = 1;

            if (progress >= 1) {
                particles.forEach((p) => {
                    p.x = p.homeX;
                    p.y = p.homeY;
                    p.vx = 0;
                    p.vy = 0;
                    p.alpha = 0.95;
                });

                state = "idle";
                drawIdle();
                return;
            }
        }

        animationFrame = requestAnimationFrame(animate);
    }

    canvas.addEventListener("click", (event) => {
        collapse(event);
    });

    canvas.addEventListener("pointerdown", (event) => {
        pointerDown = {
            x: event.clientX,
            y: event.clientY
        };
    });

    canvas.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();

            collapse({
                clientX: canvas.getBoundingClientRect().left + width / 2,
                clientY: canvas.getBoundingClientRect().top + height / 2
            });
        }
    });

    canvas.tabIndex = 0;
    canvas.setAttribute("role", "button");
    canvas.setAttribute(
        "aria-label",
        "Título interactivo. Haz clic para fragmentar y reconstruir las letras."
    );

    if ("ResizeObserver" in window) {
        new ResizeObserver(resize).observe(canvas);
    } else {
        window.addEventListener("resize", resize);
    }

    if (document.fonts?.ready) {
        document.fonts.ready.then(resize);
    } else {
        resize();
    }

    title.classList.add("is-ready");
})();

