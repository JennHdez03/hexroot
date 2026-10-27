
/* ==========================================
   HEX ROOT — MAGNET LINES
   Vanilla JavaScript / Canvas 2D
========================================== */

(() => {
    const section = document.getElementById("contacto");
    const canvas = document.getElementById("magnetLinesCanvas");

    if (!section || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const CONFIG = {
        spacing: 30,
        lineLength: 19,
        lineWidth: 1.35,

        baseAngle: -10 * Math.PI / 180,

        radius: 340,
        influence: 0.95,
        easing: 0.35,

        green: "#32ff00",
        pink: "#ff00ba",

        opacity: 0.10,
        glow: 16,

        rippleDuration: 1000,
        maxDpr: 1.5
    };

    let width = 0;
    let height = 0;
    let dpr = 1;

    let lines = [];
    let ripples = [];
    let animationId = 0;
    let lastTime = 0;
    let elapsed = 0;
    let destroyed = false;

    const pointer = {
        x: -10000,
        y: -10000,
        active: false
    };

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    const random = (min, max) =>
        Math.random() * (max - min) + min;

    function createLines() {
        lines = [];

        const columns = Math.ceil(width / CONFIG.spacing) + 2;
        const rows = Math.ceil(height / CONFIG.spacing) + 2;

        for (let row = -1; row < rows; row++) {
            for (let col = -1; col < columns; col++) {
                const x = col * CONFIG.spacing + CONFIG.spacing / 2;
                const y = row * CONFIG.spacing + CONFIG.spacing / 2;

                lines.push({
                    x,
                    y,
                    angle: CONFIG.baseAngle,
                    targetAngle: CONFIG.baseAngle,
                    length: random(
                        CONFIG.lineLength * 0.7,
                        CONFIG.lineLength * 1.25
                    ),
                    phase: random(0, Math.PI * 2),
                    tint: Math.random(),
                    alpha: random(0.45, 1)
                });
            }
        }
    }

    function resize() {
        const rect = section.getBoundingClientRect();

        width = Math.max(1, section.clientWidth);
        height = Math.max(1, section.scrollHeight);

        dpr = Math.min(window.devicePixelRatio || 1, CONFIG.maxDpr);

        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);

        canvas.style.width = "100%";
        canvas.style.height = "100%";

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        createLines();
        drawStaticFrame();
    }

    function getSectionPoint(event) {
        const rect = section.getBoundingClientRect();

        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top + section.scrollTop
        };
    }

    function onPointerMove(event) {
        const point = getSectionPoint(event);

        pointer.x = point.x;
        pointer.y = point.y;
        pointer.active = true;
    }

    function onPointerLeave() {
        pointer.active = false;
    }

    function onClick(event) {
        const point = getSectionPoint(event);

        ripples.push({
            x: point.x,
            y: point.y,
            start: performance.now(),
            duration: CONFIG.rippleDuration
        });

        if (ripples.length > 5) {
            ripples.shift();
        }
    }

    function calculateAngle(line, time) {
        const dx = pointer.x - line.x;
        const dy = pointer.y - line.y;
        const distance = Math.hypot(dx, dy);

        let target = CONFIG.baseAngle;

        if (pointer.active && distance < CONFIG.radius) {
            const falloff = 1 - distance / CONFIG.radius;
            const strength = Math.pow(falloff, 1.3) * CONFIG.influence;

            // Orientación tangencial al cursor.
            const orbitAngle = Math.atan2(dy, dx) + Math.PI / 2;

            // Interpolación angular para evitar giros bruscos.
            let difference = orbitAngle - CONFIG.baseAngle;

            difference = Math.atan2(
                Math.sin(difference),
                Math.cos(difference)
            );

            target = CONFIG.baseAngle + difference * strength;
        }

        // Ondulación ambiental sutil.
        target += Math.sin(time * 0.00045 + line.phase) * 0.035;

        // Influencia de las ondas al hacer clic.
        for (const ripple of ripples) {
            const age = time - ripple.start;
            const progress = age / ripple.duration;

            if (progress < 0 || progress > 1) continue;

            const distanceToRipple = Math.hypot(
                line.x - ripple.x,
                line.y - ripple.y
            );

            const radius = progress * CONFIG.radius * 3.5;
            const band = Math.max(
                0,
                1 - Math.abs(distanceToRipple - radius) / 65
            );

            target += Math.sin(line.phase + progress * Math.PI * 5)
                * strength * 0.8;
        }

        return target;
    }

    function drawLine(line, time) {
        const dx = pointer.x - line.x;
        const dy = pointer.y - line.y;
        const distance = Math.hypot(dx, dy);

        let localGlow = 0;
        let localAlpha = line.alpha * CONFIG.opacity;

        if (pointer.active && distance < CONFIG.radius) {
            localGlow = 1 - distance / CONFIG.radius;
            localAlpha = Math.min(
                1,
                localAlpha + localGlow * 0.35
            );
        }

        let rippleGlow = 0;

        for (const ripple of ripples) {
            const progress = (time - ripple.start) / ripple.duration;

            if (progress < 0 || progress > 1) continue;

            const distanceToRipple = Math.hypot(
                line.x - ripple.x,
                line.y - ripple.y
            );

            const radius = progress * CONFIG.radius * 2.8;
            const band = Math.max(
                0,
                1 - Math.abs(distanceToRipple - radius) / 32
            );

            rippleGlow = Math.max(
                rippleGlow,
                band * (1 - progress)
            );
        }

        line.targetAngle = calculateAngle(line, time);

        let angleDifference = line.targetAngle - line.angle;

        angleDifference = Math.atan2(
            Math.sin(angleDifference),
            Math.cos(angleDifference)
        );

        const response = pointer.active ? 0.28 : CONFIG.easing;
        line.angle += angleDifference * response;

        const halfLength = line.length / 2;
        const cos = Math.cos(line.angle);
        const sin = Math.sin(line.angle);

        const x1 = line.x - cos * halfLength;
        const y1 = line.y - sin * halfLength;
        const x2 = line.x + cos * halfLength;
        const y2 = line.y + sin * halfLength;

        let color = line.tint > 0.91
            ? CONFIG.pink
            : CONFIG.green;

        if (rippleGlow > 0.4) {
            color = line.tint > 0.5
                ? CONFIG.pink
                : CONFIG.green;
        }

        ctx.save();

        ctx.globalAlpha = Math.min(
            1,
            localAlpha + rippleGlow * 0.55
        );

        ctx.strokeStyle = color;
        ctx.lineWidth = CONFIG.lineWidth + localGlow * 0.45;
        ctx.lineCap = "round";

        ctx.shadowColor = color;
        ctx.shadowBlur = CONFIG.glow * (
            0.15 + localGlow * 0.8 + rippleGlow
        );

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Centro luminoso blanco muy sutil en las líneas activadas.
        if (localGlow > 0.72 || rippleGlow > 0.72) {
            ctx.globalAlpha = Math.max(localGlow, rippleGlow) * 0.65;
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 0.45;
            ctx.shadowBlur = 3;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }

        ctx.restore();
    }

    function render(time) {
        if (destroyed) return;

        animationId = requestAnimationFrame(render);

        const delta = lastTime
            ? Math.min(time - lastTime, 40)
            : 16;

        lastTime = time;
        elapsed += delta;

        if (document.hidden) return;

        ctx.clearRect(0, 0, width, height);

        // Elimina ondas terminadas.
        ripples = ripples.filter(
            ripple => time - ripple.start < ripple.duration
        );

        for (const line of lines) {
            drawLine(line, time);
        }

        // En movimiento reducido, deja una imagen estática.
        if (reducedMotion.matches) {
            cancelAnimationFrame(animationId);
            animationId = 0;
        }
    }

    function drawStaticFrame() {
        if (!ctx || !width || !height) return;

        ctx.clearRect(0, 0, width, height);

        for (const line of lines) {
            line.angle = CONFIG.baseAngle;
            line.targetAngle = CONFIG.baseAngle;
            drawLine(line, 0);
        }
    }

    function startAnimation() {
        if (destroyed || animationId || reducedMotion.matches) return;

        lastTime = 0;
        animationId = requestAnimationFrame(render);
    }

    function onMotionPreferenceChange() {
        if (reducedMotion.matches) {
            cancelAnimationFrame(animationId);
            animationId = 0;
            ripples = [];
            drawStaticFrame();
        } else {
            startAnimation();
        }
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(section);

    section.addEventListener("pointermove", onPointerMove, {
        passive: true
    });

    section.addEventListener("pointerleave", onPointerLeave);
    section.addEventListener("click", onClick);

    window.addEventListener("resize", resize, { passive: true });

    document.addEventListener("visibilitychange", () => {
        if (!document.hidden && !reducedMotion.matches) {
            startAnimation();
        }
    });

    if (reducedMotion.addEventListener) {
        reducedMotion.addEventListener(
            "change",
            onMotionPreferenceChange
        );
    }

    window.addEventListener("pagehide", () => {
        destroyed = true;

        cancelAnimationFrame(animationId);
        resizeObserver.disconnect();

        section.removeEventListener("pointermove", onPointerMove);
        section.removeEventListener("pointerleave", onPointerLeave);
        section.removeEventListener("click", onClick);
        window.removeEventListener("resize", resize);
    }, { once: true });

    resize();

    if (reducedMotion.matches) {
        drawStaticFrame();
    } else {
        startAnimation();
    }
})();
