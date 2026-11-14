import * as THREE from "../vendor/three-runtime.js";
import { OrbitControls } from "../vendor/three-runtime.js";
import { Body, GeoMoon, GeoVector, KM_PER_AU } from "../vendor/astronomy-runtime.js";
import earthMap from "../assets/earth.webp";
import moonLrocMap from "../assets/moon-lroc-2k.webp";
import moonLolaLdem from "../assets/moon-lola-ldem.webp";
import moonSpoleWac from "../assets/moon-spole-wac.webp";
import sunMap from "../assets/sun.webp";
import type { EphemerisPoint, LandingSite } from "../../../types/helios";

export type SceneFrame =
  | { mode: "eclipse"; time: number }
  | {
      mode: "site";
      point?: EphemerisPoint;
      latitude: number;
      longitude: number;
      sites?: LandingSite[];
      selectedSiteId?: string;
      focusSeq?: number;
    };

export interface SpaceSceneCallbacks {
  onSelectSite?: (site: LandingSite) => void;
  onZoomChange?: (zoom: number) => void;
}

const degrees = Math.PI / 180;
const earthRadiusKm = 6378.1;
const sunRadiusKm = 695700;
const earthRadius = 1.34;
const moonRadius = earthRadius * 1737.4 / earthRadiusKm;
const sunPosition = new THREE.Vector3(-6, 0, 0);
const sphere = () => new THREE.SphereGeometry(1, 56, 36);

// Major South Polar craters & massifs (lat°, lon°, angular radius°, depth/height) for 3D relief
const LUNAR_RELIEF_FEATURES: Array<[number, number, number, number]> = [
  [-89.9, 0.0, 0.65, -0.022],     // Shackleton Crater
  [-88.1, 44.9, 1.35, -0.018],    // Shoemaker Crater
  [-87.3, 77.0, 1.15, -0.016],    // Faustini Crater
  [-87.5, -5.2, 1.45, -0.017],    // Haworth Crater
  [-84.9, -35.5, 1.8, -0.019],    // Cabeus Crater
  [-86.0, 0.0, 0.9, 0.014],       // Malapert Massif / Ridge
  [-89.4, -135.0, 0.75, 0.013],   // Connecting Ridge
  [-84.6, 31.0, 1.1, 0.015],      // Mons Mouton
  [-85.2, 53.5, 1.0, 0.012],      // Nobile Rim
];

// Named places across the Moon (Global Maria, Craters, Basins & South Polar Landmarks)
const LUNAR_NAMED_PLACES: Array<{
  name: string;
  lat: number;
  lon: number;
  category: "mare" | "crater" | "polar";
  minZoom: number;
}> = [
  { name: "Mare Imbrium", lat: 32.8, lon: -15.6, category: "mare", minZoom: 0.65 },
  { name: "Mare Serenitatis", lat: 28.0, lon: 17.5, category: "mare", minZoom: 0.65 },
  { name: "Mare Tranquillitatis", lat: 8.5, lon: 31.4, category: "mare", minZoom: 0.65 },
  { name: "Oceanus Procellarum", lat: 18.4, lon: -57.4, category: "mare", minZoom: 0.65 },
  { name: "Mare Crisium", lat: 17.0, lon: 59.1, category: "mare", minZoom: 0.8 },
  { name: "Mare Orientale", lat: -19.4, lon: -92.8, category: "mare", minZoom: 0.8 },
  { name: "South Pole–Aitken Basin", lat: -53.0, lon: -169.0, category: "mare", minZoom: 0.65 },
  { name: "Tycho Crater", lat: -43.3, lon: -11.2, category: "crater", minZoom: 0.75 },
  { name: "Copernicus Crater", lat: 9.6, lon: -20.1, category: "crater", minZoom: 0.75 },
  { name: "Plato Crater", lat: 51.6, lon: -9.3, category: "crater", minZoom: 0.9 },
  { name: "Cabeus Crater", lat: -84.9, lon: -35.5, category: "polar", minZoom: 1.5 },
  { name: "Shoemaker Crater", lat: -88.1, lon: 44.9, category: "polar", minZoom: 1.8 },
  { name: "Faustini Crater", lat: -87.3, lon: 77.0, category: "polar", minZoom: 1.8 },
];

// Official NASA Apollo human landing sites (Apollo 11, 12, 14, 15, 16, 17)
export interface ApolloLandingSite {
  id: string;
  name: string;
  missionNumber: number;
  lat: number;
  lon: number;
  landmark: string;
  year: number;
}

export const APOLLO_LANDING_SITES: ApolloLandingSite[] = [
  {
    id: "apollo_11",
    name: "Apollo 11",
    missionNumber: 11,
    lat: 0.67408,
    lon: 23.47297,
    landmark: "Mare Tranquillitatis",
    year: 1969,
  },
  {
    id: "apollo_12",
    name: "Apollo 12",
    missionNumber: 12,
    lat: -3.01239,
    lon: -23.42157,
    landmark: "Oceanus Procellarum",
    year: 1969,
  },
  {
    id: "apollo_14",
    name: "Apollo 14",
    missionNumber: 14,
    lat: -3.6453,
    lon: -17.47136,
    landmark: "Fra Mauro",
    year: 1971,
  },
  {
    id: "apollo_15",
    name: "Apollo 15",
    missionNumber: 15,
    lat: 26.13222,
    lon: 3.63386,
    landmark: "Hadley–Apennine",
    year: 1971,
  },
  {
    id: "apollo_16",
    name: "Apollo 16",
    missionNumber: 16,
    lat: -8.97301,
    lon: 15.49812,
    landmark: "Descartes Highlands",
    year: 1972,
  },
  {
    id: "apollo_17",
    name: "Apollo 17",
    missionNumber: 17,
    lat: 20.1908,
    lon: 30.77168,
    landmark: "Taurus–Littrow",
    year: 1972,
  },
];

