import { useEffect, useRef, useState } from "react";
import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import * as THREE from "../../sun-earth/vendor/three-runtime.js";
import { OrbitControls } from "../../sun-earth/vendor/three-runtime.js";
import moonTextureUrl from "../../sun-earth/assets/moon.webp";
import type { LandingSite } from "../../../types/helios";

export type SiteAssessment = {
  category: "eligible" | "disqualified" | "insufficient_data";
  rank: number | null;
  score: number | null;
};

interface HeliosLunarSceneProps {
  sites: LandingSite[];
  selectedSiteId: string | null;
  assessments: Map<string, SiteAssessment>;
  onSelectSite: (siteId: string) => void;
  onHoverSite: (site: LandingSite | null) => void;
  onUnavailable?: () => void;
}

interface Marker {
  site: LandingSite;
  halo: THREE.Mesh;
  core: THREE.Mesh;
  surface: THREE.Vector3;
}

interface SceneHandle {
  render: () => void;
  reset: () => void;
  zoom: (delta: number) => void;
  spin: (enabled: boolean) => void;
  layers: (sites: boolean, assessment: boolean) => void;
  sync: (selectedSiteId: string | null, assessments: Map<string, SiteAssessment>) => void;
  dispose: () => void;
}

const COLORS = {
  neutral: 0x9db3c1,
  eligible: 0x70d9c4,
  disqualified: 0xe48a80,
  insufficient: 0xe8bd78,
  selected: 0xd8f2fa,
};

function surfacePosition(site: LandingSite): THREE.Vector3 {
  const latitude = site.latitude_deg * Math.PI / 180;
  const longitude = site.longitude_deg * Math.PI / 180;
  return new THREE.Vector3(
    -Math.cos(latitude) * Math.cos(longitude),
    Math.sin(latitude),
    Math.cos(latitude) * Math.sin(longitude),
  );
}

function assessmentColor(assessment: SiteAssessment | undefined): number {
  if (!assessment) return COLORS.neutral;
  if (assessment.category === "eligible") return COLORS.eligible;
  if (assessment.category === "disqualified") return COLORS.disqualified;
  return COLORS.insufficient;
}

