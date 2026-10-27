/* =========================================
   HEX ROOT — TRAILER INTERACTIVO
========================================= */


(() => {
  const section = document.querySelector("#trailer");
  if (!section || section.dataset.trailerInitialized === "true") return;

  section.dataset.trailerInitialized = "true";

  const canvas = section.querySelector("#trailer-three-canvas");
  const watchButton = section.querySelector("#trailer-watch-button");
  const playButton = section.querySelector("#trailer-play-button");
  const playNowButton = section.querySelector("#trailer-play-now");
  const modal = section.querySelector("#trailer-modal");
  const closeButton = section.querySelector("#trailer-modal-close");
  const video = section.querySelector("#trailer-video");

  /* ---------------------------------------
     ICONOS LUCIDE
  --------------------------------------- */

  function refreshIcons() {
    if (window.lucide?.createIcons) {
      window.lucide.createIcons();
    }
  }

  refreshIcons();


  /* ---------------------------------------
     MODAL DEL TRÁILER
  --------------------------------------- */

  let previousFocus = null;

  function openTrailer() {
    if (!modal || !video) return;

    previousFocus = document.activeElement;

    modal.classList.add("is-open");
    modal.removeAttribute("inert");
    modal.setAttribute("aria-hidden", "false");

    document.body.classList.add("trailer-modal-active");

    closeButton?.focus({ preventScroll: true });

    const playPromise = video.play();

    if (playPromise?.catch) {
      playPromise.catch(() => {
        // El usuario puede iniciar la reproducción manualmente.
      });
    }
  }

  function closeTrailer() {
    if (!modal || !video) return;

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    modal.setAttribute("inert", "");

    document.body.classList.remove("trailer-modal-active");

    video.pause();
    video.currentTime = 0;

    if (previousFocus && typeof previousFocus.focus === "function") {
      previousFocus.focus({ preventScroll: true });
    }
  }

  watchButton?.addEventListener("click", () => {
    openTrailer();
  });

  playButton?.addEventListener("click", () => {
    if (!video) {
      console.error("HEX ROOT: no se encontró #trailer-video");
      return;
    }

    if (video.paused) {
      video.play().catch(error => {
        console.error("No se pudo reproducir el tráiler:", error);
      });
    } else {
      video.pause();
    }
  });

  closeButton?.addEventListener("click", closeTrailer);

  modal?.addEventListener("click", (event) => {
    if (event.target === modal) closeTrailer();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal?.classList.contains("is-open")) {
      closeTrailer();
    }
  });

  /* ---------------------------------------
     BOTÓN JUGAR AHORA
  --------------------------------------- */

  playNowButton?.addEventListener("click", () => {
    const gameSection = document.querySelector(
      "#videojuego, #juego, [data-section='videojuego']"
    );

    if (gameSection) {
      const track = document.querySelector("#horizontal-track");

      if (track && track.contains(gameSection)) {
        track.scrollTo({
          left: gameSection.offsetLeft,
          behavior: "smooth"
        });
      } else {
        gameSection.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    } else {
      console.info(
        "HEX ROOT: asigna el selector de la sección del videojuego al botón JUGAR AHORA."
      );
    }
  });

  /* Cerrar y pausar el vídeo si se navega fuera del trailer */
  const sectionObserver = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting && modal?.classList.contains("is-open")) {
      closeTrailer();
    }
  }, { threshold: 0.01 });

  sectionObserver.observe(section);

})();


