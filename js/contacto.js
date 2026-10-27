
(() => {
  const stage = document.getElementById("electricLogoStage");
  const canvas = document.getElementById("electricCanvas");
  const logo = document.getElementById("contactLogo");

  if (!stage || !canvas || !logo) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const CONFIG = {
    color: "#32ff00",
    glowColor: "#862988",
    strands: 3,
    speed: 1.65,
    crackle: 1.35,
    arcs: 0.65,
    intensity: 0.3,
    glow: 0.9,
    thickness: 1.1,
    flicker: 0.6,
    cursorRadius: 110,
    cursorIntensity: 1.25
  };

  let w = 0;
  let h = 0;
  let dpr = 1;
  let raf = 0;
  let lastTime = 0;
  let elapsed = 0;
  let edgePoints = [];
  let bolts = [];
  let imageReady = false;

  const pointer = { x: -9999, y: -9999, active: false };

  const random = (a, b) => Math.random() * (b - a) + a;

  function resize() {
    const rect = stage.getBoundingClientRect();

    w = rect.width;
    h = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (imageReady) buildSilhouette();
  }

  function buildSilhouette() {
    if (!logo.naturalWidth || !logo.naturalHeight) return;

    const bounds = logo.getBoundingClientRect();
    const stageBounds = stage.getBoundingClientRect();

    const boxW = bounds.width;
    const boxH = bounds.height;

    // Reproduce object-fit: contain.
    const scale = Math.min(
      boxW / logo.naturalWidth,
      boxH / logo.naturalHeight
    );

    const imageW = logo.naturalWidth * scale;
    const imageH = logo.naturalHeight * scale;

    const offsetX = bounds.left - stageBounds.left + (boxW - imageW) / 2;
    const offsetY = bounds.top - stageBounds.top + (boxH - imageH) / 2;

    const sampleCanvas = document.createElement("canvas");
    const sampleCtx = sampleCanvas.getContext("2d", {
      willReadFrequently: true
    });

    if (!sampleCtx) return;

    // Reduced resolution makes edge detection faster.
    const maxSize = 240;
    const sampleScale = Math.min(
      1,
      maxSize / Math.max(logo.naturalWidth, logo.naturalHeight)
    );

    const sw = Math.max(1, Math.round(logo.naturalWidth * sampleScale));
    const sh = Math.max(1, Math.round(logo.naturalHeight * sampleScale));

    sampleCanvas.width = sw;
    sampleCanvas.height = sh;

    sampleCtx.drawImage(logo, 0, 0, sw, sh);

    const pixels = sampleCtx.getImageData(0, 0, sw, sh).data;
    const alphaAt = (x, y) => {
      if (x < 0 || y < 0 || x >= sw || y >= sh) return 0;
      return pixels[(y * sw + x) * 4 + 3];
    };

    edgePoints = [];

    // Find transparent-to-visible boundaries of the logo.
    for (let y = 2; y < sh - 2; y += 1) {
      for (let x = 2; x < sw - 2; x += 1) {
        if (alphaAt(x, y) < 100) continue;

        const nearTransparent =
          alphaAt(x - 1, y) < 80 ||
          alphaAt(x + 1, y) < 80 ||
          alphaAt(x, y - 1) < 80 ||
          alphaAt(x, y + 1) < 80;

        if (!nearTransparent) continue;

        edgePoints.push({
          x: offsetX + (x / sw) * imageW,
          y: offsetY + (y / sh) * imageH
        });
      }
    }
  }

  function makeBolt(origin) {
    const angle = random(0, Math.PI * 2);
    const length = random(12, 45) * CONFIG.crackle;

    const points = [{ x: origin.x, y: origin.y }];
    const steps = Math.floor(random(4, 9));

    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const jitter = random(-12, 12) * (1 - t * 0.35);

      points.push({
        x: origin.x + Math.cos(angle) * length * t
          + Math.cos(angle + Math.PI / 2) * jitter,
        y: origin.y + Math.sin(angle) * length * t
          + Math.sin(angle + Math.PI / 2) * jitter
      });
    }

    bolts.push({
      points,
      life: 1,
      color: Math.random() > 0.3
        ? CONFIG.color
        : CONFIG.glowColor,
      width: random(0.6, 1.4) * CONFIG.thickness
    });

    if (bolts.length > 90) bolts.shift();
  }

  function drawBolt(bolt) {
    ctx.save();
    ctx.globalAlpha = bolt.life;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(bolt.points[0].x, bolt.points[0].y);

    for (let i = 1; i < bolt.points.length; i++) {
      ctx.lineTo(bolt.points[i].x, bolt.points[i].y);
    }

    ctx.strokeStyle = bolt.color;
    ctx.lineWidth = bolt.width * 4;
    ctx.shadowColor = bolt.color;
    ctx.shadowBlur = 14 * CONFIG.glow;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(bolt.points[0].x, bolt.points[0].y);

    for (let i = 1; i < bolt.points.length; i++) {
      ctx.lineTo(bolt.points[i].x, bolt.points[i].y);
    }

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = Math.max(0.4, bolt.width * 0.45);
    ctx.shadowBlur = 4;
    ctx.stroke();

    ctx.restore();
  }

  function spawnFromSilhouette() {
    if (!edgePoints.length) return;

    const amount = Math.ceil(CONFIG.strands * CONFIG.arcs);

    for (let i = 0; i < amount; i++) {
      const point = edgePoints[
        Math.floor(Math.random() * edgePoints.length)
      ];

      makeBolt(point);
    }
  }

  function animate(now) {
    raf = requestAnimationFrame(animate);

    const dt = lastTime
      ? Math.min((now - lastTime) / 1000, 0.04)
      : 0;

    lastTime = now;
    elapsed += dt;

    ctx.clearRect(0, 0, w, h);

    if (document.hidden) return;

    const flickerChance = CONFIG.flicker * dt * 9;

    if (Math.random() < flickerChance) {
      spawnFromSilhouette();
    }

    if (pointer.active && edgePoints.length) {
      const radius = CONFIG.cursorRadius;

      const nearby = edgePoints.filter(point => {
        const dx = point.x - pointer.x;
        const dy = point.y - pointer.y;
        return dx * dx + dy * dy < radius * radius;
      });

      if (nearby.length && Math.random() < dt * 18 * CONFIG.cursorIntensity) {
        const origin = nearby[Math.floor(Math.random() * nearby.length)];
        makeBolt(origin);
      }
    }

    for (let i = bolts.length - 1; i >= 0; i--) {
      const bolt = bolts[i];

      bolt.life -= dt * CONFIG.speed * 2.8;

      if (bolt.life <= 0) {
        bolts.splice(i, 1);
        continue;
      }

      drawBolt(bolt);
    }
  }

  stage.addEventListener("pointermove", event => {
    const rect = stage.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
    pointer.active = true;
  });

  stage.addEventListener("pointerleave", () => {
    pointer.active = false;
  });

  logo.addEventListener("load", () => {
    imageReady = true;
    resize();
  });

  if (logo.complete && logo.naturalWidth > 0) {
    imageReady = true;
  }

  const observer = new ResizeObserver(resize);
  observer.observe(stage);
  observer.observe(logo);

  resize();
  animate(performance.now());

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) lastTime = 0;
  });

  window.addEventListener("pagehide", () => {
    cancelAnimationFrame(raf);
    observer.disconnect();
  }, { once: true });
})();