function createScene(host: HTMLDivElement, props: HeliosLunarSceneProps): SceneHandle {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  });
  renderer.setClearColor(0x04070c, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.domElement.setAttribute("aria-hidden", "true");
  renderer.domElement.style.touchAction = "none";
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-2.9, 2.9, 2.1, -2.1, 0.1, 80);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.075;
  controls.minZoom = 0.78;
  controls.maxZoom = 2.75;
  controls.rotateSpeed = 0.48;
  controls.target.set(0, -0.6, 0);

  const starPositions = new Float32Array(1250 * 3);
  for (let i = 0; i < 1250; i += 1) {
    const longitude = i * 2.399963;
    const y = 1 - 2 * (i + 0.5) / 1250;
    const radius = Math.sqrt(1 - y * y) * 36;
    starPositions.set([radius * Math.cos(longitude), y * 36, radius * Math.sin(longitude)], i * 3);
  }
  const starsGeometry = new THREE.BufferGeometry();
  starsGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  const stars = new THREE.Points(
    starsGeometry,
    new THREE.PointsMaterial({ color: 0xa8c7d9, size: 1.1, sizeAttenuation: false, transparent: true, opacity: 0.52 }),
  );
  scene.add(stars);

  const moonGeometry = new THREE.SphereGeometry(1.55, 96, 72);
  const moonTexture = new THREE.TextureLoader().load(moonTextureUrl, () => render());
  moonTexture.colorSpace = THREE.SRGBColorSpace;
  moonTexture.anisotropy = 8;
  const moonMaterial = new THREE.MeshStandardMaterial({
    color: 0xf5f2ec,
    map: moonTexture,
    bumpMap: moonTexture,
    bumpScale: 0.035,
    roughness: 1,
    metalness: 0,
  });
  const moon = new THREE.Mesh(moonGeometry, moonMaterial);
  moon.receiveShadow = true;
  scene.add(moon);

  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.62, 72, 56),
    new THREE.MeshBasicMaterial({
      color: 0x6ba4ba,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.075,
      depthWrite: false,
    }),
  );
  scene.add(atmosphere);

  const keyLight = new THREE.DirectionalLight(0xffe7c7, 2.35);
  keyLight.position.set(-3.6, 2.9, 4.2);
  scene.add(keyLight, new THREE.AmbientLight(0x8290a1, 0.48));

  const orbitPositions = new Float32Array(145 * 3);
  for (let i = 0; i < 145; i += 1) {
    const angle = i / 144 * Math.PI * 2;
    orbitPositions.set([2.03 * Math.cos(angle), 0.18 * Math.sin(angle), 2.03 * Math.sin(angle)], i * 3);
  }
  const orbitGeometry = new THREE.BufferGeometry();
  orbitGeometry.setAttribute("position", new THREE.BufferAttribute(orbitPositions, 3));
  const orbitalPath = new THREE.Line(
    orbitGeometry,
    new THREE.LineBasicMaterial({ color: 0x89b7c9, transparent: true, opacity: 0.28 }),
  );
  scene.add(orbitalPath);

  const markerGeometry = new THREE.SphereGeometry(0.026, 14, 10);
  const haloGeometry = new THREE.SphereGeometry(0.067, 14, 10);
  const markers: Marker[] = props.sites.map((site) => {
    const haloMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.26, depthWrite: false });
    const coreMaterial = new THREE.MeshBasicMaterial({ color: COLORS.neutral, toneMapped: false });
    const halo = new THREE.Mesh(haloGeometry, haloMaterial);
    const core = new THREE.Mesh(markerGeometry, coreMaterial);
    const surface = surfacePosition(site);
    scene.add(halo, core);
    return { site, halo, core, surface };
  });

  const initialCamera = new THREE.Vector3(0, -3.25, 4.65);
  const initialTarget = new THREE.Vector3(0, -0.66, 0);
  camera.position.copy(initialCamera);
  controls.target.copy(initialTarget);
  camera.lookAt(initialTarget);
  controls.update();

  let disposed = false;
  let inView = false;
  let animationFrame = 0;
  let previousTime = 0;
  let settleUntil = 0;
  let moonAngle = 0;
  let layerSites = true;
  let layerAssessment = true;
  const callbacks = { onSelectSite: props.onSelectSite, onHoverSite: props.onHoverSite };
  let selectedId = props.selectedSiteId;
  let assessments = props.assessments;
  let hoverId: string | null = null;
  const pointerStart = { x: 0, y: 0 };

  function updateMarkerPositions() {
    const cosine = Math.cos(moonAngle);
    const sine = Math.sin(moonAngle);
    const cameraDirection = camera.position.clone().sub(controls.target).normalize();
    for (const marker of markers) {
      const x = marker.surface.x * cosine + marker.surface.z * sine;
      const z = marker.surface.z * cosine - marker.surface.x * sine;
      const normal = new THREE.Vector3(x, marker.surface.y, z);
      const position = normal.clone().multiplyScalar(1.565);
      marker.core.position.copy(position);
      marker.halo.position.copy(position);
      marker.core.visible = layerSites && normal.dot(cameraDirection) > 0.01;
      marker.halo.visible = marker.core.visible;

      const assessment = assessments.get(marker.site.site_id);
      const color = marker.site.site_id === selectedId
        ? COLORS.selected
        : layerAssessment ? assessmentColor(assessment) : COLORS.neutral;
      (marker.core.material as THREE.MeshBasicMaterial).color.setHex(color);
      (marker.halo.material as THREE.MeshBasicMaterial).color.setHex(color);
      (marker.halo.material as THREE.MeshBasicMaterial).opacity = marker.site.site_id === selectedId ? 0.55 : 0.23;
    }
  }

  function render() {
    if (disposed || !inView) return;
    updateMarkerPositions();
    renderer.render(scene, camera);
  }

  const animate = (time: number) => {
    if (disposed || !inView || (!autoSpin.current && time > settleUntil)) {
      animationFrame = 0;
      return;
    }
    const elapsed = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 0;
    previousTime = time;
    if (autoSpin.current) moonAngle += elapsed * 0.035;
    controls.update();
    render();
    animationFrame = window.requestAnimationFrame(animate);
  };
  const autoSpin = { current: false };

  const resize = new ResizeObserver(() => {
    const width = host.clientWidth;
    const height = host.clientHeight;
    if (!width || !height) return;
    const aspect = width / height;
    const halfHeight = 2.05;
    camera.left = -halfHeight * aspect;
    camera.right = halfHeight * aspect;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    render();
  });
  resize.observe(host);

  const observer = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    if (inView) {
      previousTime = 0;
      if (autoSpin.current || performance.now() < settleUntil) {
        cancelAnimationFrame(animationFrame);
        animationFrame = requestAnimationFrame(animate);
      } else {
        render();
      }
    } else {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }
  }, { threshold: 0.05 });
  observer.observe(host);

  const onControlChange = () => {
    if (!autoSpin.current && inView) {
      settleUntil = performance.now() + 160;
      if (!animationFrame) animationFrame = requestAnimationFrame(animate);
    }
    render();
  };
  const onControlStart = () => {
    if (!autoSpin.current && inView) {
      settleUntil = performance.now() + 1200;
      if (!animationFrame) animationFrame = requestAnimationFrame(animate);
    }
  };
  controls.addEventListener("change", onControlChange);
  controls.addEventListener("start", onControlStart);

  function nearestMarker(event: PointerEvent): Marker | null {
    const bounds = renderer.domElement.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    const y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    let nearest: Marker | null = null;
    let nearestDistance = 0.075;
    for (const marker of markers) {
      if (!marker.core.visible) continue;
      const projected = marker.core.position.clone().project(camera);
      const distance = Math.hypot(projected.x - x, projected.y - y);
      if (projected.z < 1 && distance < nearestDistance) {
        nearestDistance = distance;
        nearest = marker;
      }
    }
    return nearest;
  }

  const onPointerMove = (event: PointerEvent) => {
    const marker = nearestMarker(event);
    const nextHoverId = marker?.site.site_id ?? null;
    if (nextHoverId !== hoverId) {
      hoverId = nextHoverId;
      callbacks.onHoverSite(marker?.site ?? null);
      renderer.domElement.style.cursor = marker ? "pointer" : "grab";
    }
  };
  const onPointerDown = (event: PointerEvent) => {
    pointerStart.x = event.clientX;
    pointerStart.y = event.clientY;
  };
  const onPointerUp = (event: PointerEvent) => {
    if (Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 5) return;
    const marker = nearestMarker(event);
    if (marker) callbacks.onSelectSite(marker.site.site_id);
  };
  const onPointerLeave = () => {
    if (hoverId) callbacks.onHoverSite(null);
    hoverId = null;
  };
  const onContextLost = (event: Event) => {
    event.preventDefault();
    callbacks.onHoverSite(null);
    props.onUnavailable?.();
  };
  renderer.domElement.addEventListener("pointermove", onPointerMove);
  renderer.domElement.addEventListener("pointerdown", onPointerDown);
  renderer.domElement.addEventListener("pointerup", onPointerUp);
  renderer.domElement.addEventListener("pointerleave", onPointerLeave);
  renderer.domElement.addEventListener("webglcontextlost", onContextLost);

  return {
    render,
    reset() {
      moonAngle = 0;
      camera.position.copy(initialCamera);
      controls.target.copy(initialTarget);
      camera.zoom = 1;
      camera.updateProjectionMatrix();
      controls.update();
      render();
    },
    zoom(delta) {
      camera.zoom = Math.min(controls.maxZoom, Math.max(controls.minZoom, camera.zoom + delta));
      camera.updateProjectionMatrix();
      render();
    },
    spin(enabled) {
      autoSpin.current = enabled;
      if (enabled && inView && !animationFrame) animationFrame = requestAnimationFrame(animate);
      if (!enabled) {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
      render();
    },
    layers(sitesVisible, assessmentVisible) {
      layerSites = sitesVisible;
      layerAssessment = assessmentVisible;
      render();
    },
    sync(nextSelectedId, nextAssessments) {
      selectedId = nextSelectedId;
      assessments = nextAssessments;
      render();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(animationFrame);
      resize.disconnect();
      observer.disconnect();
      controls.removeEventListener("change", onControlChange);
      controls.removeEventListener("start", onControlStart);
      controls.dispose();
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointerleave", onPointerLeave);
      renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points) {
          object.geometry.dispose();
          const material = object.material;
          (Array.isArray(material) ? material : [material]).forEach((item) => item.dispose());
        }
      });
      moonTexture.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}