/**
 * Procedural 3D Vector Model of the Apollo Lunar Module (LM) Spaceship.
 * Features:
 * - Surface target beacon disc on lunar terrain
 * - Gold foil wrapped octagonal descent stage
 * - Descent rocket engine nozzle
 * - 4 angled outrigger landing gear legs with circular footpads
 * - Satin-silver crew cabin ascent stage with forward visor cockpit windows
 * - Side propellant tanks
 * - Overhead docking collar and steerable VHF/rendezvous radar dish
 */
function createApolloLanderModel(): THREE.Mesh {
  const goldFoilMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b, // Distinctive Apollo Kapton gold foil
    roughness: 0.28,
    metalness: 0.85,
  });
  const cabinMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9, // Ascent stage satin metallic silver/white
    roughness: 0.35,
    metalness: 0.55,
  });
  const darkMetalMat = new THREE.MeshStandardMaterial({
    color: 0x334155, // Titanium / dark alloy
    roughness: 0.6,
    metalness: 0.5,
  });
  const windowMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.8,
    roughness: 0.1,
  });
  const beaconMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.6,
  });

  // Root mesh: Octagonal gold descent stage base
  const descentBaseGeo = new THREE.CylinderGeometry(0.018, 0.022, 0.014, 8);
  const lander = new THREE.Mesh(descentBaseGeo, goldFoilMat);

  // 1. Lunar Surface Target Beacon Disc (Ground Pad)
  const beaconGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.001, 24);
  const beacon = new THREE.Mesh(beaconGeo, beaconMat);
  beacon.position.y = -0.014;
  lander.add(beacon);

  // 2. Descent engine nozzle cone (pointing down toward surface)
  const nozzleGeo = new THREE.CylinderGeometry(0.007, 0, 0.009, 8);
  const nozzle = new THREE.Mesh(nozzleGeo, darkMetalMat);
  nozzle.position.y = -0.009;
  lander.add(nozzle);

  // 3. Four Outrigger Landing Gear Legs & Footpads
  const legAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
  const legStrutGeo = new THREE.CylinderGeometry(0.0016, 0.0016, 0.024, 6);
  const footpadGeo = new THREE.CylinderGeometry(0.0055, 0.0055, 0.0018, 8);

  legAngles.forEach((angle) => {
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    // Primary strut angled outward and down
    const strut = new THREE.Mesh(legStrutGeo, goldFoilMat);
    strut.position.set(0.019 * cosA, -0.006, 0.019 * sinA);
    strut.rotation.y = angle;
    strut.rotation.z = -0.65;
    lander.add(strut);

    // Footpad on the lunar surface
    const footpad = new THREE.Mesh(footpadGeo, goldFoilMat);
    footpad.position.set(0.027 * cosA, -0.0135, 0.027 * sinA);
    lander.add(footpad);
  });

  // 4. Ascent Stage (Faceted Cabin & Cockpit)
  const cabinGeo = new THREE.CylinderGeometry(0.016, 0.018, 0.016, 6);
  const cabin = new THREE.Mesh(cabinGeo, cabinMat);
  cabin.position.y = 0.015;
  lander.add(cabin);

  // Front Cockpit Windows
  const windowGeo = new THREE.PlaneGeometry(0.012, 0.004);
  const windows = new THREE.Mesh(windowGeo, windowMat);
  windows.position.set(0, 0.018, 0.0165);
  lander.add(windows);

  // Side Propellant Tanks (+X and -X)
  const tankGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.012, 8);
  const leftTank = new THREE.Mesh(tankGeo, darkMetalMat);
  leftTank.position.set(-0.014, 0.014, 0);
  lander.add(leftTank);

  const rightTank = new THREE.Mesh(tankGeo, darkMetalMat);
  rightTank.position.set(0.014, 0.014, 0);
  lander.add(rightTank);

  // 5. Docking Tunnel & Steerable Rendezvous Radar Antenna (Top)
  const dockGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.004, 8);
  const dock = new THREE.Mesh(dockGeo, darkMetalMat);
  dock.position.y = 0.025;
  lander.add(dock);

  const radarMastGeo = new THREE.CylinderGeometry(0.0008, 0.0008, 0.008, 6);
  const radarMast = new THREE.Mesh(radarMastGeo, cabinMat);
  radarMast.position.set(0.004, 0.03, 0);
  lander.add(radarMast);

  const radarDishGeo = new THREE.CylinderGeometry(0.006, 0.001, 0.003, 8);
  radarDishGeo.rotateZ(0.5);
  const radarDish = new THREE.Mesh(radarDishGeo, goldFoilMat);
  radarDish.position.set(0.0055, 0.034, 0);
  lander.add(radarDish);

  return lander;
}

