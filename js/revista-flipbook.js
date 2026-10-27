
(() => {
    "use strict";

    const openButton = document.getElementById("openFlipbook");
    const overlay = document.getElementById("hrFlipbookOverlay");
    const closeButton = document.getElementById("closeFlipbook");
    const book = document.getElementById("flipbookBook");
    const loading = document.getElementById("flipbookLoading");
    const errorBox = document.getElementById("flipbookError");
    const counter = document.getElementById("flipPageCounter");
    const prevButton = document.getElementById("flipPrev");
    const nextButton = document.getElementById("flipNext");

    if (!openButton || !overlay || !book) {
        console.error("[HEX ROOT] No se encontraron los elementos del visor.");
        return;
    }

    const pdfPath = new URL(
        "img/revista/HexRoot.pdf",
        document.baseURI
    ).href;

    let pageFlip = null;
    let loadingPromise = null;
    let pageCount = 0;
    let previousFocus = null;

    function showError(message) {
        if (loading) loading.classList.add("is-hidden");

        if (!errorBox) {
            alert(message);
            return;
        }

        errorBox.hidden = false;
        errorBox.replaceChildren();

        const messageElement = document.createElement("p");
        messageElement.textContent = message;
        errorBox.appendChild(messageElement);

        const openLink = document.createElement("a");
        openLink.href = pdfPath;
        openLink.target = "_blank";
        openLink.rel = "noopener noreferrer";
        openLink.textContent = "ABRIR REVISTA PDF";
        errorBox.appendChild(openLink);

        const downloadLink = document.createElement("a");
        downloadLink.href = pdfPath;
        downloadLink.setAttribute("download", "HexRoot.pdf");
        downloadLink.textContent = "DESCARGAR PDF";
        errorBox.appendChild(downloadLink);
    }

    function updateControls(index = 0) {
        if (!pageCount) return;

        if (counter) {
            counter.textContent =
                `${String(index + 1).padStart(2, "0")} / ` +
                `${String(pageCount).padStart(2, "0")}`;
        }

        if (prevButton) prevButton.disabled = index <= 0;
        if (nextButton) {
            nextButton.disabled = index >= pageCount - 1;
        }
    }

    async function loadFlipbook() {
        if (pageFlip) return;
        if (loadingPromise) return loadingPromise;

        loadingPromise = (async () => {
            if (loading) loading.classList.remove("is-hidden");
            if (errorBox) errorBox.hidden = true;

            try {
                const pdfjs = window.pdfjsLib;
                const PageFlip = window.St?.PageFlip;

                if (!pdfjs || !PageFlip) {
                    throw new Error(
                        "No se cargaron las librerías PDF.js o PageFlip."
                    );
                }

                pdfjs.GlobalWorkerOptions.workerSrc =
                    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

                console.log("[HEX ROOT] Cargando PDF:", pdfPath);

                const pdf = await pdfjs.getDocument({
                    url: pdfPath
                }).promise;

                pageCount = pdf.numPages;
                console.log("[HEX ROOT] Total de páginas:", pageCount);

                const images = [];

                for (let number = 1; number <= pageCount; number++) {
                    console.log(
                        `[HEX ROOT] Procesando página ${number}/${pageCount}`
                    );

                    const page = await pdf.getPage(number);
                    const viewport = page.getViewport({ scale: 0.7 });

                    const canvas = document.createElement("canvas");
                    const context = canvas.getContext("2d");

                    if (!context) {
                        throw new Error(
                            `No se pudo crear el lienzo de la página ${number}.`
                        );
                    }

                    canvas.width = Math.ceil(viewport.width);
                    canvas.height = Math.ceil(viewport.height);

                    await page.render({
                        canvasContext: context,
                        viewport
                    }).promise;

                    images.push(canvas.toDataURL("image/jpeg", 0.7));

                    // Liberar la memoria del lienzo después de guardar la imagen.
                    canvas.width = 0;
                    canvas.height = 0;

                    page.cleanup();
                }

                if (!images.length) {
                    throw new Error("El PDF no contiene páginas renderizables.");
                }

                console.log("[HEX ROOT] Creando libro animado...");

                const instance = new PageFlip(book, {
                    width: 500,
                    height: 700,
                    size: "stretch",
                    minWidth: 280,
                    maxWidth: 1000,
                    minHeight: 390,
                    maxHeight: 1400,
                    showCover: true,
                    usePortrait: true,
                    mobileScrollSupport: false,
                    maxShadowOpacity: 0.45,
                    flippingTime: 850,
                    drawShadow: true,
                    autoSize: true
                });

                instance.on("flip", event => {
                    updateControls(event.data);
                });

                instance.loadFromImages(images);

                pageFlip = instance;
                updateControls(0);

                if (loading) loading.classList.add("is-hidden");

                console.log("[HEX ROOT] Revista inicializada correctamente.");
            } catch (err) {
                console.error("[HEX ROOT] Error al cargar el visor:", err);

                showError(
                    "No se pudo cargar la revista animada. " +
                    "Puedes abrir el PDF directamente."
                );

                throw err;
            }
        })();

        try {
            await loadingPromise;
        } finally {
            loadingPromise = null;
        }
    }

    async function openViewer() {
        previousFocus = document.activeElement;

        overlay.classList.add("is-open");
        overlay.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";

        if (closeButton) closeButton.focus();

        try {
            await loadFlipbook();
        } catch (err) {
            // El error ya se muestra dentro del visor.
        }
    }

    function closeViewer() {
        overlay.classList.remove("is-open");
        overlay.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";

        if (previousFocus && typeof previousFocus.focus === "function") {
            previousFocus.focus();
        }
    }

    openButton.addEventListener("click", event => {
        event.preventDefault();
        openViewer();
    });

    if (closeButton) {
        closeButton.addEventListener("click", closeViewer);
    }

    if (prevButton) {
        prevButton.addEventListener("click", () => {
            if (pageFlip) pageFlip.flipPrev();
        });
    }

    if (nextButton) {
        nextButton.addEventListener("click", () => {
            if (pageFlip) pageFlip.flipNext();
        });
    }

    overlay.addEventListener("click", event => {
        if (event.target === overlay) closeViewer();
    });

    document.addEventListener("keydown", event => {
        if (!overlay.classList.contains("is-open")) return;

        if (event.key === "Escape") closeViewer();
        if (event.key === "ArrowLeft" && pageFlip) pageFlip.flipPrev();
        if (event.key === "ArrowRight" && pageFlip) pageFlip.flipNext();
    });
})();
