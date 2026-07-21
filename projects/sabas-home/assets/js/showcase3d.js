/* Sabaş Home, 3D material configurator (Three.js, ES module).
   A real PBR model (Khronos GlamVelvetSofa, CC0) lit by a Poly Haven HDRI (CC0),
   DRACO-compressed to ~410 KB. Drag to orbit; swatches recolour the velvet in real time.
   Specs and copy live in the DOM for SEO/accessibility. This is a REPRESENTATIVE
   visualisation, clearly labelled, not a specific Sabaş Home product.
   Lazy, DPR-capped, paused off-screen/hidden, skipped on reduced-motion or no WebGL. */
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const stage = document.getElementById("stage3d");
const loaderEl = document.getElementById("stage3d-loader");
const hintEl = document.getElementById("stage3d-hint");
const swatchWrap = document.getElementById("mat-list3");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch (e) { return false; }
}

if (!stage || reduce || !hasWebGL()) {
  if (loaderEl) loaderEl.hidden = true;
} else {
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => { if (entry.isIntersecting) { obs.disconnect(); start(); } });
  }, { threshold: 0.15 });
  io.observe(stage);
}

function start() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (e) { if (loaderEl) loaderEl.hidden = true; return; }

  const width = stage.clientWidth || 640;
  const height = stage.clientHeight || 480;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
  renderer.setSize(width, height);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.setAttribute("aria-hidden", "true");
  stage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 1.6;
  controls.maxDistance = 8;
  controls.minPolarAngle = Math.PI * 0.18;
  controls.maxPolarAngle = Math.PI * 0.52;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.9;
  controls.addEventListener("start", () => { controls.autoRotate = false; });

  const pmrem = new THREE.PMREMGenerator(renderer);
  const fabricMats = [];
  let running = false, ready = false;

  // failsafe: never leave the spinner up if something stalls
  const failsafe = setTimeout(() => { if (loaderEl && !ready) loaderEl.hidden = true; }, 18000);

  // Fill light so the piece never goes flat before the model/env resolve
  const key = new THREE.DirectionalLight(0xfff2e0, 1.1); key.position.set(4, 6, 4); scene.add(key);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x2a2018, 0.5));

  // 1) HDRI environment (natural reflections)
  new RGBELoader().load(stage.getAttribute("data-hdri"), (hdr) => {
    hdr.mapping = THREE.EquirectangularReflectionMapping;
    const env = pmrem.fromEquirectangular(hdr).texture;
    scene.environment = env;
    hdr.dispose(); pmrem.dispose();
    console.log("[3d] hdri ready");
  }, undefined, (e) => console.warn("[3d] hdri error", e && e.message));

  // 2) DRACO-compressed PBR model
  const draco = new DRACOLoader();
  draco.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");
  const gltf = new GLTFLoader();
  gltf.setDRACOLoader(draco);
  gltf.load(stage.getAttribute("data-model"), (res) => {
    const model = res.scene;
    model.traverse((node) => {
      if (!node.isMesh || !node.material) return;
      node.castShadow = node.receiveShadow = false;
      const mats = Array.isArray(node.material) ? node.material : [node.material];
      mats.forEach((mat) => {
        if (mat.metalness !== undefined && mat.metalness < 0.4 && mat.color) {
          mat.envMapIntensity = 1.1;
          fabricMats.push(mat);
        } else if (mat.metalness >= 0.4) {
          mat.envMapIntensity = 1.4; // gold legs pop
        }
      });
    });

    // frame the model
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);
    const radius = Math.max(size.x, size.y, size.z) * 0.5;
    const dist = radius / Math.sin((camera.fov * Math.PI) / 180 / 2);
    camera.position.set(dist * 0.75, radius * 0.35, dist * 0.95);
    controls.target.set(0, -radius * 0.06, 0);
    controls.update();

    scene.add(model);
    applyColor("8a5a34");
    ready = true;
    clearTimeout(failsafe);
    if (loaderEl) loaderEl.hidden = true;
    if (hintEl) hintEl.hidden = false;
    stage.classList.add("live");
  }, undefined, (e) => { if (loaderEl) loaderEl.hidden = true; console.warn("[3d] model error", e && e.message); });

  // 3) Swatches recolour the velvet
  function applyColor(hex) {
    const col = new THREE.Color("#" + hex);
    fabricMats.forEach((mat) => {
      mat.color.copy(col);
      if (mat.sheenColor) mat.sheenColor.copy(col).offsetHSL(0, -0.1, 0.28);
      mat.needsUpdate = true;
    });
  }
  if (swatchWrap) {
    swatchWrap.querySelectorAll(".mat-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        swatchWrap.querySelectorAll(".mat-chip").forEach((c) => c.setAttribute("aria-pressed", "false"));
        chip.setAttribute("aria-pressed", "true");
        applyColor(chip.getAttribute("data-color"));
      });
    });
  }

  // resize
  const ro = new ResizeObserver(() => {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h);
  });
  ro.observe(stage);

  // render loop (paused off-screen / hidden)
  function tick() { controls.update(); renderer.render(scene, camera); }
  function play() { if (!running) { running = true; renderer.setAnimationLoop(tick); } }
  function pause() { running = false; renderer.setAnimationLoop(null); }
  play();

  document.addEventListener("visibilitychange", () => { document.hidden ? pause() : play(); });
  const viz = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { entry.isIntersecting ? play() : pause(); });
  }, { threshold: 0.02 });
  viz.observe(stage);
}