function createSouthPoleCapGeometry() {
  // Covers 60°S to 90°S with exact NASA Moon Trek South Polar Stereographic UVs
  const geom = new THREE.SphereGeometry(
    1,
    180,
    56,
    0,
    Math.PI * 2,
    (150 * Math.PI) / 180,
    (30 * Math.PI) / 180
  );
  const pos = geom.attributes.position as THREE.BufferAttribute;
  const uv = geom.attributes.uv as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  const rMoonM = 1_737_400;
  const extentFullM = 2 * 1_095_930;

  const features = LUNAR_RELIEF_FEATURES.map(([latDeg, lonDeg, radDeg, amp]) => {
    const lat = latDeg * degrees;
    const lon = lonDeg * degrees;
    return {
      dir: new THREE.Vector3(
        Math.cos(lat) * Math.cos(lon),
        Math.sin(lat),
        -Math.cos(lat) * Math.sin(lon)
      ),
      radRad: radDeg * degrees,
      amp,
    };
  });

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize();
    const nx = v.x;
    const ny = v.y;
    const nz = v.z;

    // Exact South Polar Stereographic projection matching LRO_WAC_Mosaic_SPole60_100mp
    const k = (2 * rMoonM) / Math.max(0.05, 1 - ny);
    const xMap = k * -nz;
    const yMap = k * nx;
    uv.setXY(i, 0.5 + xMap / extentFullM, 0.5 + yMap / extentFullM);

    let h =
      0.0045 * Math.sin(nx * 11 + nz * 7) * Math.cos(ny * 9) +
      0.0025 * Math.sin(nx * 27 - ny * 19 + nz * 23) +
      0.0012 * Math.cos(nx * 53 + ny * 47 - nz * 41);

    for (const f of features) {
      const angle = Math.acos(Math.min(1, Math.max(-1, v.dot(f.dir))));
      if (angle < f.radRad * 1.45) {
        const u = angle / f.radRad;
        if (f.amp < 0) {
          const bowl = u < 1 ? (1 - u * u) * f.amp : 0;
          const rim = Math.exp(-Math.pow((u - 1.0) / 0.22, 2)) * (-f.amp * 0.35);
          h += bowl + rim;
        } else {
          const ridge = Math.exp(-Math.pow(u / 0.75, 2)) * f.amp;
          h += ridge;
        }
      }
    }

    // Smoothly feather polar micro-relief to 0 at 60°S so cap meets global sphere seamlessly
    const polarWeight = Math.min(1, Math.max(0, (-ny - 0.87) / 0.08));
    v.multiplyScalar(1.001 + h * polarWeight);
    pos.setXYZ(i, v.x, v.y, v.z);
  }

  pos.needsUpdate = true;
  uv.needsUpdate = true;
  geom.computeVertexNormals();
  return geom;
}

function eclipseGeometry(time: number) {
  const date = new Date(time);
  const sun = GeoVector(Body.Sun, date, false);
  const moon = GeoMoon(date);
  const shadowAxis = new THREE.Vector3(-sun.x, -sun.y, -sun.z).normalize();
  const east = new THREE.Vector3(0, 0, 1).cross(shadowAxis).normalize();
  const north = shadowAxis.clone().cross(east);
  const moonVector = new THREE.Vector3(moon.x, moon.y, moon.z).multiplyScalar(KM_PER_AU);
  const distance = moonVector.dot(shadowAxis);
  const sunDistance = Math.hypot(sun.x, sun.y, sun.z) * KM_PER_AU;
  const scale = earthRadius / earthRadiusKm;

  // Compress axial distances and keep relative scales in the shadow cross-section.
  return {
    moon: new THREE.Vector3(0.5 + distance / 100_000, moonVector.dot(north) * scale, moonVector.dot(east) * scale),
    umbra: (earthRadiusKm - distance * (sunRadiusKm - earthRadiusKm) / sunDistance) * scale,
    penumbra: (earthRadiusKm + distance * (sunRadiusKm + earthRadiusKm) / sunDistance) * scale,
  };
}

function direction(azimuth: number, elevation: number) {
  const az = azimuth * degrees;
  const el = elevation * degrees;
  return new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el));
}

function lunarOrientation(latitude: number, longitude: number) {
  const lat = latitude * degrees;
  const lon = longitude * degrees;
  const up = new THREE.Vector3(Math.cos(lat) * Math.cos(lon), Math.sin(lat), -Math.cos(lat) * Math.sin(lon));
  const east = new THREE.Vector3(-Math.sin(lon), 0, -Math.cos(lon));
  const south = east.clone().cross(up);
  return new THREE.Matrix4().makeBasis(east, up, south).transpose();
}

function ring(scene: THREE.Scene, color: number, opacity: number) {
  const positions = new Float32Array(97 * 3);
  for (let i = 0; i < 97; i++) {
    const angle = i * 2 * Math.PI / 96;
    positions.set([0, Math.cos(angle), Math.sin(angle)], i * 3);
  }
  const geometry = new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
  scene.add(line);
  return line;
}

function starField(scene: THREE.Scene) {
  const positions = new Float32Array(2200 * 3);
  // A repeatable background keeps the same stars in view while scrubbing time.
  for (let i = 0; i < 2200; i++) {
    const az = i * 137.507764 * degrees;
    const y = 1 - 2 * (i + 0.5) / 2200;
    const r = Math.sqrt(1 - y * y);
    positions.set([95 * r * Math.cos(az), 95 * y, 95 * r * Math.sin(az)], i * 3);
  }
  const geometry = new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(positions, 3));
  scene.add(new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xaac4eb, size: 1.1, sizeAttenuation: false, transparent: true, opacity: 0.55 })));
}

