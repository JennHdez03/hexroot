
/* =====================================
   HEX ROOT — TEMÁTICA
   Intro de video + revelación visual
===================================== */

(() => {
  const intro = document.getElementById("hex-intro");
  const video = document.getElementById("intro-logo-video");
  const status = document.getElementById("intro-status");

  let finished = false;
  let flashTimer = null;
  let introTimer = null;
  let safetyTimer = null;
  let flashOffTimer = null;
  let monitorFrame = null;

  // Bloquear el scroll durante la intro.
  document.body.classList.add("intro-lock");

  // Preparar la intro.
  if (intro && video) {
    video.pause();
    video.currentTime = 0;

    intro.classList.remove(
      "lights-active",
      "video-visible",
      "glitch-flash",
      "intro-ending"
    );

    // Después del negro inicial aparecen los destellos.
    introTimer = window.setTimeout(() => {
      if (finished) return;

      intro.classList.add("lights-active");

      if (status) {
        status.textContent = "ANOMALY DETECTED...";
      }

      window.setTimeout(() => {
        if (finished) return;

        intro.classList.add("video-visible");

        if (status) {
          status.textContent = "LOADING SYSTEM FAILURE...";
        }

        video.playbackRate = 1.25;
        const playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch((error) => {
            console.warn("No fue posible reproducir el video:", error);
          });
        }
      }, 700);
    }, 1100);

    // Destellos de interferencia.
    function scheduleFlash() {
      if (finished) return;

      flashTimer = window.setTimeout(() => {
        if (finished) return;

        intro.classList.add("glitch-flash");

        flashOffTimer = window.setTimeout(() => {
          intro.classList.remove("glitch-flash");
        }, 220);

        scheduleFlash();
      }, 700 + Math.random() * 1900);
    }

    scheduleFlash();

    video.addEventListener("ended", finishIntro, { once: true });

    // Si el video falla, no dejar la página bloqueada.
    video.addEventListener("error", () => {
      if (status) status.textContent = "SIGNAL LOST...";
      safetyTimer = window.setTimeout(finishIntro, 1600);
    }, { once: true });

    // Comprobar el final del video.
    function monitorVideo() {
      if (finished) return;

      if (
        !video.paused &&
        Number.isFinite(video.duration) &&
        video.duration > 0 &&
        video.currentTime >= video.duration - 0.08
      ) {
        finishIntro();
        return;
      }

      monitorFrame = requestAnimationFrame(monitorVideo);
    }

    monitorFrame = requestAnimationFrame(monitorVideo);

    video.addEventListener("loadedmetadata", () => {
      console.info("Duración del video:", video.duration);
    }, { once: true });
  }

  function finishIntro() {
    if (finished) return;
    finished = true;

    window.clearTimeout(introTimer);
    window.clearTimeout(flashTimer);
    window.clearTimeout(safetyTimer);
    window.clearTimeout(flashOffTimer);

    if (monitorFrame !== null) {
      cancelAnimationFrame(monitorFrame);
    }

    if (status) {
      status.textContent = "CONNECTION TERMINATED";
    }

    if (video) video.pause();

    if (intro) {
      intro.classList.remove("glitch-flash");
      intro.classList.add("intro-ending");

      window.setTimeout(() => {
        intro.remove();
        document.body.classList.remove("intro-lock");
      }, 1600);
    } else {
      document.body.classList.remove("intro-lock");
    }
  }

  // =====================================
  // REVELACIÓN DE SECCIONES AL HACER SCROLL
  // =====================================

  const revealTargets = document.querySelectorAll(
    ".section-heading, .section-copy, .mateo-panel, " +
    ".anomalies-heading, .anomaly-card, .universe-content, " +
    ".warning-line"
  );

  revealTargets.forEach((element) => {
    element.classList.add("reveal");
  });

  if ("IntersectionObserver" in window) {
    document.body.classList.add("js-ready");

    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            currentObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -35px 0px"
      }
    );

    revealTargets.forEach((element) => observer.observe(element));
  } else {
    revealTargets.forEach((element) => {
      element.classList.add("is-visible");
    });
  }

  // =====================================
  // NAVEGACIÓN POR ANCLAS
  // =====================================

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();

      const horizontalTrack = document.getElementById("horizontal-track");

      if (horizontalTrack && horizontalTrack.contains(target)) {
        horizontalTrack.scrollTo({
          left: target.offsetLeft,
          behavior: "smooth"
        });
      } else {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }

      history.replaceState(null, "", targetId);
    });
  });
})();


/* ======================================
   HEX ROOT — CONTROL DEL MENÚ RADIAL
====================================== */

