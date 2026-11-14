import * as THREE from "../vendor/three-runtime.js";
import { OrbitControls } from "../vendor/three-runtime.js";
import { Body, GeoMoon, GeoVector, KM_PER_AU } from "../vendor/astronomy-runtime.js";
import earthMap from "../assets/earth.webp";
import moonMap from "../assets/moon.webp";
import sunMap from "../assets/sun.webp";
import type { EphemerisPoint } from "../../../types/helios";

export type SceneFrame =
  | { mode: "eclipse"; time: number }
  | { mode: "site"; point?: EphemerisPoint; latitude: number; longitude: number };

const degrees = Math.PI / 180;
const earthRadiusKm = 6378.1;
const sunRadiusKm = 695700;
const earthRadius = 1.34;
const moonRadius = earthRadius * 1737.4 / earthRadiusKm;
const sunPosition = new THREE.Vector3(-6, 0, 0);
const sphere = () => new THREE.SphereGeometry(1, 56, 36);

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
    positions.set([48 * r * Math.cos(az), 48 * y, 48 * r * Math.sin(az)], i * 3);
  }
  const geometry = new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(positions, 3));
  scene.add(new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xaac4eb, size: 1.1, sizeAttenuation: false, transparent: true, opacity: 0.55 })));
}

export function createSpaceScene(host: HTMLDivElement, labels: HTMLSpanElement[], mode: SceneFrame["mode"]) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setClearColor(0, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  starField(scene);
  const camera = new THREE.OrthographicCamera(-9, 9, 6, -6, 0.1, 100);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.minZoom = 0.65;
  controls.maxZoom = 3.8;
  controls.autoRotateSpeed = 0.65;
  const reset = () => {
    if (mode === "eclipse") camera.position.set(2.5, 4.2, 15);
    else camera.position.set(7, 2.5, 13);
    controls.target.set(mode === "eclipse" ? -0.4 : 0, mode === "eclipse" ? 0 : -0.85, 0);
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

  const sun = new THREE.Mesh(sphere(), new THREE.MeshBasicMaterial({ color: 0xffdb9d, map: texture(sunMap) }));
  const earth = new THREE.Mesh(sphere(), new THREE.MeshStandardMaterial({ map: texture(earthMap), roughness: 0.9 }));
  const moon = new THREE.Mesh(sphere(), new THREE.MeshStandardMaterial({ map: texture(moonMap), roughness: 1 }));
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
  horizon.scale.setScalar(2.18);
  const site = new THREE.Mesh(sphere(), new THREE.MeshBasicMaterial({ color: 0xb4f5ff }));
  site.scale.setScalar(0.075);
  scene.add(site);
  const projected = new THREE.Vector3();
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
  }

  const resize = new ResizeObserver(() => {
    const width = host.clientWidth;
    const height = host.clientHeight;
    if (!width || !height) return;
    visible = true;
    const aspect = width / height;
    const halfWidth = Math.max(mode === "eclipse" ? 8.5 : 6.5, aspect * 4.25);
    camera.left = -halfWidth;
    camera.right = halfWidth;
    camera.top = halfWidth / aspect;
    camera.bottom = -camera.top;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    render();
  });
  resize.observe(host);
  controls.addEventListener("change", render);
  reset();

  function update(frame: SceneFrame) {
    const replay = frame.mode === "eclipse";
    [axis, cone, umbra, penumbra].forEach((object) => { object.visible = replay; });
    horizon.visible = site.visible = !replay;
    if (frame.mode === "eclipse") {
      const geometry = eclipseGeometry(frame.time);
      sun.visible = earth.visible = true;
      sun.position.copy(sunPosition);
      sun.scale.setScalar(1.75);
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
      moon.position.set(0, -2.85, 0);
      moon.scale.setScalar(2.85);
      moon.setRotationFromMatrix(lunarOrientation(frame.latitude, frame.longitude));
      sun.scale.setScalar(0.56);
      earth.scale.setScalar(0.38);
      earth.rotation.y = 1.6;
      const place = (object: THREE.Mesh, az?: number | null, el?: number | null) => {
        object.visible = az != null && el != null;
        if (az != null && el != null) object.position.copy(direction(az, el).multiplyScalar(5.1));
      };
      place(sun, frame.point?.sun_azimuth_deg, frame.point?.sun_elevation_deg);
      place(earth, frame.point?.earth_azimuth_deg, frame.point?.earth_elevation_deg);
    }
    atmosphere.position.copy(earth.position);
    atmosphere.scale.setScalar(earth.scale.x * 1.048);
    atmosphere.visible = earth.visible;
    glow.position.copy(sun.position);
    glow.scale.setScalar(sun.scale.x * 5.2);
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
      resize.disconnect();
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
    },
  };
}