export function createSpaceScene(
  host: HTMLDivElement,
  labels: HTMLSpanElement[],
  mode: SceneFrame["mode"],
  callbacks?: SpaceSceneCallbacks
) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setClearColor(0, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  starField(scene);
  const camera = new THREE.OrthographicCamera(-9, 9, 6, -6, 0.1, 220);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minZoom = mode === "site" ? 0.35 : 0.65;
  controls.maxZoom = mode === "site" ? 18 : 3.8;
  controls.autoRotateSpeed = 0.65;
  const reset = () => {
    flyAnim = null;
    if (mode === "eclipse") camera.position.set(2.5, 4.2, 15);
    else camera.position.set(11.5, 4.2, 22);
    controls.target.set(mode === "eclipse" ? -0.4 : 0, mode === "eclipse" ? 0 : -0.55, 0);
    camera.zoom = 1;
    camera.updateProjectionMatrix();
    controls.update();
    render();
  };

  const loader = new THREE.TextureLoader();
  const textures: THREE.Texture[] = [];
  let disposed = false;
  const texture = (url: string) => {
    const map = loader.load(url, () => { if (!disposed) render(); });
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    textures.push(map);
    return map;
  };

  const sunlight = new THREE.DirectionalLight(0xffefd9, 2.4);
  scene.add(sunlight, new THREE.AmbientLight(0xbfbfcc, mode === "eclipse" ? 0.48 : 0.64));

  const moonTexture = texture(moonLrocMap);
  const lolaDemTexture = loader.load(moonLolaLdem, () => { if (!disposed) render(); });
  textures.push(lolaDemTexture);
  const spoleWacTexture = texture(moonSpoleWac);
  const sun = new THREE.Mesh(sphere(), new THREE.MeshBasicMaterial({ color: 0xffdb9d, map: texture(sunMap) }));
  const earth = new THREE.Mesh(sphere(), new THREE.MeshStandardMaterial({ map: texture(earthMap), roughness: 0.9 }));
  const moonGeom = mode === "site" ? new THREE.SphereGeometry(1, 180, 120) : sphere();
  const moon = new THREE.Mesh(
    moonGeom,
    new THREE.MeshStandardMaterial({
      map: moonTexture,
      bumpMap: lolaDemTexture,
      bumpScale: 0.04,
      roughness: 0.96,
      metalness: 0.02,
    })
  );
  let southPoleCapMesh: THREE.Mesh | null = null;
  if (mode === "site") {
    const capGeom = createSouthPoleCapGeometry();
    southPoleCapMesh = new THREE.Mesh(
      capGeom,
      new THREE.MeshStandardMaterial({
        map: spoleWacTexture,
        bumpMap: spoleWacTexture,
        bumpScale: 0.036,
        roughness: 0.96,
        metalness: 0.02,
        transparent: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      })
    );
    moon.add(southPoleCapMesh);

    // Displace the entire 3D Moon sphere + recompute vertex normals using real NASA LOLA LDEM
    const ldemImg = new Image();
    ldemImg.onload = () => {
      if (disposed) return;
      const canvas = document.createElement("canvas");
      canvas.width = ldemImg.width;
      canvas.height = ldemImg.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(ldemImg, 0, 0);
      const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const sampleLdem = (u: number, v: number) => {
        const px = Math.min(width - 1, Math.max(0, Math.round(u * (width - 1))));
        const py = Math.min(height - 1, Math.max(0, Math.round((1 - v) * (height - 1))));
        return data[(py * width + px) * 4] / 255 - 0.5;
      };

      const moonPos = moonGeom.attributes.position as THREE.BufferAttribute;
      const moonUv = moonGeom.attributes.uv as THREE.BufferAttribute;
      const tmp = new THREE.Vector3();
      for (let i = 0; i < moonPos.count; i++) {
        tmp.fromBufferAttribute(moonPos, i).normalize();
        const elev = sampleLdem(moonUv.getX(i), moonUv.getY(i));
        tmp.multiplyScalar(1 + elev * 0.055);
        moonPos.setXYZ(i, tmp.x, tmp.y, tmp.z);
      }
      moonPos.needsUpdate = true;
      moonGeom.computeVertexNormals();

      // Match the South Pole cap base elevation to the global LOLA elevation for a seamless 60°S join
      if (southPoleCapMesh) {
        const capPos = capGeom.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < capPos.count; i++) {
          tmp.fromBufferAttribute(capPos, i);
          const rCur = tmp.length();
          tmp.normalize();
          const uEq = 0.5 + Math.atan2(-tmp.z, tmp.x) / (2 * Math.PI);
          const vEq = 0.5 + Math.asin(Math.min(1, Math.max(-1, tmp.y))) / Math.PI;
          const elev = sampleLdem(uEq, vEq);
          tmp.multiplyScalar(rCur + elev * 0.055);
          capPos.setXYZ(i, tmp.x, tmp.y, tmp.z);
        }
        capPos.needsUpdate = true;
        capGeom.computeVertexNormals();
      }
      render();
    };
    ldemImg.src = moonLolaLdem;
  }
  scene.add(sun, earth, moon);

  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { tint: { value: new THREE.Color(0xff791b) } },
      vertexShader: `varying vec2 vUv;
        void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `varying vec2 vUv; uniform vec3 tint;
        void main() {
          float radius = length(vUv - 0.5) * 2.0;
          float alpha = exp(-radius * 6.2) * (1.0 - smoothstep(0.72, 1.0, radius));
          gl_FragColor = vec4(tint, alpha * 0.77);
          #include <colorspace_fragment>
        }`,
    }),
  );
  scene.add(glow);
  const atmosphere = new THREE.Mesh(
    sphere(),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
      vertexShader: `varying vec3 normalView; varying vec3 viewDirection;
        void main() {
          normalView = normalize(normalMatrix * normal);
          vec4 p = modelViewMatrix * vec4(position, 1.0);
          viewDirection = normalize(-p.xyz);
          gl_Position = projectionMatrix * p;
        }`,
      fragmentShader: `varying vec3 normalView; varying vec3 viewDirection;
        void main() {
          float rim = pow(1.0 - abs(dot(normalize(normalView), normalize(viewDirection))), 3.0);
          gl_FragColor = vec4(0.12, 0.51, 1.0, rim * 0.68);
        }`,
    }),
  );
  scene.add(atmosphere);

  const umbra = ring(scene, 0xfb9366, 0.75);
  const penumbra = ring(scene, 0xc4a1bd, 0.42);
  const axis = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([sunPosition, new THREE.Vector3(6.6, 0, 0)]),
    new THREE.LineDashedMaterial({ color: 0xb4aec6, transparent: true, opacity: 0.45, dashSize: 0.12, gapSize: 0.16 }),
  );
  axis.computeLineDistances();
  scene.add(axis);
  const cone = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 1, 1, 48, 1, true).rotateZ(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0xed7758, transparent: true, opacity: 0.10, depthWrite: false, side: THREE.DoubleSide }),
  );
  scene.add(cone);

  const shadowRadii = { value: new THREE.Vector2() };
  if (mode === "eclipse") {
    moon.material.onBeforeCompile = (shader) => {
      shader.uniforms.shadowRadii = shadowRadii;
      shader.vertexShader = "varying vec3 shadowPosition;\n" + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nshadowPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;");
      shader.fragmentShader = "varying vec3 shadowPosition; uniform vec2 shadowRadii;\n" + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace("#include <opaque_fragment>", `
        float r = length(shadowPosition.yz);
        float eclipse = 1.0 - smoothstep(shadowRadii.x, shadowRadii.y, r);
        vec3 copper = diffuseColor.rgb * vec3(0.58, 0.115, 0.038);
        outgoingLight = mix(outgoingLight, copper, pow(eclipse, 1.25));
        #include <opaque_fragment>
      `);
    };
  }

  const horizon = ring(scene, 0x53d8ef, 0.6);
  horizon.rotation.z = Math.PI / 2;
  horizon.scale.setScalar(1.22);
  const site = new THREE.Mesh(sphere(), new THREE.MeshBasicMaterial({ color: 0xb4f5ff }));
  site.scale.setScalar(0.06);
  scene.add(site);

  // Subtle line-of-sight rays from landing site (0,0,0) toward Sun and Earth in "site" mode
  const originZero = new THREE.Vector3(0, 0, 0);
  const sunRay = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([originZero, new THREE.Vector3(1, 0, 0)]),
    new THREE.LineDashedMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.38, dashSize: 0.18, gapSize: 0.14 })
  );
  const earthRay = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([originZero, new THREE.Vector3(0, 1, 0)]),
    new THREE.LineDashedMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.38, dashSize: 0.18, gapSize: 0.14 })
  );
  scene.add(sunRay, earthRay);

  const pinGeometry = new THREE.SphereGeometry(0.026, 16, 12);
  const pinMaterialDefault = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
  const pinMaterialSelected = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
  const pinSites = new Map<THREE.Mesh, LandingSite>();
  let lastPinKey = "";

  // Overlay container for 3D Moon place & landing-site labels
  const placeLabelsContainer = document.createElement("div");
  placeLabelsContainer.setAttribute("aria-hidden", "true");
  placeLabelsContainer.className = "pointer-events-none absolute inset-0 overflow-hidden select-none";
  host.appendChild(placeLabelsContainer);

  interface PlaceLabelEntry {
    el: HTMLSpanElement;
    unitVec: THREE.Vector3;
    minZoom: number;
    priority: number;
  }
  const staticPlaceEntries: PlaceLabelEntry[] = LUNAR_NAMED_PLACES.map((place) => {
    const el = document.createElement("span");
    const isMare = place.category === "mare";
    el.className = isMare
      ? "absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase text-slate-200/85 bg-slate-950/55 border border-slate-700/50 backdrop-blur-[1px]"
      : "absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] italic text-amber-100/85 bg-slate-950/60 border border-amber-500/25";
    el.textContent = place.name;
    el.hidden = true;
    placeLabelsContainer.appendChild(el);
    const lat = place.lat * degrees;
    const lon = place.lon * degrees;
    return {
      el,
      unitVec: new THREE.Vector3(
        Math.cos(lat) * Math.cos(lon),
        Math.sin(lat),
        -Math.cos(lat) * Math.sin(lon)
      ),
      minZoom: place.minZoom,
      priority: isMare ? 2 : 1,
    };
  });

  // Apollo Historical Landing Sites (Apollo 11, 12, 14, 15, 16, 17)
  const apolloPins = new Map<THREE.Mesh, LandingSite>();
  const surfaceNormalRef = new THREE.Vector3(0, 1, 0);

  const apolloPlaceEntries: PlaceLabelEntry[] = APOLLO_LANDING_SITES.map((ap) => {
    const lat = ap.lat * degrees;
    const lon = ap.lon * degrees;
    const unitVec = new THREE.Vector3(
      Math.cos(lat) * Math.cos(lon),
      Math.sin(lat),
      -Math.cos(lat) * Math.sin(lon)
    );
    const spaceship = createApolloLanderModel();
    // Plant spaceship feet directly onto the lunar sphere
    spaceship.position.copy(unitVec).multiplyScalar(1.015);
    // Orient spaceship: local +Y axis points outward along surface normal
    spaceship.quaternion.setFromUnitVectors(surfaceNormalRef, unitVec);
    moon.add(spaceship);

    const apolloSite: LandingSite = {
      site_id: ap.id,
      name: `${ap.name} (${ap.landmark})`,
      region: ap.landmark,
      latitude_deg: ap.lat,
      longitude_deg: ap.lon,
      description: `Historic NASA Apollo mission landing site (${ap.year}). Location: ${ap.landmark}.`,
      elevation_m: null,
      source: "NASA Apollo Lunar Surface Journal",
      coordinate_type: "historical_touchdown",
    };
    apolloPins.set(spaceship, apolloSite);

    const el = document.createElement("span");
    el.className =
      "absolute -translate-x-1/2 -translate-y-full -mt-1.5 whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-semibold text-sky-200 bg-slate-950/90 border border-sky-400/50 shadow-sm backdrop-blur-[1px]";
    el.textContent = `🚀 ${ap.name}`;
    el.title = `${ap.name} Lunar Module — ${ap.landmark} (${ap.year})`;
    el.hidden = true;
    placeLabelsContainer.appendChild(el);

    return {
      el,
      unitVec,
      minZoom: 0.55,
      priority: 8,
    };
  });
  let dynamicSiteEntries: PlaceLabelEntry[] = [];

  function syncSitePins(sites?: LandingSite[], selectedSiteId?: string) {
    const key = (sites ?? []).map((s) => `${s.site_id}:${s.latitude_deg}:${s.longitude_deg}`).join("|") + `#${selectedSiteId ?? ""}`;
    if (key === lastPinKey) return;
    lastPinKey = key;
    for (const pinObj of pinSites.keys()) {
      moon.remove(pinObj);
    }
    pinSites.clear();
    for (const entry of dynamicSiteEntries) {
      entry.el.remove();
    }
    dynamicSiteEntries = [];
    if (!sites || mode === "eclipse") return;
    for (const candidate of sites) {
      const lat = candidate.latitude_deg * degrees;
      const lon = candidate.longitude_deg * degrees;
      const isSelected = candidate.site_id === selectedSiteId;
      const unitVec = new THREE.Vector3(
        Math.cos(lat) * Math.cos(lon),
        Math.sin(lat),
        -Math.cos(lat) * Math.sin(lon)
      );
      const pin = new THREE.Mesh(
        pinGeometry,
        isSelected ? pinMaterialSelected : pinMaterialDefault
      );
      pin.position.copy(unitVec).multiplyScalar(1.015);
      if (isSelected) pin.scale.setScalar(1.45);
      moon.add(pin);
      pinSites.set(pin, candidate);

      const labelEl = document.createElement("span");
      labelEl.className = isSelected
        ? "absolute -translate-x-1/2 -translate-y-full -mt-2 whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-semibold text-cyan-200 bg-slate-950/90 border border-cyan-400/70 shadow-sm"
        : "absolute -translate-x-1/2 -translate-y-full -mt-1.5 whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-medium text-amber-200 bg-slate-950/80 border border-amber-400/40";
      labelEl.textContent = isSelected ? `★ ${candidate.name}` : candidate.name;
      labelEl.hidden = true;
      placeLabelsContainer.appendChild(labelEl);
      dynamicSiteEntries.push({
        el: labelEl,
        unitVec,
        minZoom: isSelected ? 0.65 : 1.45,
        priority: isSelected ? 10 : 5,
      });
    }
  }

  const pinWorldPos = new THREE.Vector3();
  let downX = 0;
  let downY = 0;
  const onPointerDown = (e: PointerEvent) => {
    downX = e.clientX;
    downY = e.clientY;
  };
  const onPointerUp = (e: PointerEvent) => {
    if (mode !== "site" || !callbacks?.onSelectSite || (pinSites.size === 0 && apolloPins.size === 0)) return;
    if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return;
    const rect = renderer.domElement.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const clickX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const clickY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    let bestHit: { site: LandingSite; distSq: number } | null = null;
    const allClickablePins = [...pinSites.entries(), ...apolloPins.entries()];
    for (const [pinObj, candidate] of allClickablePins) {
      pinWorldPos
        .copy(pinObj.position)
        .multiplyScalar(moon.scale.x)
        .applyQuaternion(moon.quaternion)
        .add(moon.position);
      pinWorldPos.project(camera);
      if (pinWorldPos.z < -1 || pinWorldPos.z > 1) continue;
      const distSq = (pinWorldPos.x - clickX) ** 2 + (pinWorldPos.y - clickY) ** 2;
      if (distSq <= 0.0036 && (!bestHit || distSq < bestHit.distSq)) {
        bestHit = { site: candidate, distSq };
      }
    }
    if (bestHit) callbacks.onSelectSite(bestHit.site);
  };
  renderer.domElement.addEventListener("pointerdown", onPointerDown);
  renderer.domElement.addEventListener("pointerup", onPointerUp);
  const projected = new THREE.Vector3();
  const worldNormal = new THREE.Vector3();
  const camToMoonDir = new THREE.Vector3();
  const objects = [sun, earth, moon];
  let frameTime = 0;
  let visible = false;

  function render() {
    if (disposed || !visible) return;
    glow.quaternion.copy(camera.quaternion);
    renderer.render(scene, camera);
    objects.forEach((object, index) => {
      const label = labels[index];
      projected.copy(object.position).project(camera);
      label.hidden = !object.visible || Math.abs(projected.x) > 0.91 || Math.abs(projected.y) > 0.83;
      label.style.left = `${(projected.x + 1) * 50}%`;
      label.style.top = `${(1 - projected.y) * 50}%`;
      const worldHeight = (camera.top - camera.bottom) / camera.zoom;
      label.style.marginTop = `${object.scale.x * host.clientHeight / worldHeight + 8}px`;
    });

    // Update 3D Moon place & landing-site labels with hemisphere culling + screen-space de-cluttering
    if (mode !== "site") {
      placeLabelsContainer.hidden = true;
      return;
    }
    placeLabelsContainer.hidden = false;
    camToMoonDir.copy(camera.position).sub(controls.target).normalize();
    const w = host.clientWidth || 1;
    const h = host.clientHeight || 1;
    const placedBoxes: Array<{ x: number; y: number }> = [];
    const allEntries = [
      ...dynamicSiteEntries,
      ...apolloPlaceEntries,
      ...staticPlaceEntries,
    ].sort((a, b) => b.priority - a.priority);

    for (const entry of allEntries) {
      if (camera.zoom < entry.minZoom) {
        entry.el.hidden = true;
        continue;
      }
      worldNormal.copy(entry.unitVec).applyQuaternion(moon.quaternion);
      const facing = worldNormal.dot(camToMoonDir);
      if (facing < 0.22) {
        entry.el.hidden = true;
        continue;
      }
      projected
        .copy(worldNormal)
        .multiplyScalar(moon.scale.x * 1.02)
        .add(moon.position)
        .project(camera);
      if (Math.abs(projected.x) > 0.92 || Math.abs(projected.y) > 0.88) {
        entry.el.hidden = true;
        continue;
      }
      const px = (projected.x + 1) * 0.5 * w;
      const py = (1 - projected.y) * 0.5 * h;
      const minSep = entry.priority >= 10 ? 0 : 48;
      if (
        minSep > 0 &&
        placedBoxes.some((b) => Math.hypot(b.x - px, b.y - py) < minSep)
      ) {
        entry.el.hidden = true;
        continue;
      }
      placedBoxes.push({ x: px, y: py });
      entry.el.hidden = false;
      entry.el.style.left = `${(projected.x + 1) * 50}%`;
      entry.el.style.top = `${(1 - projected.y) * 50}%`;
    }
  }

  const resize = new ResizeObserver(() => {
    const width = host.clientWidth;
    const height = host.clientHeight;
    if (!width || !height) return;
    visible = true;
    const aspect = width / height;
    const halfWidth = Math.max(mode === "eclipse" ? 8.5 : 11.5, aspect * 6.4);
    camera.left = -halfWidth;
    camera.right = halfWidth;
    camera.top = halfWidth / aspect;
    camera.bottom = -camera.top;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    render();
  });
  resize.observe(host);
  let syncingTarget = false;
  let hasInitialOrientation = false;
  let settleRaf = 0;
  let lastFocusSeq: number | undefined;
  const targetMoonQuat = moon.quaternion.clone();
  interface FlyAnim {
    startTime: number;
    durationMs: number;
    startQuat: typeof targetMoonQuat;
    endQuat: typeof targetMoonQuat;
    startZoom: number;
    midZoom: number;
    endZoom: number;
  }
  let flyAnim: FlyAnim | null = null;
  const smoothstep = (x: number) => {
    const c = Math.min(1, Math.max(0, x));
    return c * c * (3 - 2 * c);
  };

  controls.addEventListener("start", () => {
    flyAnim = null;
  });

  function updatePinScales() {
    const zoomFactor = Math.max(0.22, 1 / Math.sqrt(Math.max(1, camera.zoom)));
    site.scale.setScalar(0.06 * zoomFactor);
    for (const [pinObj, candidate] of pinSites.entries()) {
      const isSelected = candidate.site_id === lastSelectedPinId;
      pinObj.scale.setScalar((isSelected ? 1.45 : 1) * zoomFactor);
    }
    for (const [pinObj, apSite] of apolloPins.entries()) {
      const isSelected = apSite.site_id === lastSelectedPinId;
      pinObj.scale.setScalar((isSelected ? 1.6 : 1.15) * zoomFactor);
    }
  }

  let lastSelectedPinId: string | undefined;

  function scheduleSettle() {
    if (settleRaf || disposed) return;
    const step = () => {
      settleRaf = 0;
      if (disposed) return;
      let needsMore = false;
      if (mode === "site" && flyAnim !== null) {
        const u = Math.min(1, (performance.now() - flyAnim.startTime) / flyAnim.durationMs);
        const rotT = smoothstep(u);
        moon.quaternion.copy(flyAnim.startQuat).slerp(flyAnim.endQuat, rotT);
        if (flyAnim.midZoom < flyAnim.startZoom - 0.05) {
          const pivot = 0.38;
          if (u <= pivot) {
            const zOutT = smoothstep(u / pivot);
            camera.zoom = flyAnim.startZoom + (flyAnim.midZoom - flyAnim.startZoom) * zOutT;
          } else {
            const zInT = smoothstep((u - pivot) / (1 - pivot));
            camera.zoom = flyAnim.midZoom + (flyAnim.endZoom - flyAnim.midZoom) * zInT;
          }
        } else {
          camera.zoom = flyAnim.startZoom + (flyAnim.endZoom - flyAnim.startZoom) * rotT;
        }
        if (u < 1) {
          needsMore = true;
        } else {
          moon.quaternion.copy(flyAnim.endQuat);
          camera.zoom = flyAnim.endZoom;
          flyAnim = null;
        }
        const t = Math.min(1, Math.max(0, (camera.zoom - 1) / (3.0 - 1)));
        syncingTarget = true;
        controls.target.set(0, -0.5 * (1 - t), 0);
        syncingTarget = false;
        camera.updateProjectionMatrix();
        updatePinScales();
        callbacks?.onZoomChange?.(camera.zoom);
      } else if (mode === "site" && hasInitialOrientation) {
        const dot = Math.abs(moon.quaternion.dot(targetMoonQuat));
        if (dot < 0.99999) {
          moon.quaternion.slerp(targetMoonQuat, 0.05);
          needsMore = true;
        } else {
          moon.quaternion.copy(targetMoonQuat);
        }
      }
      if (controls.update()) {
        needsMore = true;
      }
      render();
      if (needsMore) {
        settleRaf = requestAnimationFrame(step);
      }
    };
    settleRaf = requestAnimationFrame(step);
  }

  controls.addEventListener("change", () => {
    if (syncingTarget) return;
    if (mode === "site") {
      // Gradually shift camera target from Moon body (-0.5) to the selected site surface (0,0,0) as zoom increases
      const t = Math.min(1, Math.max(0, (camera.zoom - 1) / (3.0 - 1)));
      const desiredY = -0.5 * (1 - t);
      if (
        Math.abs(controls.target.y - desiredY) > 0.002 ||
        controls.target.x !== 0 ||
        controls.target.z !== 0
      ) {
        syncingTarget = true;
        controls.target.set(0, desiredY, 0);
        controls.update();
        syncingTarget = false;
      }
      updatePinScales();
      callbacks?.onZoomChange?.(camera.zoom);
    }
    render();
  });
  reset();

  function update(frame: SceneFrame) {
    const replay = frame.mode === "eclipse";
    [axis, cone, umbra, penumbra].forEach((object) => { object.visible = replay; });
    horizon.visible = site.visible = !replay;
    if (frame.mode === "eclipse") {
      sunRay.visible = earthRay.visible = false;
      const geometry = eclipseGeometry(frame.time);
      sun.visible = earth.visible = true;
      sun.position.copy(sunPosition);
      sun.scale.setScalar(2.35);
      earth.position.set(0, 0, 0);
      earth.scale.setScalar(earthRadius);
      earth.rotation.y = 1.15 + (frame.time - Date.UTC(2025, 0, 1)) / 86_164_091 * 2 * Math.PI;
      moon.position.copy(geometry.moon);
      moon.scale.setScalar(moonRadius);
      moon.rotation.y = -0.35;
      for (const [circle, radius] of [[umbra, geometry.umbra], [penumbra, geometry.penumbra]] as const) {
        circle.position.x = moon.position.x;
        circle.scale.setScalar(radius);
      }
      shadowRadii.value.set(geometry.umbra, geometry.penumbra);
      cone.scale.set(moon.position.x, earthRadius, earthRadius);
      cone.position.x = moon.position.x / 2;
    } else {
      // Realistic hierarchy & deep-space separation:
      // Moon (r=1.65 at origin) < Earth (r=1.95 at dist=10.5) < Sun (r=2.75 at dist=17.5)
      const siteMoonRadius = 1.65;
      moon.position.set(0, -siteMoonRadius, 0);
      moon.scale.setScalar(siteMoonRadius);
      targetMoonQuat.setFromRotationMatrix(lunarOrientation(frame.latitude, frame.longitude));
      const siteChanged =
        hasInitialOrientation &&
        ((frame.selectedSiteId !== undefined && frame.selectedSiteId !== lastSelectedPinId) ||
          (frame.focusSeq !== undefined && frame.focusSeq !== lastFocusSeq));
      if (!hasInitialOrientation) {
        moon.quaternion.copy(targetMoonQuat);
        hasInitialOrientation = true;
      } else {
        if (siteChanged) {
          const now = performance.now();
          if (flyAnim && now - flyAnim.startTime < 250) {
            flyAnim.endQuat.copy(targetMoonQuat);
          } else {
            const startQuat = moon.quaternion.clone();
            const endQuat = targetMoonQuat.clone();
            const dot = Math.min(1, Math.abs(startQuat.dot(endQuat)));
            const angleRad = 2 * Math.acos(dot);
            const startZoom = camera.zoom;
            const endZoom = Math.max(startZoom, 6.2);
            const midZoom =
              startZoom > 2.2
                ? angleRad > 0.35
                  ? 1.5
                  : Math.max(2.0, startZoom * 0.48)
                : startZoom;
            flyAnim = {
              startTime: now,
              durationMs: angleRad > 0.35 ? 2100 : 1650,
              startQuat,
              endQuat,
              startZoom,
              midZoom,
              endZoom,
            };
          }
        } else if (flyAnim) {
          flyAnim.endQuat.copy(targetMoonQuat);
        }
        scheduleSettle();
      }
      lastFocusSeq = frame.focusSeq;
      lastSelectedPinId = frame.selectedSiteId;
      sun.scale.setScalar(2.75);
      earth.scale.setScalar(1.95);
      earth.rotation.y = 1.6;
      if (labels[0]) {
        labels[0].textContent = frame.point?.sun_distance_au
          ? `Sun · ${(frame.point.sun_distance_au * 149.598).toFixed(1)}M km`
          : "Sun · 149.6M km";
      }
      if (labels[1]) {
        labels[1].textContent = frame.point?.earth_distance_km
          ? `Earth · ${Math.round(frame.point.earth_distance_km).toLocaleString()} km`
          : "Earth · 384,400 km";
      }
      const place = (
        object: THREE.Mesh,
        ray: THREE.Line,
        dist: number,
        az?: number | null,
        el?: number | null
      ) => {
        const isVis = az != null && el != null;
        object.visible = isVis;
        ray.visible = isVis;
        if (az != null && el != null) {
          object.position.copy(direction(az, el).multiplyScalar(dist));
          const posAttr = ray.geometry.attributes.position as THREE.BufferAttribute;
          posAttr.setXYZ(0, 0, 0, 0);
          posAttr.setXYZ(1, object.position.x, object.position.y, object.position.z);
          posAttr.needsUpdate = true;
          ray.computeLineDistances();
        }
      };
      place(sun, sunRay, 17.5, frame.point?.sun_azimuth_deg, frame.point?.sun_elevation_deg);
      place(earth, earthRay, 10.5, frame.point?.earth_azimuth_deg, frame.point?.earth_elevation_deg);
      syncSitePins(frame.sites, frame.selectedSiteId);
      updatePinScales();
    }
    atmosphere.position.copy(earth.position);
    atmosphere.scale.setScalar(earth.scale.x * 1.048);
    atmosphere.visible = earth.visible;
    glow.position.copy(sun.position);
    glow.scale.setScalar(sun.scale.x * 3.1);
    glow.visible = sun.visible;
    sunlight.position.copy(sun.visible ? sun.position : new THREE.Vector3(-3, 4, 2));
    render();
  }

  return {
    update,
    reset,
    focusShadow() {
      controls.target.set(moon.position.x, 0, 0);
      camera.position.copy(controls.target).add(new THREE.Vector3(14, 0.7, 3.5));
      camera.zoom = 3.4;
      camera.updateProjectionMatrix();
      controls.update();
      render();
    },
    rotate(enabled: boolean) {
      cancelAnimationFrame(frameTime);
      controls.autoRotate = enabled;
      if (!enabled) return;
      const animate = () => {
        controls.update();
        frameTime = requestAnimationFrame(animate);
      };
      frameTime = requestAnimationFrame(animate);
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frameTime);
      cancelAnimationFrame(settleRaf);
      resize.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      pinGeometry.dispose();
      pinMaterialDefault.dispose();
      pinMaterialSelected.dispose();
      controls.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points) {
          object.geometry.dispose();
          object.material.dispose();
        }
      });
      textures.forEach((map) => map.dispose());
      renderer.dispose();
      renderer.domElement.remove();
      placeLabelsContainer.remove();
    },
  };
}