/* ==========================================
   HEX ROOT — TEAM INTERACTIVE PANELS
   Integrado en contacto.js
========================================== */

(() => {
  const cards = document.querySelectorAll(".team-card");

  if (!cards.length) return;

  const timers = new WeakMap();

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  function stopTyping(element) {
    const timer = timers.get(element);

    if (timer) {
      clearTimeout(timer);
      timers.delete(element);
    }

    element.classList.remove("is-typing");
  }

  function typeText(element) {
    stopTyping(element);

    const text = element.dataset.text || "";
    element.textContent = "";

    if (reducedMotion.matches) {
      element.textContent = text;
      return;
    }

    element.classList.add("is-typing");

    let index = 0;

    function writeCharacter() {
      if (!element.isConnected) {
        stopTyping(element);
        return;
      }

      if (index >= text.length) {
        element.classList.remove("is-typing");
        timers.delete(element);
        return;
              }

      const character = text.charAt(index);
      element.textContent += character;
      index++;

      const delay = character === "\n" ? 66 : 22;

      timers.set(
        element,
        setTimeout(writeCharacter, delay)
      );
    }

    writeCharacter();
  }

  function closeCard(card) {
    const trigger = card.querySelector(".team-image-trigger");
    const panel = card.querySelector(".team-terminal");
    const text = card.querySelector(".terminal-typed");

    card.classList.remove("is-active");

    if (trigger) {
      trigger.setAttribute("aria-expanded", "false");
    }

    if (panel) {
      panel.hidden = true;
    }

    if (text) {
      stopTyping(text);
      text.textContent = "";
    }
  }

  function toggleCard(card) {
    const panel = card.querySelector(".team-terminal");
    const trigger = card.querySelector(".team-image-trigger");
    const text = card.querySelector(".terminal-typed");

    if (!panel || !trigger || !text) return;

    const isOpen = !panel.hidden;

    cards.forEach(otherCard => {
      if (otherCard !== card) {
        closeCard(otherCard);
      }
    });

    if (isOpen) {
      closeCard(card);
      return;
    }

    card.classList.add("is-active");
    panel.hidden = false;
    trigger.setAttribute("aria-expanded", "true");

    typeText(text);
  }

  cards.forEach(card => {
    const trigger = card.querySelector(".team-image-trigger");

    if (!trigger || trigger.dataset.panelReady === "true") return;

    trigger.dataset.panelReady = "true";

    trigger.addEventListener("click", () => {
      toggleCard(card);
    });

    trigger.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleCard(card);
      }
    });
  });
})();