(() => {
  "use strict";

  const nav = document.getElementById("hexNav");
  const toggle = document.getElementById("hexNavToggle");
  const items = document.getElementById("hexNavItems");

  if (!nav || !toggle || !items) {
    console.warn("HEX ROOT: no se encontró el menú de navegación.");
    return;
  }

  const links = items.querySelectorAll(".hex-nav__item");

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

  // Abrir o cerrar al pulsar el icono
  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleMenu();
  });

  // Abrir al pasar el ratón
  nav.addEventListener("mouseenter", openMenu);

  // Cerrar al salir, salvo que se esté usando el teclado
  nav.addEventListener("mouseleave", () => {
    if (!nav.contains(document.activeElement)) {
      closeMenu();
    }
  });

  // Cerrar al pulsar fuera del menú
  document.addEventListener("click", (event) => {
    if (!nav.contains(event.target)) {
      closeMenu();
    }
  });

  // Cerrar con Escape
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
      toggle.focus();
    }
  });

  // Navegación a las secciones
  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetSelector = link.getAttribute("href");

      if (!targetSelector || !targetSelector.startsWith("#")) {
        closeMenu();
        return;
      }

      const target = document.querySelector(targetSelector);

      if (!target) {
        console.warn(
          `HEX ROOT: no existe la sección ${targetSelector}.`
        );
        event.preventDefault();
        return;
      }

      event.preventDefault();

      // Permite usar el menú con secciones normales
      // y con secciones dentro del recorrido horizontal.
      const horizontalTrack = document.getElementById("horizontal-track");

      if (
        horizontalTrack &&
        horizontalTrack.contains(target)
      ) {
        horizontalTrack.scrollTo({
          left: target.offsetLeft,
          behavior: "smooth"
        });
      } else {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }

      history.replaceState(null, "", targetSelector);
      closeMenu();
    });
  });

})();


(() => {
  const section = document.querySelector("#origen");
  if (!section) return;

  const images = section.querySelectorAll("[data-origin-image]");
  // Instrucción visible para ratón y pantalla táctil.
  images.forEach((image) => {
    const prompt = image.querySelector(".origin-image-prompt");

    if (prompt) {
      prompt.textContent = "[ TOCA LA IMAGEN PARA REVELAR EL TEXTO ]";
    }
  });
  // Revelar las imágenes cuando la sección entra en pantalla.
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // La imagen entra en pantalla
        entry.target.classList.add("is-visible");
      } else {
        // La imagen sale de pantalla
        entry.target.classList.remove("is-visible");
      }
    });
  }, {
    threshold: 0.3
  });

  images.forEach((image) => observer.observe(image));

  // Escritura progresiva del texto.
  function typeText(element, text) {
    element.replaceChildren();

    const output = document.createElement("span");
    const cursor = document.createElement("span");

    cursor.className = "origin-cursor";
    cursor.textContent = "▋";
    cursor.setAttribute("aria-hidden", "true");

    element.append(output, cursor);

    let index = 0;

    function write() {
      output.textContent = text.slice(0, index);
      index++;

      if (index <= text.length) {
        window.setTimeout(write, 18);
      } else {
        cursor.remove();
      }
    }

    write();
  }

  // Activar el archivo correspondiente al hacer clic.
  function decode(image) {
    if (image.dataset.decoded === "true") return;

    const name = image.dataset.originImage === "zuri"
      ? "nastya"
      : "zuri";
    const panel = section.querySelector(
      `[data-origin-panel="${name}"]`
    );
    const paragraph = panel?.querySelector("[data-origin-text]");

    if (!paragraph) return;

    const text = paragraph.dataset.fullText;
    if (!text) return;

    image.dataset.decoded = "true";
    image.classList.add("is-decoding");

    const prompt = image.querySelector(".origin-image-prompt");
    if (prompt) prompt.textContent = "[ DECODING FILE... ]";

    const loading = paragraph.querySelector(".origin-loading");
    if (loading) loading.textContent = "DECODIFICANDO REGISTRO...";

    window.setTimeout(() => {
      image.classList.remove("is-decoding");
      image.classList.add("is-decoded");

      if (prompt) prompt.textContent = "[ FILE DECODED ]";

      typeText(paragraph, text);
    }, 700);
  }

  images.forEach((image) => {
    image.addEventListener("click", () => decode(image));

    image.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        decode(image);
      }
    });
  });
})();


