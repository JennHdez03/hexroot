
(() => {
    "use strict";

    // =========================================
    // HEX ROOT — WAVES WEBGL2
    // Vanilla JavaScript. No React required.
    // =========================================

    const canvas = document.getElementById("wavesCanvas");
    const container = document.getElementById("wavesBackground");
    const archive = document.getElementById("magazineArchive");

    if (!canvas || !container || !archive) return;

    const gl = canvas.getContext("webgl2", {
        alpha: false,
        antialias: true,
        depth: false,
        stencil: false,
        powerPreference: "high-performance"
    });

    if (!gl) {
        console.warn("HEX ROOT Waves: este navegador no tiene WebGL2 disponible.");
        container.style.background =
            "radial-gradient(ellipse at center, #10200d 0%, #0A0A0A 70%)";
        return;
    }

    const CONFIG = {
        background: [10 / 255, 10 / 255, 10 / 255],
        lineColor: [22 / 255, 1, 0],
        accentColor: [234 / 255, 0, 229 / 255],

        spacing: 19,
        amplitude: 32,
        twist: 1,
        speed: 0.65,
        rotation: -8,
        scale: 1,
        lineWidth: 0.8,
        opacity: 0.72,

        mouseRadius: 175,
        mouseStrength: 1,
        clickRipple: true,
        intro: true
    };

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    const coarsePointer = window.matchMedia(
        "(pointer: coarse)"
    ).matches;

    const VERTEX_SHADER = `#version 300 es
    precision highp float;

    void main() {
        vec2 positions[3] = vec2[3](
            vec2(-1.0, -1.0),
            vec2( 3.0, -1.0),
            vec2(-1.0,  3.0)
        );

        gl_Position = vec4(positions[gl_VertexID], 0.0, 1.0);
    }`;

    const FRAGMENT_SHADER = `#version 300 es
    precision highp float;

    uniform vec2 uResolution;
    uniform float uTime;
    uniform float uIntro;
    uniform vec2 uPointer;
    uniform float uPointerActive;
    uniform float uSpacing;
    uniform float uAmplitude;
    uniform float uTwist;
    uniform float uRotation;
    uniform float uScale;
    uniform float uLineWidth;
    uniform float uOpacity;
    uniform float uMouseRadius;
    uniform float uMouseStrength;
    uniform int uRippleCount;
    uniform vec3 uRipples[6];

    out vec4 outColor;

    const vec3 GREEN = vec3(0.0862745, 1.0, 0.0);
    const vec3 MAGENTA = vec3(0.917647, 0.0, 0.898039);

    float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);

        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));

        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    void main() {
        vec2 pixel = gl_FragCoord.xy;
        vec2 center = uResolution * 0.5;

        vec2 p = (pixel - center) / max(uScale, 0.05);

        float angle = uRotation;
        float cs = cos(angle);
        float sn = sin(angle);

        vec2 rotated = vec2(
            p.x * cs - p.y * sn,
            p.x * sn + p.y * cs
        );

        float t = uTime;

        // Movimiento orgánico inspirado en ruido Perlin.
        float n1 = noise(rotated * vec2(0.0025, 0.0035)
                         + vec2(t * 0.10, t * 0.035));

        float n2 = noise(rotated * vec2(0.005, 0.002)
                         - vec2(t * 0.04, t * 0.07));

        float flow =
            sin(rotated.x * 0.009 + t * 0.8) * 0.35
            + sin(rotated.x * 0.004 - t * 0.5) * 0.35
            + (n1 - 0.5) * 0.9
            + (n2 - 0.5) * 0.6;

        float displacement = flow * uAmplitude * uTwist;

        // Deformación radial suave alrededor del cursor.
        vec2 pointerDelta = pixel - uPointer;
        float pointerDistance = length(pointerDelta);

        float mouseInfluence =
            (1.0 - smoothstep(0.0, uMouseRadius, pointerDistance))
            * uPointerActive;

        float mouseWave =
            sin(pointerDistance * 0.035 - t * 2.2);

        displacement +=
            mouseInfluence * mouseWave * 24.0 * uMouseStrength;

        // Ondas expansivas generadas al hacer clic.
        float rippleEnergy = 0.0;

        for (int i = 0; i < 6; i++) {
            if (i >= uRippleCount) break;

            vec2 rippleCenter = uRipples[i].xy;
            float age = t - uRipples[i].z;

            float distanceToRipple = length(pixel - rippleCenter);
            float radius = age * 220.0;
            float distanceFromFront = distanceToRipple - radius;

            float ring = exp(
                -pow(distanceFromFront / 22.0, 2.0)
            );

            float life = 1.0 - smoothstep(0.0, 2.5, age);

            displacement +=
                sin(distanceFromFront * 0.07)
                * ring * life * 18.0;

            rippleEnergy = max(rippleEnergy, ring * life);
        }

        float linePosition = rotated.y + displacement;
        float distanceToLine =
            abs(mod(linePosition + uSpacing * 0.5, uSpacing)
                - uSpacing * 0.5);

        float thickness = max(uLineWidth * 0.5, 0.35);

        float line = 1.0 - smoothstep(
            thickness,
            thickness + 0.9,
            distanceToLine
        );

        // Variación de intensidad entre líneas.
        float lineId = floor(linePosition / uSpacing);
        float variation = 0.65 + 0.35 * hash(vec2(lineId, 3.17));

        // Entrada progresiva desde el centro.
        float revealWidth = mix(0.0, uResolution.x * 0.85, uIntro);
        float reveal = 1.0 - smoothstep(
            revealWidth,
            revealWidth + 90.0,
            abs(pixel.x - center.x)
        );

        // El magenta se integra en las propias ondas.
        float interactionEnergy = max(mouseInfluence, rippleEnergy);
        float accent = clamp(interactionEnergy * 0.9, 0.0, 1.0);

        vec3 color = mix(GREEN, MAGENTA, accent);

        float glow = exp(-distanceToLine * 0.13) * 0.12;

        float alpha = (line * variation + glow)
                    * reveal
                    * uOpacity;

        // Oscurece suavemente los bordes.
        vec2 uv = pixel / uResolution;
        float edgeX = smoothstep(0.0, 0.12, uv.x)
                    * (1.0 - smoothstep(0.88, 1.0, uv.x));

        float edgeY = smoothstep(0.0, 0.10, uv.y)
                    * (1.0 - smoothstep(0.90, 1.0, uv.y));

        alpha *= 0.55 + 0.45 * edgeX * edgeY;

        vec3 background = vec3(10.0, 10.0, 10.0) / 255.0;
        vec3 result = mix(background, color, clamp(alpha, 0.0, 1.0));

        outColor = vec4(result, 1.0);
    }`;

    function createShader(type, source) {
        const shader = gl.createShader(type);
        if (!shader) return null;

        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(
                "HEX ROOT Waves shader:",
                gl.getShaderInfoLog(shader)
            );
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    function createProgram() {
        const vertex = createShader(gl.VERTEX_SHADER, VERTEX_SHADER);
        const fragment = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);

        if (!vertex || !fragment) return null;

        const program = gl.createProgram();
        if (!program) return null;

        gl.attachShader(program, vertex);
        gl.attachShader(program, fragment);
        gl.linkProgram(program);

        gl.deleteShader(vertex);
        gl.deleteShader(fragment);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error(
                "HEX ROOT Waves program:",
                gl.getProgramInfoLog(program)
            );
            gl.deleteProgram(program);
            return null;
        }

        return program;
    }

    const program = createProgram();

    if (!program) {
        container.style.background =
            "radial-gradient(ellipse at center, #10200d, #0A0A0A 70%)";
        return;
    }

    gl.useProgram(program);

    const uniform = name => gl.getUniformLocation(program, name);

    const U = {
        resolution: uniform("uResolution"),
        time: uniform("uTime"),
        intro: uniform("uIntro"),
        pointer: uniform("uPointer"),
        pointerActive: uniform("uPointerActive"),
        spacing: uniform("uSpacing"),
        amplitude: uniform("uAmplitude"),
        twist: uniform("uTwist"),
        rotation: uniform("uRotation"),
        scale: uniform("uScale"),
        lineWidth: uniform("uLineWidth"),
        opacity: uniform("uOpacity"),
        mouseRadius: uniform("uMouseRadius"),
        mouseStrength: uniform("uMouseStrength"),
        rippleCount: uniform("uRippleCount"),
        ripples: uniform("uRipples[0]")
    };

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    let width = 1;
    let height = 1;
    let dpr = 1;
    let raf = 0;
    let startTime = 0;
    let previousTime = 0;
    let introProgress = reducedMotion ? 1 : 0;
    let visible = true;

    const pointer = {
        x: -1000,
        y: -1000,
        active: false
    };

    const ripples = [];
    const rippleUniforms = new Float32Array(18);

    function resize() {
        const rect = container.getBoundingClientRect();

        width = Math.max(1, rect.width);
        height = Math.max(1, rect.height);
        dpr = Math.min(window.devicePixelRatio || 1, 1.5);

        canvas.width = Math.max(1, Math.round(width * dpr));
        canvas.height = Math.max(1, Math.round(height * dpr));

        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(U.resolution, canvas.width, canvas.height);

        draw();
        wake();
    }

    function updatePointer(event) {
        const rect = container.getBoundingClientRect();

        pointer.x = (event.clientX - rect.left) * dpr;
        pointer.y = (height - (event.clientY - rect.top)) * dpr;

        pointer.active =
            event.clientX >= rect.left &&
            event.clientX <= rect.right &&
            event.clientY >= rect.top &&
            event.clientY <= rect.bottom;

        wake();
    }

    function addRipple(event) {
        if (!CONFIG.clickRipple || reducedMotion) return;

        const rect = container.getBoundingClientRect();

        const x = (event.clientX - rect.left) * dpr;
        const y = (height - (event.clientY - rect.top)) * dpr;

        if (x < 0 || y < 0 || x > width * dpr || y > height * dpr) {
            return;
        }

        ripples.push({
            x,
            y,
            time: (performance.now() - startTime) / 1000
        });

        while (ripples.length > 6) ripples.shift();

        wake();
    }

    function draw() {
        if (gl.isContextLost()) return;

        gl.useProgram(program);
        gl.bindVertexArray(vao);

        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(
            CONFIG.background[0],
            CONFIG.background[1],
            CONFIG.background[2],
            1
        );
        gl.clear(gl.COLOR_BUFFER_BIT);

        const now = (performance.now() - startTime) / 1000;

        gl.uniform1f(U.time, reducedMotion ? 0 : now * CONFIG.speed);
        gl.uniform1f(U.intro, CONFIG.intro ? introProgress : 1);

        gl.uniform2f(
            U.pointer,
            pointer.x,
            pointer.y
        );

        gl.uniform1f(
            U.pointerActive,
            pointer.active && !coarsePointer ? 1 : 0
        );

        gl.uniform1f(U.spacing, CONFIG.spacing * dpr);
        gl.uniform1f(U.amplitude, CONFIG.amplitude * dpr);
        gl.uniform1f(U.twist, CONFIG.twist);
        gl.uniform1f(U.rotation, CONFIG.rotation * Math.PI / 180);
        gl.uniform1f(U.scale, CONFIG.scale);
        gl.uniform1f(U.lineWidth, CONFIG.lineWidth * dpr);
        gl.uniform1f(U.opacity, CONFIG.opacity);
        gl.uniform1f(U.mouseRadius, CONFIG.mouseRadius * dpr);
        gl.uniform1f(U.mouseStrength, CONFIG.mouseStrength);

        const currentTime = (performance.now() - startTime) / 1000;
        let activeRippleCount = 0;

        for (let i = ripples.length - 1; i >= 0; i--) {
            if (currentTime - ripples[i].time > 2.5) {
                ripples.splice(i, 1);
            }
        }

        rippleUniforms.fill(0);

        for (let i = 0; i < ripples.length; i++) {
            const ripple = ripples[i];

            rippleUniforms[i * 3] = ripple.x;
            rippleUniforms[i * 3 + 1] = ripple.y;
            rippleUniforms[i * 3 + 2] = ripple.time;

            activeRippleCount++;
        }

        gl.uniform1i(U.rippleCount, activeRippleCount);
        gl.uniform3fv(U.ripples, rippleUniforms);

        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function frame(timestamp) {
        raf = 0;

        if (!visible || document.hidden || gl.isContextLost()) return;

        const delta = previousTime
            ? Math.min((timestamp - previousTime) / 1000, 0.05)
            : 1 / 60;

        previousTime = timestamp;

        if (!reducedMotion && introProgress < 1) {
            introProgress = Math.min(1, introProgress + delta / 2.2);
        }

        draw();

        if (
            !reducedMotion &&
            !document.hidden
        ) {
            raf = requestAnimationFrame(frame);
        } else if (ripples.length > 0) {
            raf = requestAnimationFrame(frame);
        }
    }

    function wake() {
        if (raf || !visible || document.hidden) return;

        if (reducedMotion && ripples.length === 0) {
            draw();
            return;
        }

        raf = requestAnimationFrame(frame);
    }

    function stop() {
        if (raf) {
            cancelAnimationFrame(raf);
            raf = 0;
        }
        previousTime = 0;
    }


    /* El cursor funciona aunque pase sobre el texto
       o sobre cualquier otra sección de la página. */

    window.addEventListener("pointermove", updatePointer, {
        passive: true
    });

    window.addEventListener("pointerdown", addRipple, {
        passive: true
    });

    window.addEventListener("blur", () => {
        pointer.active = false;
        wake();
    });


    document.addEventListener("visibilitychange", () => {
        visible = !document.hidden;

        if (visible) {
            previousTime = 0;
            wake();
        } else {
            stop();
        }
    });

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    // =========================================
    // PORTADA 3D Y FUNCIONES EDITORIALES
    // =========================================

    const coverScene = document.getElementById("coverScene");
    const coverObject = document.getElementById("coverObject");
    const coverImage = document.getElementById("magCover");
    const placeholder = document.getElementById("coverPlaceholder");
    const root = document.documentElement;

    if (coverImage && coverObject) {
        const showCover = () => {
            coverImage.style.display = "block";
            coverObject.classList.add("image-loaded");
        };

        const showPlaceholder = () => {
            coverImage.style.display = "none";
            if (placeholder) placeholder.style.display = "flex";
        };

        coverImage.addEventListener("load", showCover);
        coverImage.addEventListener("error", showPlaceholder);

        if (coverImage.complete) {
            if (coverImage.naturalWidth > 0) {
                showCover();
            } else {
                showPlaceholder();
            }
        }
    }

    if (!coarsePointer) {
        window.addEventListener("pointermove", event => {
            const x = event.clientX / window.innerWidth - 0.5;
            const y = event.clientY / window.innerHeight - 0.5;

            root.style.setProperty("--grid-x", `${x * 18}px`);
            root.style.setProperty("--grid-y", `${y * 18}px`);

            if (coverObject) {
                coverObject.style.setProperty(
                    "--cover-rx",
                    `${-5 - y * 12}deg`
                );

                coverObject.style.setProperty(
                    "--cover-ry",
                    `${-12 + x * 20}deg`
                );
            }
        }, { passive: true });

        window.addEventListener("pointerout", event => {
            if (event.relatedTarget !== null) return;

            root.style.setProperty("--grid-x", "0px");
            root.style.setProperty("--grid-y", "0px");

            if (coverObject) {
                coverObject.style.setProperty("--cover-rx", "-5deg");
                coverObject.style.setProperty("--cover-ry", "-12deg");
            }
        });
    }

    // Revelado al entrar en pantalla.
    const revealElements = document.querySelectorAll("[data-reveal]");

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries, instance) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;

                entry.target.classList.add("is-visible");
                instance.unobserve(entry.target);
            });
        }, { threshold: 0.15 });

        revealElements.forEach(element => observer.observe(element));
    } else {
        revealElements.forEach(element => {
            element.classList.add("is-visible");
        });
    }

    // Parallax del archivo.
    let scrollPending = false;

    function updateScroll() {
        const scrollY = window.scrollY || 0;
        const archiveTop = archive.offsetTop;
        const archiveProgress = Math.max(0, scrollY - archiveTop);

        root.style.setProperty("--back-shift", `${scrollY * -0.035}px`);
        root.style.setProperty("--front-shift", `${scrollY * 0.065}px`);

        if (coverScene) {
            coverScene.style.setProperty(
                "--cover-parallax",
                `${archiveProgress * 0.045}px`
            );
        }

        scrollPending = false;
    }

    window.addEventListener("scroll", () => {
        if (scrollPending) return;

        scrollPending = true;
        requestAnimationFrame(updateScroll);
    }, { passive: true });

    window.addEventListener("resize", resize, { passive: true });

    startTime = performance.now();
    resize();
    updateScroll();

    if (!reducedMotion) {
        wake();
    } else {
        draw();
    }
})();


