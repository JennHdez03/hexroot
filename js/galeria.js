
(() => {
    "use strict";

    const world = document.getElementById("galleryWorld");
    const stage = document.getElementById("galleryStage");
    const counter = document.getElementById("galleryCounter");
    const rotationLabel = document.getElementById("galleryRotation");

    if (!world || !stage) return;

    const TOTAL_IMAGES = 20;
const IMAGE_PATH = "img/galeria (";
const FRAME_PATH = "img/hud/radar-ring-green.png";

    const tiles = [];
    const points = [];

    let rotationY = 0;
    let rotationX = -0.12;
    let velocityY = 0;
    let velocityX = 0;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let lastTime = 0;
    let animationFrame = 0;
    let activeImage = 0;
    let frontIndex = 0;

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    // Crear las imágenes y sus marcos HUD.
    for (let i = 0; i < TOTAL_IMAGES; i++) {
        const tile = document.createElement("article");
        tile.className = "gallery-tile";

        const button = document.createElement("button");
        button.className = "gallery-tile-button";
        button.type = "button";
        button.setAttribute(
            "aria-label",
            `Ver imagen ${i + 1} de ${TOTAL_IMAGES}`
        );

        const image = document.createElement("img");
        image.className = "gallery-tile-image";
        image.src = `${IMAGE_PATH}${i + 1}).png`;
        image.alt = `Imagen ${i + 1} de la galería HEX ROOT`;
        image.draggable = false;
        image.loading = i < 6 ? "eager" : "lazy";

        image.addEventListener("error", () => {
            console.warn("No se pudo cargar la imagen:", image.src);
            tile.classList.add("image-missing");
        });

        const frame = document.createElement("img");
        frame.className = "gallery-tile-frame";
        frame.src = FRAME_PATH;
        frame.alt = "";
        frame.setAttribute("aria-hidden", "true");
        frame.draggable = false;

        button.append(image, frame);
        tile.append(button);
        world.append(tile);

        tiles.push(tile);

        button.addEventListener("click", () => {
            activeImage = i;

            const modal = document.getElementById("galleryModal");
            const modalImage = document.getElementById("galleryModalImage");
            const modalTitle = document.getElementById("galleryModalTitle");
            const modalCounter = document.getElementById("galleryModalCounter");
            const closeButton = document.getElementById("galleryModalClose");

            modalImage.src = image.src;
            modalImage.alt = `Imagen ${i + 1} de la galería HEX ROOT`;
            modalTitle.textContent =
                `ARCHIVE_${String(i + 1).padStart(3, "0")}`;
            modalCounter.textContent =
                `${String(i + 1).padStart(2, "0")} / ${TOTAL_IMAGES}`;

            modal.classList.add("is-open");
            modal.setAttribute("aria-hidden", "false");
            document.body.classList.add("gallery-modal-open");

            closeButton.focus();
        });

        // Distribución inicial mediante una esfera Fibonacci.
        const t = (i + 0.5) / TOTAL_IMAGES;
        const latitude = Math.acos(1 - 2 * t) - Math.PI / 2;
        const longitude = Math.PI * (3 - Math.sqrt(5)) * i;

        points.push({
            latitude,
            longitude
        });
    }

    function updateCounter(index) {
        if (counter) {
            counter.textContent =
                `${String(index + 1).padStart(2, "0")} / ${TOTAL_IMAGES}`;
        }
    }

    function rotatePoint(x, y, z, angleX, angleY) {
        // Rotación alrededor del eje Y.
        const cosY = Math.cos(angleY);
        const sinY = Math.sin(angleY);

        const x1 = x * cosY + z * sinY;
        const z1 = -x * sinY + z * cosY;

        // Rotación alrededor del eje X.
        const cosX = Math.cos(angleX);
        const sinX = Math.sin(angleX);

        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;

        return { x: x1, y: y2, z: z2 };
    }

    function render() {
        animationFrame = 0;

        const width = stage.clientWidth;
        const height = stage.clientHeight;

        const radius = Math.min(width * 0.28, height * 0.28, 220);
        const depth = Math.max(450, width * 0.9);

        frontIndex = 0;
        let frontDepth = -Infinity;

        points.forEach((point, index) => {
            const cosLat = Math.cos(point.latitude);

            const originalX = Math.sin(point.longitude) * cosLat;
            const originalY = Math.sin(point.latitude);
            const originalZ = Math.cos(point.longitude) * cosLat;

            const p = rotatePoint(
                originalX,
                originalY,
                originalZ,
                rotationX,
                rotationY
            );

            // Detectar la imagen que está más cerca del frente.
            if (p.z > frontDepth) {
                frontDepth = p.z;
                frontIndex = index;
            }

            // Perspectiva: los objetos cercanos crecen.
            const perspective = depth / (depth - p.z * radius);
            const x = p.x * radius * perspective;
            const y = p.y * radius * perspective;
            const z = p.z * radius;

            const scale = 0.68 + ((p.z + 1) / 2) * 0.48;
            const opacity = Math.max(
                0.12,
                Math.min(1, (p.z + 1.25) / 1.5)
            );

            const tile = tiles[index];

            tile.style.transform =
                `translate(-50%, -50%) ` +
                `translate3d(${x}px, ${y}px, ${z}px) ` +
                `scale(${scale})`;

            tile.style.opacity = opacity.toFixed(3);
            tile.style.zIndex = String(Math.round((p.z + 1) * 1000));
            tile.style.filter =
                p.z < -0.2 ? "brightness(0.45)" : "brightness(1)";

            tile.classList.toggle("is-focused", p.z > 0.88);
        });

        updateCounter(frontIndex);

        if (rotationLabel) {
            const degrees = (
                ((rotationY * 180 / Math.PI) % 360 + 360) % 360
            );

            rotationLabel.textContent =
                `${String(Math.round(degrees)).padStart(3, "0")}°`;
        }
    }

    function requestRender() {
        if (!animationFrame) {
            animationFrame = requestAnimationFrame(render);
        }
    }

    function onPointerDown(event) {
        if (event.pointerType === "mouse" && event.button !== 0) return;

        dragging = true;
        lastX = event.clientX;
        lastY = event.clientY;
        lastTime = performance.now();
        velocityX = 0;
        velocityY = 0;

        stage.setPointerCapture?.(event.pointerId);
        world.style.cursor = "grabbing";
    }

    function onPointerMove(event) {
        if (!dragging) return;

        const now = performance.now();
        const elapsed = Math.max(1, now - lastTime);
        const dx = event.clientX - lastX;
        const dy = event.clientY - lastY;

        // Sensibilidad del movimiento.
        rotationY += dx * 0.002;
        rotationX += dy * 0.0015;

        // Evita que la esfera se voltee excesivamente.
        rotationX = Math.max(-1.15, Math.min(1.15, rotationX));

        // Inercia según la velocidad del arrastre.
        velocityY = (dx / elapsed) * 0.12;
        velocityX = (dy / elapsed) * 0.08;

        lastX = event.clientX;
        lastY = event.clientY;
        lastTime = now;

        requestRender();
    }

    function onPointerUp() {
        if (!dragging) return;

        dragging = false;
        world.style.cursor = "grab";
        startInertia();
    }

    // Inercia y centrado automático de la imagen frontal.
    function startInertia() {
        if (reducedMotion) {
            velocityX = 0;
            velocityY = 0;
        }

        let snapping = false;
        let snapTargetX = rotationX;
        let snapTargetY = rotationY;

        function step() {
            if (dragging) return;

            // Primera fase: dejar girar la esfera con inercia.
            if (!snapping) {
                rotationY += velocityY;
                rotationX += velocityX;

                rotationX = Math.max(
                    -1.15,
                    Math.min(1.15, rotationX)
                );

                velocityY *= 0.88;
                velocityX *= 0.88;

                // Esperar hasta que la esfera casi se detenga.
                if (
                    Math.abs(velocityY) < 0.0005 &&
                    Math.abs(velocityX) < 0.0005
                ) {
                    velocityX = 0;
                    velocityY = 0;

                    // Capturar la imagen que quedó más al frente.
                    const point = points[frontIndex];

                    if (!point) {
                        requestRender();
                        return;
                    }

                    const cosLat = Math.cos(point.latitude);
                    const x = Math.sin(point.longitude) * cosLat;
                    const y = Math.sin(point.latitude);
                    const z = Math.cos(point.longitude) * cosLat;

                    // Calcular la orientación necesaria para centrarla.
                    snapTargetY = Math.atan2(-x, z);
                    snapTargetX = Math.atan2(
                        y,
                        Math.hypot(x, z)
                    );

                    // Elegir el camino angular más corto.
                    snapTargetY = rotationY + Math.atan2(
                        Math.sin(snapTargetY - rotationY),
                        Math.cos(snapTargetY - rotationY)
                    );

                    snapping = true;
                }

                requestRender();

                if (!snapping) {
                    requestAnimationFrame(step);
                    return;
                }
            }

            // Segunda fase: centrar progresivamente, sin saltos.
            const diffY = snapTargetY - rotationY;
            const diffX = snapTargetX - rotationX;

            if (
                Math.abs(diffY) < 0.001 &&
                Math.abs(diffX) < 0.001
            ) {
                rotationY = snapTargetY;
                rotationX = snapTargetX;

                requestRender();
                return;
            }

            rotationY += diffY * 0.12;
            rotationX += diffX * 0.12;

            requestRender();
            requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
    }

    
    // =========================================
    // FLECHAS DE NAVEGACIÓN HEX ROOT
    // =========================================

    const prevButton = document.getElementById("galleryPrev");
    const nextButton = document.getElementById("galleryNext");

    let arrowAnimationId = null;

    function moveToImage(direction) {
        // Detener una transición anterior de las flechas.
        if (arrowAnimationId !== null) {
            cancelAnimationFrame(arrowAnimationId);
            arrowAnimationId = null;
        }

        // Detener la inercia antes de iniciar el nuevo movimiento.
        velocityX = 0;
        velocityY = 0;
        dragging = false;

        // Identificar la imagen que está actualmente al frente.
        const currentIndex = frontIndex;
        const targetIndex =
            (currentIndex + direction + TOTAL_IMAGES) % TOTAL_IMAGES;

        const point = points[targetIndex];
        if (!point) return;

        const cosLat = Math.cos(point.latitude);
        const x = Math.sin(point.longitude) * cosLat;
        const y = Math.sin(point.latitude);
        const z = Math.cos(point.longitude) * cosLat;

        let targetY = Math.atan2(-x, z);
        const targetX = Math.atan2(y, Math.hypot(x, z));

        // Elegir el recorrido angular más corto.
        targetY = rotationY + Math.atan2(
            Math.sin(targetY - rotationY),
            Math.cos(targetY - rotationY)
        );

        const startX = rotationX;
        const startY = rotationY;
        const diffX = targetX - startX;
        const diffY = targetY - startY;
        const startTime = performance.now();
        const duration = reducedMotion ? 0 : 650;

        function animate(now) {
            const progress = duration === 0
                ? 1
                : Math.min(1, (now - startTime) / duration);

            // Transición suave.
            const eased = 0.5 - 0.5 * Math.cos(Math.PI * progress);

            rotationX = startX + diffX * eased;
            rotationY = startY + diffY * eased;

            requestRender();

            if (progress < 1) {
                arrowAnimationId = requestAnimationFrame(animate);
            } else {
                rotationX = targetX;
                rotationY = targetY;
                arrowAnimationId = null;
                requestRender();
            }
        }

        arrowAnimationId = requestAnimationFrame(animate);
    }

    // Evitar que el clic de una flecha inicie el arrastre de la esfera.
    prevButton?.addEventListener("pointerdown", event => {
        event.stopPropagation();
    });

    nextButton?.addEventListener("pointerdown", event => {
        event.stopPropagation();
    });

    prevButton?.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        moveToImage(-1);
    });

    nextButton?.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        moveToImage(1);
    });

    // Navegación con teclado.
    world.addEventListener("keydown", event => {
        const step = 0.18;

        if (event.key === "ArrowLeft") {
            rotationY -= step;
        } else if (event.key === "ArrowRight") {
            rotationY += step;
        } else if (event.key === "ArrowUp") {
            rotationX = Math.max(-1.15, rotationX - step);
        } else if (event.key === "ArrowDown") {
            rotationX = Math.min(1.15, rotationX + step);
        } else {
            return;
        }

        event.preventDefault();
        requestRender();
    });

    stage.addEventListener("pointerdown", onPointerDown);
    stage.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerup", onPointerUp);
    stage.addEventListener("pointercancel", onPointerUp);

    window.addEventListener("resize", requestRender);

    // Estado inicial.
    render();

    const galleryModal = document.getElementById("galleryModal");
    const galleryModalClose = document.getElementById("galleryModalClose");

    function closeGalleryModal() {
        if (!galleryModal) return;

        galleryModal.classList.remove("is-open");
        galleryModal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("gallery-modal-open");
    }

    galleryModalClose?.addEventListener("click", closeGalleryModal);

    galleryModal?.addEventListener("click", event => {
        if (event.target === galleryModal) {
            closeGalleryModal();
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeGalleryModal();
        }
    });
})();


    // =========================================
    // FLECHAS: NAVEGACIÓN ENTRE IMÁGENES
    // =========================================

    const prevButton = document.getElementById("galleryPrev");
    const nextButton = document.getElementById("galleryNext");

    let arrowAnimationId = 0;

    function moveToImage(index) {
        // Detener cualquier animación anterior.
        if (arrowAnimationId) {
            cancelAnimationFrame(arrowAnimationId);
            arrowAnimationId = 0;
        }

        dragging = false;
        velocityX = 0;
        velocityY = 0;

        // Mantener el índice dentro del rango de imágenes.
        const targetIndex =
            (index + TOTAL_IMAGES) % TOTAL_IMAGES;

        const point = points[targetIndex];

        if (!point) return;

        const cosLat = Math.cos(point.latitude);

        const x = Math.sin(point.longitude) * cosLat;
        const y = Math.sin(point.latitude);
        const z = Math.cos(point.longitude) * cosLat;

        // Calcular la orientación exacta de la imagen.
        let targetY = Math.atan2(-x, z);
        const targetX = Math.atan2(y, Math.hypot(x, z));

        // Evitar que la esfera dé una vuelta innecesaria.
        targetY = rotationY + Math.atan2(
            Math.sin(targetY - rotationY),
            Math.cos(targetY - rotationY)
        );

        const startX = rotationX;
        const startY = rotationY;
        const diffX = targetX - startX;
        const diffY = targetY - startY;

        const duration = reducedMotion ? 0 : 650;
        const startTime = performance.now();

        function animate(now) {
            const progress = duration === 0
                ? 1
                : Math.min(1, (now - startTime) / duration);

            // Curva suave de entrada y salida.
            const eased =
                progress < 0.5
                    ? 4 * progress * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            rotationY = startY + diffY * eased;
            rotationX = startX + diffX * eased;

            requestRender();

            if (progress < 1) {
                arrowAnimationId = requestAnimationFrame(animate);
            } else {
                rotationY = targetY;
                rotationX = targetX;
                frontIndex = targetIndex;
                arrowAnimationId = 0;
                requestRender();
            }
        }

        arrowAnimationId = requestAnimationFrame(animate);
    }

    function handleArrowClick(event, direction) {
        event.preventDefault();
        event.stopPropagation();

        // Si la esfera se estaba moviendo, partir de su estado actual.
        const nextIndex =
            (frontIndex + direction + TOTAL_IMAGES) % TOTAL_IMAGES;

        moveToImage(nextIndex);
    }

    prevButton?.addEventListener("pointerdown", event => {
        event.stopPropagation();
    });

    nextButton?.addEventListener("pointerdown", event => {
        event.stopPropagation();
    });

    prevButton?.addEventListener("click", event => {
        handleArrowClick(event, -1);
    });

    nextButton?.addEventListener("click", event => {
        handleArrowClick(event, 1);
    });