(() => {
  const canvas = document.getElementById("shape-grid-canvas");
  const section = document.getElementById("trailer");

  if (!canvas || !section) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const settings = {
    cellSize: 44,
    lineColor: "#0f7130",
    hoverColor: "#ec4899",
    hoverFillColor: "#b8006d",
    fillOpacity: 0.15,
    speed: 0.6,
    tiltX: 58,
    radius: 2,
    glow: 0.45
  };

  let width = 0;
  let height = 0;
  let dpr = 1;
  let mouse = { x: -1000, y: -1000 };
  let cells = [];
  let animationFrame = null;
  let lastTime = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();

    width = rect.width;
    height = rect.height;

    if (width <= 0 || height <= 0) return;

    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildGrid();
  }

  function buildGrid() {
    cells = [];

    const size = settings.cellSize;
    const spacingY = size * 0.68;
    const angle = settings.tiltX * Math.PI / 180;
    const skew = Math.cos(angle) * 0.55;

    const rows = Math.ceil(height / spacingY) + 8;
    const cols = Math.ceil(width / size) + 12;

    for (let row = -5; row < rows; row++) {
      for (let col = -6; col < cols; col++) {
        cells.push({
          x: col * size + row * size * skew,
          y: row * spacingY,
          size,
          intensity: 0,
          phase: Math.random() * Math.PI * 2
        });
      }
    }
  }

  function drawCell(cell, time) {
    const { x, y, size } = cell;
    const cx = x + size / 2;
    const cy = y + size / 2;

    const distance = Math.hypot(mouse.x - cx, mouse.y - cy);
    const influence = Math.max(0, 1 - distance / (size * 3.2));

    cell.intensity +=
      (influence - cell.intensity) *
      (influence > cell.intensity ? 0.25 : 0.045);

    const intensity = cell.intensity;
    const pulse =
      (Math.sin(time * 0.001 * settings.speed + cell.phase) + 1) / 2;

    ctx.save();

    ctx.strokeStyle = settings.lineColor;
    ctx.lineWidth = 0.8;
    ctx.globalAlpha = 0.3 + pulse * 0.13;

    ctx.strokeRect(
      x + settings.radius,
      y + settings.radius,
      size - settings.radius * 2,
      size - settings.radius * 2
    );

    if (intensity > 0.015) {
      ctx.shadowColor = settings.hoverColor;
      ctx.shadowBlur = 14 * intensity * settings.glow;
      ctx.fillStyle = settings.hoverFillColor;
      ctx.globalAlpha = intensity * settings.fillOpacity * 4;

      ctx.fillRect(
        x + settings.radius,
        y + settings.radius,
        size - settings.radius * 2,
        size - settings.radius * 2
      );

      ctx.shadowBlur = 0;
      ctx.strokeStyle = settings.hoverColor;
      ctx.globalAlpha = intensity * 0.95;
      ctx.lineWidth = 1.2;

      ctx.strokeRect(
        x + settings.radius,
        y + settings.radius,
        size - settings.radius * 2,
        size - settings.radius * 2
      );
    }

    ctx.restore();
  }

  function animate(time) {
    if (!width || !height) {
      animationFrame = requestAnimationFrame(animate);
      return;
    }

    lastTime = time;
    ctx.clearRect(0, 0, width, height);

    for (const cell of cells) {
      drawCell(cell, time);
    }

    animationFrame = requestAnimationFrame(animate);
  }

  function updateMouse(event) {
    const rect = canvas.getBoundingClientRect();

    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
  }

  section.addEventListener("pointermove", updateMouse);

  section.addEventListener("pointerleave", () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  window.addEventListener("resize", resize);

  resize();
  cancelAnimationFrame(animationFrame);
  animationFrame = requestAnimationFrame(animate);
})();


/* =========================================
   HEX ROOT — CONTROLES DEL VIDEO VISIBLE
========================================= */

(() => {
  const video = document.getElementById("trailer-inline-video");
  const playButton = document.getElementById("trailer-control-play");
  const currentTime = document.getElementById("trailer-current-time");
  const duration = document.getElementById("trailer-duration");
  const seek = document.getElementById("trailer-seek");
  const muteButton = document.getElementById("trailer-mute");
  const volume = document.getElementById("trailer-volume");
  const fullscreenButton = document.getElementById("trailer-fullscreen");
  const player = document.querySelector(".trailer-video-inner");

  if (!video || !playButton) return;

  // Formato de tiempo: 00:00
  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "00:00";

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  // Reproducir o pausar
  async function togglePlayback() {
    if (video.paused) {
      try {
        await video.play();
      } catch (error) {
        console.error("HEX ROOT: no se pudo reproducir el vídeo.", error);
      }
    } else {
      video.pause();
    }
  }

  playButton.addEventListener("click", togglePlayback);

  video.addEventListener("play", () => {
    playButton.textContent = "❚❚";
    playButton.setAttribute("aria-label", "Pausar vídeo");
  });

  video.addEventListener("pause", () => {
    playButton.textContent = "▶";
    playButton.setAttribute("aria-label", "Reproducir vídeo");
  });

  video.addEventListener("ended", () => {
    playButton.textContent = "▶";
    playButton.setAttribute("aria-label", "Reproducir vídeo");
  });

  // Duración del vídeo
  function updateDuration() {
    if (duration) duration.textContent = formatTime(video.duration);
  }

  video.addEventListener("loadedmetadata", updateDuration);
  video.addEventListener("durationchange", updateDuration);

  // Tiempo actual y barra de progreso
  video.addEventListener("timeupdate", () => {
    if (currentTime) {
      currentTime.textContent = formatTime(video.currentTime);
    }

    if (seek && Number.isFinite(video.duration) && video.duration > 0) {
      seek.value = (video.currentTime / video.duration) * 100;
    }
  });

  // Buscar una posición del vídeo
  seek?.addEventListener("input", () => {
    if (Number.isFinite(video.duration) && video.duration > 0) {
      video.currentTime = (Number(seek.value) / 100) * video.duration;
    }
  });

  // Volumen
  volume?.addEventListener("input", () => {
    video.volume = Number(volume.value);
    video.muted = video.volume === 0;

    if (muteButton) {
      muteButton.textContent = video.muted ? "MUTE" : "VOL";
    }
  });

  // Silenciar y restaurar sonido
  muteButton?.addEventListener("click", () => {
    video.muted = !video.muted;

    muteButton.textContent = video.muted ? "MUTE" : "VOL";

    if (volume && !video.muted && video.volume === 0) {
      video.volume = 1;
      volume.value = "1";
    }
  });

  // Pantalla completa
  fullscreenButton?.addEventListener("click", async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (player?.requestFullscreen) {
        await player.requestFullscreen();
      } else if (video.webkitEnterFullscreen) {
        video.webkitEnterFullscreen();
      }
    } catch (error) {
      console.error("HEX ROOT: no se pudo activar pantalla completa.", error);
    }
  });

  // Mostrar errores de carga del archivo
  video.addEventListener("error", () => {
    console.error(
      "HEX ROOT: error al cargar img/video/trailer.mp4",
      video.error
    );
  });
})();