/* =========================================
   M.A.T.E.O. — IMAGEN AMPLIADA + PARALLAX
   Clic para abrir; scroll dentro para mover
========================================= */
(() => {
  const section = document.querySelector("#mateo");
  if (!section) return;

  const shots = section.querySelectorAll(".mateo-shot");

  if (!shots.length) return;

  // Crear ventana ampliada una sola vez.
  const lightbox = document.createElement("div");
  lightbox.className = "mateo-lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-label", "Imagen ampliada de M.A.T.E.O.");

  lightbox.innerHTML = `
    <div class="mateo-lightbox-topbar">
      <span>M.A.T.E.O. // VISUAL ANALYSIS</span>
      <button class="mateo-lightbox-close" type="button"
              aria-label="Cerrar imagen ampliada">[ × CERRAR ]</button>
    </div>

    <div class="mateo-lightbox-scroll" tabindex="0">
      <div class="mateo-lightbox-stage">
        <div class="mateo-lightbox-grid" aria-hidden="true"></div>

        <div class="mateo-lightbox-image-wrap">
          <img src="" alt="">
        </div>

        <div class="mateo-lightbox-caption">
          <span>SCROLL TO EXPLORE</span>
          <p class="mateo-lightbox-description"></p>
          <span>END OF VISUAL RECORD // M-01</span>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(lightbox);

  const scrollArea = lightbox.querySelector(".mateo-lightbox-scroll");
  const stage = lightbox.querySelector(".mateo-lightbox-stage");
  const grid = lightbox.querySelector(".mateo-lightbox-grid");
  const imageWrap = lightbox.querySelector(".mateo-lightbox-image-wrap");
  const enlargedImage = lightbox.querySelector("img");
  const description = lightbox.querySelector(".mateo-lightbox-description");
  const closeButton = lightbox.querySelector(".mateo-lightbox-close");

  let previousFocus = null;
  let animationFrame = null;

  function updateParallax() {
    animationFrame = null;

    const progress = scrollArea.scrollTop;

    // Capas con velocidades diferentes.
    grid.style.backgroundPosition = `0 ${progress * 0.18}px`;
    grid.style.transform =
      `perspective(650px) rotateX(48deg) scale(1.4) translateY(${progress * -0.08}px)`;

    imageWrap.style.transform =
      `translate3d(0, ${progress * -0.035}px, 0)`;

    enlargedImage.style.transform =
      `translate3d(0, ${progress * 0.045}px, 0) scale(1.025)`;
  }

  function requestParallax() {
    if (animationFrame !== null) return;
    animationFrame = window.requestAnimationFrame(updateParallax);
  }

  function openLightbox(figure) {
    const image = figure.querySelector("img");
    if (!image) return;

    previousFocus = document.activeElement;

    enlargedImage.src = image.currentSrc || image.src;
    enlargedImage.alt = image.alt || "Captura ampliada del videojuego";

    description.textContent =
      figure.querySelector("figcaption")?.innerText || "M.A.T.E.O. / ARCHIVE";

    const isPink = figure.classList.contains("mateo-shot-pink");

    imageWrap.style.setProperty(
      "--lightbox-accent",
      isPink ? "#ff36bc" : "#b8ff3c"
    );

    scrollArea.scrollTop = 0;
    updateParallax();

    lightbox.classList.add("is-open");
    document.body.classList.add("mateo-lightbox-active");

    closeButton.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    document.body.classList.remove("mateo-lightbox-active");

    enlargedImage.removeAttribute("src");

    if (previousFocus && typeof previousFocus.focus === "function") {
      previousFocus.focus();
    }
  }

  shots.forEach((figure) => {
    figure.setAttribute("tabindex", "0");
    figure.setAttribute("role", "button");
    figure.setAttribute("aria-label", "Ampliar captura y explorar con scroll");

    figure.addEventListener("click", () => openLightbox(figure));

    figure.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox(figure);
      }
    });
  });

  scrollArea.addEventListener("scroll", requestParallax, {
    passive: true
  });

  closeButton.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("is-open")) return;

    if (event.key === "Escape") {
      closeLightbox();
    }
  });
})();


/* ==========================================
   HEX ROOT — INTERACCIONES DEL CIERRE
========================================== */

(() => {
  const section = document.querySelector("#cierre.hexroot-ending");

  if (!section || section.dataset.endingInitialized === "true") {
    return;
  }

  section.dataset.endingInitialized = "true";

  const main = section.querySelector("#ending-main");
  const logoButton = section.querySelector("#ending-logo-button");
  const accessButton = section.querySelector("#ending-access-button");
  const description = section.querySelector("#ending-description");
  const closeButton = section.querySelector("#ending-close-button");
  const exploreButton = section.querySelector("#ending-explore-button");
  const canvas = section.querySelector(".ending-particles");

  if (
    !main ||
    !logoButton ||
    !accessButton ||
    !description ||
    !closeButton ||
    !exploreButton
  ) {
    console.warn("HEX ROOT: faltan elementos del cierre.");
    return;
  }

  let isOpen = false;
  let transitionTimer = null;
  let animationFrame = null;
  let resizeObserver = null;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ----------------------------------------
     ABRIR ARCHIVO
  ---------------------------------------- */


function openDescription() {
    if (isOpen) return;

    isOpen = true;

    clearTimeout(transitionTimer);

    section.classList.add("is-decrypting");
    logoButton.setAttribute("aria-expanded", "true");

    transitionTimer = window.setTimeout(() => {
      description.classList.add("is-visible");
      description.removeAttribute("inert");
      description.setAttribute("aria-hidden", "false");

      // Mover el foco antes de ocultar el contenido principal.
      closeButton.focus({ preventScroll: true });

      main.setAttribute("aria-hidden", "true");
      main.setAttribute("inert", "");

      section.classList.remove("is-decrypting");
    }, reducedMotion ? 0 : 320);
}


  /* ----------------------------------------
     CERRAR ARCHIVO
  ---------------------------------------- */

  function closeDescription(returnFocus = true) {
    if (!isOpen) return;

    isOpen = false;

    clearTimeout(transitionTimer);

    description.classList.remove("is-visible");
    description.setAttribute("aria-hidden", "true");
    description.setAttribute("inert", "");

    main.removeAttribute("inert");
    main.setAttribute("aria-hidden", "false");

    logoButton.setAttribute("aria-expanded", "false");
    section.classList.remove("is-decrypting");

    if (returnFocus) {
      logoButton.focus({ preventScroll: true });
    }
  }

  logoButton.addEventListener("click", openDescription);
  accessButton.addEventListener("click", openDescription);

  closeButton.addEventListener("click", () => {
    closeDescription(true);
  });

  /* Cerrar con Escape */

  section.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      closeDescription(true);
    }
  });

  /* ----------------------------------------
     VOLVER AL PRINCIPIO DEL RECORRIDO
  ---------------------------------------- */

  exploreButton.addEventListener("click", () => {
    closeDescription(false);

    const track = document.querySelector("#horizontal-track");

    if (track) {
      track.scrollTo({
        left: 0,
        behavior: reducedMotion ? "auto" : "smooth"
      });
    }

    const firstSection = document.querySelector("#inicio");

    if (firstSection) {
      firstSection.focus?.({ preventScroll: true });
    }
  });

  /* ----------------------------------------
     PARTÍCULAS DIGITALES
  ---------------------------------------- */

  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  if (!ctx) return;

  let width = 0;
  let height = 0;
  let particles = [];

  function resizeCanvas() {
    const rect = section.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    width = rect.width;
    height = rect.height;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const amount = Math.min(
      100,
      Math.max(25, Math.round((width * height) / 15000))
    );

    particles = Array.from({ length: amount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5 + 0.4,
      speed: Math.random() * 0.25 + 0.06,
      alpha: Math.random() * 0.6 + 0.15,
      color: Math.random() > 0.78 ? "#ff36bc" : "#b8ff3c"
    }));
  }

  function drawParticles() {
    ctx.clearRect(0, 0, width, height);

    for (const particle of particles) {
      ctx.beginPath();

      ctx.fillStyle = particle.color;
      ctx.globalAlpha = particle.alpha;

      ctx.arc(
        particle.x,
        particle.y,
        particle.radius,
        0,
        Math.PI * 2
      );

      ctx.fill();

      if (!reducedMotion) {
        particle.y -= particle.speed;

        if (particle.y < -3) {
          particle.y = height + 3;
          particle.x = Math.random() * width;
        }
      }
    }

    ctx.globalAlpha = 1;

    if (!reducedMotion) {
      animationFrame = requestAnimationFrame(drawParticles);
    }
  }

  function startParticles() {
    if (animationFrame !== null) return;

    animationFrame = requestAnimationFrame(drawParticles);
  }

  function stopParticles() {
    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  }

  resizeCanvas();

  if ("ResizeObserver" in window) {
    resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });

    resizeObserver.observe(section);
  } else {
    window.addEventListener("resize", resizeCanvas);
  }

  /* Evitar animaciones innecesarias cuando no se ve la sección */

  if ("IntersectionObserver" in window) {
    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry.isIntersecting && !document.hidden) {
          startParticles();
        } else {
          stopParticles();
        }
      },
      { threshold: 0.05 }
    );

    visibilityObserver.observe(section);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopParticles();
      } else {
        const rect = section.getBoundingClientRect();

        if (rect.right > 0 && rect.left < window.innerWidth) {
          startParticles();
        }
      }
    });
  } else {
    startParticles();
  }

})();



/* ==========================================
   HEX ROOT — TRANSCRIPCIÓN HACKER
========================================== */

(() => {
  const section = document.querySelector("#cierre.hexroot-ending");
  if (!section) return;

  const panel = section.querySelector("#ending-hacker-text");
  const description = section.querySelector("#ending-description");
  const logoButton = section.querySelector("#ending-logo-button");
  const accessButton = section.querySelector("#ending-access-button");

  if (!panel || !description) return;

  const paragraphs = [...panel.querySelectorAll("p")];

  // Guardar el contenido original, incluyendo HEX y ROOT.
  const originalContent = paragraphs.map((paragraph) => {
    return [...paragraph.childNodes].map((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        return { type: "text", value: node.textContent };
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        return {
          type: "element",
          tag: node.tagName.toLowerCase(),
          className: node.className,
          value: node.textContent
        };
      }

      return null;
    }).filter(Boolean);
  });

  let typingTimers = [];
  let hasTyped = false;

  function clearTyping() {
    typingTimers.forEach(clearTimeout);
    typingTimers = [];
  }

  function restoreOriginalContent() {
    paragraphs.forEach((paragraph, index) => {
      paragraph.replaceChildren();

      originalContent[index].forEach((item) => {
        if (item.type === "text") {
          paragraph.appendChild(
            document.createTextNode(item.value)
          );
        } else {
          const element = document.createElement(item.tag);
          element.className = item.className;
          element.textContent = item.value;
          paragraph.appendChild(element);
        }
      });
    });
  }

  function typeParagraph(paragraph, index, startDelay) {
    const original = originalContent[index];
    const tokens = [];

    original.forEach((item) => {
      if (item.type === "text") {
        tokens.push({
          type: "text",
          value: item.value
        });
      } else {
        tokens.push({
          type: "element",
          tag: item.tag,
          className: item.className,
          value: item.value
        });
      }
    });

    paragraph.replaceChildren();

    let tokenIndex = 0;
    let characterIndex = 0;
    let currentNode = null;

    function step() {
      if (!description.classList.contains("is-visible")) return;

      if (tokenIndex >= tokens.length) return;

      const token = tokens[tokenIndex];

      if (!currentNode) {
        if (token.type === "element") {
          currentNode = document.createElement(token.tag);
          currentNode.className = token.className;
          paragraph.appendChild(currentNode);
        } else {
          currentNode = document.createTextNode("");
          paragraph.appendChild(currentNode);
        }
      }

      const character = token.value.charAt(characterIndex);

      if (token.type === "element") {
        currentNode.textContent += character;
      } else {
        currentNode.textContent += character;
      }

      characterIndex++;

      if (characterIndex >= token.value.length) {
        tokenIndex++;
        characterIndex = 0;
        currentNode = null;
      }

      const delay = character === " " ? 8 : 17;
      const timer = setTimeout(step, delay);
      typingTimers.push(timer);
    }

    const timer = setTimeout(step, startDelay);
    typingTimers.push(timer);
  }

  function startTyping() {
    clearTyping();
    restoreOriginalContent();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      hasTyped = true;
      return;
    }

    panel.classList.add("is-typing");

    let delay = 120;

    paragraphs.forEach((paragraph, index) => {
      typeParagraph(paragraph, index, delay);

      const characters = originalContent[index].reduce(
        (total, item) => total + item.value.length,
        0
      );

      delay += characters * 17 + 450;
    });

    hasTyped = true;
  }

  function resetTyping() {
    clearTyping();
    restoreOriginalContent();
    panel.classList.remove("is-typing");
    hasTyped = false;
  }

  // Esperar a que el panel se revele.
  const observer = new MutationObserver(() => {
    if (description.classList.contains("is-visible")) {
      if (!hasTyped) startTyping();
    } else if (hasTyped) {
      resetTyping();
    }
  });

  observer.observe(description, {
    attributes: true,
    attributeFilter: ["class"]
  });

  // Si el usuario cierra y abre, el texto vuelve a transcribirse.
  [logoButton, accessButton].forEach((button) => {
    if (!button) return;

    button.addEventListener("click", () => {
      if (!description.classList.contains("is-visible")) {
        resetTyping();
      }
    });
  });
})();

document.addEventListener("DOMContentLoaded", () => {
  const welcomeUser = document.getElementById("welcomeUser");
  const username = sessionStorage.getItem("hexroot_username");

  if (welcomeUser && username) {
    welcomeUser.textContent = ` // USER: ${username.toUpperCase()}`;
  }
});