export default function HeliosLunarScene(props: HeliosLunarSceneProps) {
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<SceneHandle | null>(null);
  const latest = useRef(props);
  const [unavailable, setUnavailable] = useState(false);
  const [hovered, setHovered] = useState<LandingSite | null>(null);
  const [showSites, setShowSites] = useState(true);
  const [showAssessment, setShowAssessment] = useState(true);
  const [autoSpin, setAutoSpin] = useState(false);
  const reducedMotion = useRef(false);

  latest.current = props;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotion.current = media.matches;
    setAutoSpin(!media.matches);
    const updateMotion = (event: MediaQueryListEvent) => {
      reducedMotion.current = event.matches;
      setAutoSpin(!event.matches);
    };
    media.addEventListener("change", updateMotion);
    return () => media.removeEventListener("change", updateMotion);
  }, []);

  useEffect(() => {
    if (!host.current) return;
    let viewport: SceneHandle;
    try {
      viewport = createScene(host.current, {
        ...latest.current,
        onSelectSite: (siteId) => latest.current.onSelectSite(siteId),
        onUnavailable: () => setUnavailable(true),
        onHoverSite: (site) => {
          setHovered(site);
          latest.current.onHoverSite(site);
        },
      });
      scene.current = viewport;
      viewport.spin(autoSpin);
    } catch {
      setUnavailable(true);
      return;
    }
    return () => {
      viewport.dispose();
      scene.current = null;
    };
  }, [props.sites]);

  useEffect(() => {
    scene.current?.spin(autoSpin && !reducedMotion.current);
  }, [autoSpin]);

  useEffect(() => {
    scene.current?.sync(props.selectedSiteId, props.assessments);
  }, [props.selectedSiteId, props.assessments, showSites, showAssessment]);

  useEffect(() => {
    if (unavailable) {
      scene.current?.dispose();
      scene.current = null;
    }
  }, [unavailable]);

  useEffect(() => {
    scene.current?.layers(showSites, showAssessment);
  }, [showSites, showAssessment]);

  return (
    <div className="helios-lunar-view" aria-label="Interactive lunar landing-site visualization">
      <div className="helios-lunar-view__frame">
        <div className="helios-lunar-view__grid" aria-hidden="true" />
        {unavailable ? (
          <div className="helios-lunar-fallback" role="status">
            <img src={moonTextureUrl} alt="Detailed lunar surface map" />
            <div>
              <span className="helios-eyebrow">VISUALIZER OFFLINE</span>
              <p>3D rendering is unavailable in this browser. Candidate sites remain selectable below.</p>
            </div>
          </div>
        ) : (
          <div ref={host} className="helios-lunar-canvas" role="img" aria-label="Rotatable 3D Moon with candidate landing-site markers" />
        )}
        <div className="helios-lunar-view__topline">
          <span><i className="helios-live-dot" /> LUNAR SOUTH POLAR REGION</span>
          <span>ORBITAL VIEW · NOT TO SCALE</span>
        </div>
        <div className="helios-lunar-view__coordinates" aria-live="polite">
          {hovered ? (
            <><strong>{hovered.name}</strong><span>{hovered.latitude_deg.toFixed(3)}° / {hovered.longitude_deg.toFixed(3)}°</span></>
          ) : (
            <><strong>Site reconnaissance</strong><span>Drag to rotate · scroll or pinch to zoom · select a marker</span></>
          )}
        </div>
        {!unavailable && (
          <div className="helios-lunar-controls" aria-label="Moon visualization controls">
            <button type="button" aria-label="Zoom in" title="Zoom in" onClick={() => scene.current?.zoom(0.18)}><ZoomIn size={15} /></button>
            <button type="button" aria-label="Zoom out" title="Zoom out" onClick={() => scene.current?.zoom(-0.18)}><ZoomOut size={15} /></button>
            <button type="button" aria-label="Reset Moon view" title="Reset view" onClick={() => scene.current?.reset()}><RotateCcw size={14} /></button>
            <button type="button" aria-pressed={autoSpin} onClick={() => setAutoSpin((value) => !value)}>
              {autoSpin ? "ROTATION ON" : "ROTATION OFF"}
            </button>
          </div>
        )}
      </div>
      <div className="helios-layer-controls" aria-label="Visualization layers">
        <button type="button" aria-pressed={showSites} onClick={() => setShowSites((value) => !value)}>
          <span className="helios-layer-dot helios-layer-dot--site" /> Candidate sites
        </button>
        <button type="button" aria-pressed={showAssessment} onClick={() => setShowAssessment((value) => !value)}>
          <span className="helios-layer-dot helios-layer-dot--assessment" /> Assessment state
        </button>
        <span className="helios-layer-note">Assessment colors appear after a HELIOS evaluation.</span>
      </div>
    </div>
  );
}