/* ==========================================
   HEX ROOT — TYPEWRITER EDITORIAL
   ========================================== */

(() => {
    const intro = document.getElementById("editorialIntro");

    if (!intro) return;

    const elements = [
        ...intro.querySelectorAll("[data-typewriter]")
    ];

    if (!elements.length) return;

    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) return;

    // Conserva el texto original antes de animarlo.
    const items = elements.map(element => {
        const originalText = element.textContent.trim();

        element.dataset.originalText = originalText;
        element.textContent = "";

        return {
            element,
            text: originalText
        };
    });

    let started = false;

    async function typeText(element, text, speed) {
        element.classList.add("is-typing");

        for (let i = 0; i < text.length; i++) {
            element.textContent = text.slice(0, i + 1);

            await new Promise(resolve => {
                window.setTimeout(resolve, speed);
            });
        }

        element.classList.remove("is-typing");
    }

    async function startTyping() {
        if (started) return;
        started = true;

        // Pequeña pausa antes de que el sistema se active.
        await new Promise(resolve => window.setTimeout(resolve, 450));

        for (const item of items) {
            const isHeading = item.element.closest(".editorial-title");
            const speed = isHeading ? 48 : 15;

            await typeText(item.element, item.text, speed);

            // Pausa breve entre líneas.
            await new Promise(resolve => {
                window.setTimeout(resolve, isHeading ? 180 : 320);
            });
        }
    }

    // Inicia cuando la introducción está visible.
    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(entries => {
            if (!entries.some(entry => entry.isIntersecting)) return;

            observer.disconnect();
            startTyping();
        }, { threshold: 0.2 });

        observer.observe(intro);
    } else {
        startTyping();
    }
})();
