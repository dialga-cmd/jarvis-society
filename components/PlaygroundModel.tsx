"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

export function PlaygroundModel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current || undefined,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;

    const scene = new THREE.Scene();
    scene.background = null;

    // Direct lights so the metallic indigo material is clearly visible
    // (a 0.9-metallic surface is near-black under environment alone).
    scene.add(new THREE.AmbientLight(0x8898ff, 0.6));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(2.5, 3.5, 4);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0x7d8fff, 1.2);
    fillLight.position.set(-3, -1.5, 2.5);
    scene.add(fillLight);
    const rimLight = new THREE.DirectionalLight(0xffffff, 1.4);
    rimLight.position.set(0, 2, -4);
    scene.add(rimLight);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10000);

    // Environment map so the metallic material picks up its reflections.
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableRotate = true;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;

    let isDragging = false;
    let lastInteraction = performance.now();
    const pauseAutoRotate = () => {
      controls.autoRotate = false;
      lastInteraction = performance.now();
    };
    controls.addEventListener("start", () => {
      isDragging = true;
      pauseAutoRotate();
    });
    controls.addEventListener("end", () => {
      isDragging = false;
      lastInteraction = performance.now();
    });

    // Post-processing: soft bloom so the emissive indigo reads as a glow.
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(
        container.clientWidth || 1,
        container.clientHeight || 1
      ),
      0.85, // strength
      0.5, // radius
      0.35 // threshold
    );
    composer.addPass(bloom);

    const loader = new GLTFLoader();
    let model: THREE.Object3D | null = null;

    const fitCamera = () => {
      if (!model) return;
      const box = new THREE.Box3().setFromObject(model);
      if (box.isEmpty()) return;
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const fovY = (camera.fov * Math.PI) / 180;
      const dist = (maxDim / 2 / Math.tan(fovY / 2)) * 1.6;
      camera.near = Math.max(dist / 2000, 0.01);
      camera.far = dist * 40;
      controls.target.copy(center);
      camera.position.set(center.x, center.y, center.z + dist);
      camera.updateProjectionMatrix();
      // Preserve the corrected, authenticated orientation of the model.
      model.rotation.set(0, 0, 0);
      model.position.set(0, 0, 0);
    };

    loader.load(
      "/logo.glb",
      (gltf) => {
        model = gltf.scene;
        scene.add(model);
        // Guarantee a clearly visible indigo metallic material regardless of
        // what the GLB embeds (the embedded material can read near-black under
        // dim lighting). Keeps the design intent authentic and on-brand.
        model.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (!mesh.isMesh || !mesh.material) return;
          const mats = Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material];
          mats.forEach((mat) => {
            if (mat instanceof THREE.MeshStandardMaterial) {
              // Metallic indigo with a subtle luminous glow: sharp-enough
              // reflections to read as polished metal, and a soft emissive
              // indigo so the logo glows against the dark background.
              mat.color.set(0x3a48b8);
              mat.metalness = 0.85;
              mat.roughness = 0.22;
              mat.envMapIntensity = 1.35;
              mat.emissive.set(0x2b3dff);
              mat.emissiveIntensity = 0.55;
              mat.needsUpdate = true;
            }
          });
        });
        fitCamera();
        resize();
      },
      undefined,
      (err) => {
        console.error("Failed to load /logo.glb", err);
      }
    );

    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      composer.setSize(w, h);
      bloom.setSize(w, h);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    let active = true;
    let raf = 0;

    const loop = () => {
      if (!active) return;
      raf = requestAnimationFrame(loop);
      if (!isDragging && performance.now() - lastInteraction > 3000) {
        controls.autoRotate = true;
      }
      controls.update();
      composer.render();
    };
    loop();

    const io = new IntersectionObserver(
      (entries) => {
        active = entries[0]?.isIntersecting ?? true;
        if (!active) cancelAnimationFrame(raf);
        else {
          cancelAnimationFrame(raf);
          loop();
        }
      },
      { threshold: 0.01 }
    );
    io.observe(container);

    return () => {
      active = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      controls.dispose();
      pmrem.dispose();
      envTex.dispose();
      bloom.dispose();
      composer.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          const mats = Array.isArray(obj.material)
            ? obj.material
            : [obj.material];
          mats.forEach((m) => m.dispose());
        }
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full"
      style={{ touchAction: "none" }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
