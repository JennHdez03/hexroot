
/* =====================================
   HEX ROOT — CINEMATIC HORIZONTAL 3D
   Three.js r180
===================================== */

import * as THREE from
  "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

(() => {
  const experience = document.getElementById("tematica-experience");
  const track = document.getElementById("horizontal-track");
  const mount = document.getElementById("tematica-3d");
  const progressBar = document.getElementById("scroll-progress-bar");
  const hint = document.getElementById("scroll-hint");

  if (!experience || !track || !mount) return;

  // No ejecutar dos veces.
  if (experience.dataset.threeReady === "true") return;
  experience.dataset.threeReady = "true";

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#030303");
  scene.fog = new THREE.FogExp2("#030303", 0.025);

  const camera = new THREE.PerspectiveCamera(
    55,
    mount.clientWidth / mount.clientHeight,
    0.1,
    250
  );

  camera.position.set(0, 1.5, 12);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  mount.appendChild(renderer.domElement);

  // Iluminación verde y magenta.
  scene.add(new THREE.AmbientLight("#aab0bd", 0.7));

  const greenLight = new THREE.PointLight("#b8ff3c", 30, 45);
  greenLight.position.set(-5, 3, 3);
  scene.add(greenLight);

  const pinkLight = new THREE.PointLight("#ff36bc", 35, 45);
  pinkLight.position.set(5, -1, 4);
  scene.add(pinkLight);

  // Rejilla digital.
  const grid = new THREE.GridHelper(100, 100, "#b8ff3c", "#252b22");
  grid.position.y = -3;
  grid.material.transparent = true;
  grid.material.opacity = 0.35;
  scene.add(grid);

  // Partículas suspendidas en el espacio.
  const particleCount = 900;
  const particlePositions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3] = (Math.random() - 0.5) * 65;
    particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 22;
    particlePositions[i * 3 + 2] = -Math.random() * 35;
  }

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(particlePositions, 3)
  );

  const particleMaterial = new THREE.PointsMaterial({
    color: "#b8ff3c",
    size: 0.035,
    transparent: true,
    opacity: 0.75,
    depthWrite: false
  });

  const particles = new THREE.Points(
    particleGeometry,
    particleMaterial
  );
  scene.add(particles);

  

  // Posiciones de cámara por tramo del recorrido.
  // Valores relativos entre 0 y 1.
  const cameraStops = [
    { x: 0,  y: 1.2, z: 12, lookX: 0,  lookY: 0, zLook: 0 },
    { x: 5,  y: 0.5, z: 10, lookX: 7,  lookY: 0, zLook: 0 },
    { x: 13, y: 1.8, z: 8,  lookX: 15, lookY: 0, zLook: 0 },
    { x: 21, y: 0.2, z: 11, lookX: 23, lookY: 0, zLook: 0 },
    { x: 29, y: 1.4, z: 9,  lookX: 31, lookY: 0, zLook: 0 }
  ];

  const clamp = (value, min, max) =>
    Math.max(min, Math.min(max, value));

  const smoothstep = (value) => {
    const t = clamp(value, 0, 1);
    return t * t * (3 - 2 * t);
  };

  let targetProgress = 0;
  let currentProgress = 0;
  let animationFrame = 0;
  let pointerDown = false;
  let pointerStartX = 0;
  let scrollStart = 0;

  function getProgress() {
    const maxScroll = track.scrollWidth - track.clientWidth;

    return maxScroll > 0
      ? clamp(track.scrollLeft / maxScroll, 0, 1)
      : 0;
  }

  function updateProgress() {
    targetProgress = getProgress();

    if (progressBar) {
      progressBar.style.width = `${targetProgress * 100}%`;
    }

    if (hint) {
      hint.style.opacity = targetProgress > 0.94 ? "0" : "1";
    }
  }

 
 
  // =====================================
  // CONTROLES DEL RECORRIDO HORIZONTAL
  // =====================================

  function scrollByWheel(event) {
    if (event.ctrlKey) return;

    const maxScroll = track.scrollWidth - track.clientWidth;
    if (maxScroll <= 1) {
      console.warn("HEX ROOT: el recorrido no tiene ancho horizontal.", {
        scrollWidth: track.scrollWidth,
        clientWidth: track.clientWidth,
        children: track.children.length
      });
      return;
    }

    event.preventDefault();

    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ? event.deltaX
      : event.deltaY;

    track.scrollLeft = clamp(
      track.scrollLeft + delta,
      0,
      maxScroll
    );
  }

  experience.addEventListener("wheel", scrollByWheel, {
    passive: false
  });

  // Arrastre con ratón.
  let dragging = false;
  let startX = 0;
  let startScroll = 0;

  track.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;

    dragging = true;
    startX = event.clientX;
    startScroll = track.scrollLeft;
    track.style.cursor = "grabbing";
  });

  window.addEventListener("pointermove", (event) => {
    if (!dragging) return;

    track.scrollLeft = startScroll - (event.clientX - startX);
  });

  function stopDragging() {
    dragging = false;
    track.style.cursor = "grab";
  }

  window.addEventListener("pointerup", stopDragging);
  window.addEventListener("pointercancel", stopDragging);

  track.addEventListener("scroll", updateProgress, {
    passive: true
  });


  // Ajustar el renderer cuando cambia el tamaño.
  function resize() {
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    if (!width || !height) return;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(mount);

  // Interpolación suave de cámara.
  const lookTarget = new THREE.Vector3();

  function animate() {
  animationFrame = requestAnimationFrame(animate);

  currentProgress += (targetProgress - currentProgress) * 0.045;

  const scaled = currentProgress * (cameraStops.length - 1);
  const index = Math.min(
    Math.floor(scaled),
    cameraStops.length - 2
  );
  const localT = smoothstep(scaled - index);

  const from = cameraStops[index];
  const to = cameraStops[index + 1];

  camera.position.x = THREE.MathUtils.lerp(from.x, to.x, localT);
  camera.position.y = THREE.MathUtils.lerp(from.y, to.y, localT);
  camera.position.z = THREE.MathUtils.lerp(from.z, to.z, localT);

  lookTarget.set(
    THREE.MathUtils.lerp(from.lookX, to.lookX, localT),
    THREE.MathUtils.lerp(from.lookY, to.lookY, localT),
    THREE.MathUtils.lerp(from.zLook, to.zLook, localT)
  );

  camera.lookAt(lookTarget);

  // Movimiento sutil de partículas y cuadrícula.
  particles.rotation.y = currentProgress * 0.15;
  grid.position.x = currentProgress * -20;

  renderer.render(scene, camera);
}
  // Iniciar la animación 3D.
  updateProgress();
  resize();
  animate();

 
  // Limpieza si se retira el recorrido.
  window.addEventListener("pagehide", () => {
    cancelAnimationFrame(animationFrame);
    resizeObserver.disconnect();
    renderer.dispose();
    particleGeometry.dispose();
    particleMaterial.dispose();
    grid.geometry.dispose();
    grid.material.dispose();
  }, { once: true });
})();
