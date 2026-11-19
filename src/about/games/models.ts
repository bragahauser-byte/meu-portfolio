import * as THREE from "three"
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js"
import { cases, discs, DISC_R, HOLE_R, SPINE_U0, SPINE_U1 } from "./platforms"
import type { CaseSpec, DiscSpec, EdgeSpec, PlatformId } from "./platforms"

// ── Models ───────────────────────────────────────────────────────────────────
// Everything is built in millimetres, from primitives, so one set of builders
// covers every platform and the per-platform specs (platforms.ts) change only
// proportions, colours, hub type and tray details.
//
// Case coordinates (closed): the case lies in the XY plane, front cover facing
// +Z, spine on the left (x ≈ 0), opening edge at x = W. Two hinges join the
// spine to each half; opening rotates the spine −90° about the back hinge and
// the front lid another −90° about the front hinge, so the open case lies
// flat facing +Z: inside of the front cover on the left, tray on the right —
// exactly how the reference photos show it.

const srgb = (c: [number, number, number]) => new THREE.Color().setRGB(c[0], c[1], c[2], THREE.SRGBColorSpace)

export type CaseRig = {
  root: THREE.Group
  spine: THREE.Group // rotates about Y at the back hinge
  lid: THREE.Group // child of spine, rotates about Y at the front hinge
  discs: DiscRig[]
  spec: CaseSpec
  closedCenter: THREE.Vector3
  frontCenter: THREE.Vector3
  openCenter: THREE.Vector3
  setOpen: (t: number) => void
}

export type DiscRig = {
  group: THREE.Group // positioned on its hub
  body: THREE.Group // lifted / tilted when the visitor takes it out
  pick: THREE.Mesh // invisible hit area
  rest: THREE.Vector3
  side: "back" | "lid"
}

type Mats = {
  shell: THREE.Material // walls, rims, clips: the plastic itself
  panel: THREE.Material // the big faces: paper behind plastic, or black plastic
  detail: THREE.Material // hub, tray ring
  insert: THREE.Material // printed paper
  film: THREE.Material // clear sleeve over the paper
  paperBack: THREE.Material
}

function box(w: number, h: number, d: number, r: number, mat: THREE.Material) {
  const g = r > 0 ? new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2, h / 2, d / 2) * 0.999) : new THREE.BoxGeometry(w, h, d)
  const m = new THREE.Mesh(g, mat)
  m.castShadow = true
  m.receiveShadow = true
  return m
}

// A PlaneGeometry showing one slice [u0, u1] of the cover scan.
function insertPlane(w: number, h: number, u0: number, u1: number, mat: THREE.Material) {
  const g = new THREE.PlaneGeometry(w, h)
  const uv = g.attributes.uv as THREE.BufferAttribute
  for (let i = 0; i < uv.count; i++) uv.setX(i, u0 + uv.getX(i) * (u1 - u0))
  uv.needsUpdate = true
  const m = new THREE.Mesh(g, mat)
  m.receiveShadow = true
  return m
}

// ── Tray details ─────────────────────────────────────────────────────────────

// Blu-ray "Elite" hub: a base boss, eight flexible petals that grip the
// 15 mm hole, and the central PUSH button.
function petalHub(mat: THREE.Material) {
  const g = new THREE.Group()
  const base = new THREE.Mesh(new THREE.CylinderGeometry(15.5, 16.5, 2.4, 64), mat)
  base.rotation.x = Math.PI / 2
  base.position.z = 1.2
  base.castShadow = true
  base.receiveShadow = true
  g.add(base)
  const ring = new THREE.Mesh(new THREE.TorusGeometry(15.6, 0.55, 8, 72), mat)
  ring.position.z = 2.4
  g.add(ring)
  // petals pass through the disc's 15 mm hole and grip its inner edge
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8
    const petal = new THREE.Mesh(new RoundedBoxGeometry(3.8, 2.3, 2.8, 1, 0.45), mat)
    petal.position.set(Math.cos(a) * 5.3, Math.sin(a) * 5.3, 3.7)
    petal.rotation.z = a
    petal.rotation.y = -0.22
    petal.castShadow = true
    g.add(petal)
    // spoke under the disc, from the boss to the petal
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(6, 1.1, 0.6), mat)
    spoke.position.set(Math.cos(a) * 11, Math.sin(a) * 11, 2.5)
    spoke.rotation.z = a
    g.add(spoke)
  }
  const button = new THREE.Mesh(new THREE.CylinderGeometry(3.1, 3.3, 3.2, 40), mat)
  button.rotation.x = Math.PI / 2
  button.position.z = 4.0
  button.castShadow = true
  g.add(button)
  const cap = new THREE.Mesh(new THREE.SphereGeometry(3.6, 32, 10, 0, Math.PI * 2, 0, Math.PI / 6), mat)
  cap.rotation.x = Math.PI / 2
  cap.position.z = 2.5
  g.add(cap)
  return g
}

// DVD (Amaray) hub: a ring of grip teeth around a domed release button.
function buttonHub(mat: THREE.Material, teeth: number) {
  const g = new THREE.Group()
  const base = new THREE.Mesh(new THREE.CylinderGeometry(16, 17.5, 2.4, 64), mat)
  base.rotation.x = Math.PI / 2
  base.position.z = 1.2
  base.castShadow = true
  base.receiveShadow = true
  g.add(base)
  const collar = new THREE.Mesh(new THREE.TorusGeometry(10.5, 0.7, 8, 64), mat)
  collar.position.z = 2.4
  g.add(collar)
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * Math.PI * 2
    const t = new THREE.Mesh(new RoundedBoxGeometry(2.2, 2.8, 3.4, 1, 0.5), mat)
    t.position.set(Math.cos(a) * 6.2, Math.sin(a) * 6.2, 3.9)
    t.rotation.z = a
    t.castShadow = true
    g.add(t)
  }
  const dome = new THREE.Mesh(new THREE.SphereGeometry(4.6, 36, 16, 0, Math.PI * 2, 0, Math.PI / 2.4), mat)
  dome.rotation.x = Math.PI / 2
  dome.position.z = 1.4
  dome.castShadow = true
  g.add(dome)
  return g
}

// Raised ring around the disc with finger notches on the opening side.
function trayRing(mat: THREE.Material, r: number, notches: boolean) {
  const g = new THREE.Group()
  const gaps = notches ? [0.62, -0.62] : []
  const gap = 0.36
  // arcs between notches, going round from the first notch
  const arcs: [number, number][] = []
  if (!gaps.length) arcs.push([0, Math.PI * 2])
  else {
    arcs.push([gaps[0] + gap / 2, Math.PI * 2 + gaps[1] - gap / 2 - (gaps[0] + gap / 2)])
    arcs.push([gaps[1] + gap / 2, gaps[0] - gap / 2 - (gaps[1] + gap / 2)])
  }
  for (const [start, len] of arcs) {
    const t = new THREE.Mesh(new THREE.TorusGeometry(r, 1.05, 10, 96, len), mat)
    t.rotation.z = start
    t.scale.z = 1.6
    t.position.z = 1.3
    t.castShadow = true
    t.receiveShadow = true
    g.add(t)
  }
  return g
}

// Booklet clip: an L-shaped tab rising from the inside of the cover.
function clip(mat: THREE.Material, flip: number) {
  const g = new THREE.Group()
  const post = box(2, 8, 4.2, 0.4, mat)
  post.position.z = 2.1
  g.add(post)
  const hook = box(7, 8, 1.2, 0.4, mat)
  hook.position.set(-3, 0, 4)
  g.add(hook)
  g.scale.y = flip
  return g
}

// ── Disc ─────────────────────────────────────────────────────────────────────

const discVertex = /* glsl */ `
  varying vec3 vWorld;
  varying vec3 vNormalW;
  varying vec3 vRadialW;
  varying float vR;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vRadialW = normalize(mat3(modelMatrix) * vec3(position.xy, 0.0));
    vR = length(position.xy);
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`

// Read side. Pits are laid on a spiral track, so locally the surface is a
// reflection grating whose grooves run tangentially. Light can only reach the
// eye from that grating when (L + V) has no tangential component; its radial
// component picks the wavelength of each order: λ = p · |(L+V)·g| / m.
const discFragment = /* glsl */ `
  uniform float uPitch;
  uniform vec3 uBase;
  uniform float uMirror;
  uniform float uIrid;
  uniform vec3 uHub;
  uniform vec3 uKey;
  uniform vec3 uKeyCol;
  varying vec3 vWorld;
  varying vec3 vNormalW;
  varying vec3 vRadialW;
  varying float vR;

  vec3 bump3y(vec3 x, vec3 yoffset) {
    vec3 y = 1.0 - x * x;
    return clamp(y - yoffset, 0.0, 1.0);
  }
  // Zucconi's fit of the visible spectrum
  vec3 spectral(float w) {
    float x = clamp((w - 400.0) / 300.0, 0.0, 1.0);
    const vec3 cs = vec3(3.54541723, 2.86670055, 2.29421995);
    const vec3 xs = vec3(0.69548916, 0.49416934, 0.28269708);
    const vec3 ys = vec3(0.02320775, 0.15936245, 0.53520021);
    return bump3y(cs * (x - xs), ys);
  }
  // soft studio: bright top, a softbox front-left, dim floor
  vec3 env(vec3 r) {
    // white studio, like the page around the case
    float sky = smoothstep(-0.6, 0.9, r.y);
    vec3 c = mix(vec3(0.42), vec3(1.05), sky);
    c += vec3(1.4) * smoothstep(0.82, 0.97, dot(r, normalize(vec3(-0.45, 0.55, 0.7))));
    c += vec3(0.6) * smoothstep(0.88, 0.99, dot(r, normalize(vec3(0.7, 0.2, 0.68))));
    return c;
  }
  vec3 grating(vec3 L, vec3 V, vec3 N, vec3 g, vec3 t, vec3 col) {
    vec3 S = L + V;
    float st = dot(S, t);
    float sg = abs(dot(S, g));
    float lit = max(dot(N, L), 0.0) * max(dot(N, V), 0.0);
    float along = exp(-st * st / 0.012);
    vec3 acc = vec3(0.0);
    for (int m = 1; m <= 3; m++) {
      float lambda = uPitch * 1000.0 * sg / float(m);
      if (lambda > 380.0 && lambda < 760.0) acc += spectral(lambda) / float(m);
    }
    return acc * along * col * sqrt(lit) * 1.6;
  }
  void main() {
    vec3 N = normalize(vNormalW);
    vec3 V = normalize(cameraPosition - vWorld);
    if (!gl_FrontFacing) N = -N;
    vec3 g = normalize(vRadialW - N * dot(vRadialW, N));
    vec3 t = normalize(cross(N, g));
    vec3 R = reflect(-V, N);
    float nv = clamp(dot(N, V), 0.0, 1.0);
    float fres = 0.04 + 0.96 * pow(1.0 - nv, 5.0);

    // zones (mm): clear hub, mirror band, data area, clear lip
    float data = smoothstep(22.3, 22.8, vR) * (1.0 - smoothstep(58.2, 58.6, vR));
    float metal = smoothstep(16.6, 17.2, vR) * (1.0 - smoothstep(58.6, 59.0, vR));

    vec3 mirror = env(R) * uBase * uMirror;
    vec3 H = normalize(uKey + V);
    mirror += uKeyCol * uBase * pow(max(dot(N, H), 0.0), 600.0) * 3.0;

    vec3 irid = grating(uKey, V, N, g, t, uKeyCol);
    irid += grating(normalize(vec3(-0.45, 0.55, 0.7)), V, N, g, t, vec3(0.9));
    irid += grating(normalize(vec3(0.0, 1.0, 0.1)), V, N, g, t, vec3(0.55));
    irid += grating(normalize(vec3(0.7, 0.2, 0.68)), V, N, g, t, vec3(0.4));

    vec3 col = mirror + irid * uIrid * data * mix(vec3(1.0), uBase * 1.6 + 0.25, 0.35);
    vec3 clear = uHub * (0.1 + 0.25 * env(R));
    col = mix(clear, col, metal);
    // polycarbonate top layer reflects like glass
    col += env(R) * fres * 0.9;
    float a = mix(0.32 + fres * 0.5, 1.0, metal);
    gl_FragColor = vec4(col, a);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

export function buildDisc(spec: DiscSpec, label: THREE.Texture | null, keyDir: THREE.Vector3, tilt: number) {
  const group = new THREE.Group()
  const body = new THREE.Group()
  group.add(body)
  const T = 1.2
  const LABEL_OUT = DISC_R - 0.9

  // printed face (photo), from the hub ring to just inside the clear lip
  if (label) {
    const g = new THREE.RingGeometry(spec.hubR * DISC_R, LABEL_OUT, 160, 1)
    const pos = g.attributes.position as THREE.BufferAttribute
    const uv = g.attributes.uv as THREE.BufferAttribute
    for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / (DISC_R * 2) + 0.5, pos.getY(i) / (DISC_R * 2) + 0.5)
    uv.needsUpdate = true
    const mat = new THREE.MeshPhysicalMaterial({
      map: label,
      roughness: spec.inkRough,
      metalness: 0,
      clearcoat: spec.format === "dvd" ? 0.05 : 0.35,
      clearcoatRoughness: 0.3,
    })
    const m = new THREE.Mesh(g, mat)
    m.position.z = T
    m.rotation.z = tilt
    m.castShadow = true
    m.receiveShadow = true
    body.add(m)
  }

  // clear polycarbonate around the hub (top), with the stacking ring
  const hubMat = new THREE.MeshPhysicalMaterial({
    color: srgb(spec.hubTint),
    roughness: 0.12,
    metalness: 0,
    transparent: true,
    opacity: spec.format === "dvd" ? 0.72 : 0.38,
    clearcoat: 1,
    side: THREE.DoubleSide,
    depthWrite: false,
  })
  const hub = new THREE.Mesh(new THREE.RingGeometry(HOLE_R, spec.hubR * DISC_R, 96, 1), hubMat)
  hub.position.z = T
  hub.renderOrder = 2
  body.add(hub)
  const stack = new THREE.Mesh(new THREE.TorusGeometry(spec.hubR * DISC_R * 0.62, 0.32, 6, 96), hubMat)
  stack.position.z = T
  stack.scale.z = 0.6
  body.add(stack)

  // clear lip at the very edge (top)
  const lip = new THREE.Mesh(new THREE.RingGeometry(LABEL_OUT, DISC_R, 160, 1), hubMat)
  lip.position.z = T
  body.add(lip)

  // read side: diffraction grating shader
  const readMat = new THREE.ShaderMaterial({
    vertexShader: discVertex,
    fragmentShader: discFragment,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: true,
    uniforms: {
      uPitch: { value: spec.pitch },
      uBase: { value: srgb(spec.base) },
      uMirror: { value: spec.mirror },
      uIrid: { value: spec.irid },
      uHub: { value: srgb(spec.hubTint) },
      uKey: { value: keyDir.clone().normalize() },
      uKeyCol: { value: new THREE.Color(1, 1, 1) },
    },
  })
  const read = new THREE.Mesh(new THREE.RingGeometry(HOLE_R, DISC_R, 192, 8), readMat)
  read.rotation.y = Math.PI // faces −Z
  read.position.z = 0.02
  read.renderOrder = 1
  body.add(read)

  // rim: moulded polycarbonate edge
  const rimMat = new THREE.MeshPhysicalMaterial({ color: srgb(spec.edge), roughness: 0.22, metalness: 0.55, clearcoat: 1 })
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(DISC_R, DISC_R, T, 160, 1, true), rimMat)
  rim.rotation.x = Math.PI / 2
  rim.position.z = T / 2
  rim.castShadow = true
  body.add(rim)
  const hole = new THREE.Mesh(new THREE.CylinderGeometry(HOLE_R, HOLE_R, T, 48, 1, true), hubMat)
  hole.rotation.x = Math.PI / 2
  hole.position.z = T / 2
  body.add(hole)

  // hit area for taps: the whole disc (hole included), a little larger than
  // the disc so it is easy to catch with a finger; never drawn
  const pick = new THREE.Mesh(new THREE.CircleGeometry(DISC_R + 4, 48), new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false, transparent: true, opacity: 0, side: THREE.DoubleSide }))
  pick.position.z = T / 2
  pick.name = "pick"
  body.add(pick)

  return { group, body, pick }
}

// ── Case ─────────────────────────────────────────────────────────────────────
// Three layers on every outer face, like the real thing:
//  A. the moulded plastic shell (edges, corners, hinges, catches),
//  B. the printed paper insert — matte, it never shines by itself,
//  C. the clear sleeve over it — a separate sheet 0.35 mm above the paper
//     that only adds reflections (additive, no colour of its own) and is
//     very slightly wavy, so highlights ripple a little as the case turns.

// Gentle waviness for the clear sleeve (roughness + bump), generated once.
let filmTex: THREE.CanvasTexture | null = null
export function sleeveTexture() {
  if (filmTex) return filmTex
  const S = 256
  const c = document.createElement("canvas")
  c.width = c.height = S
  const x = c.getContext("2d")!
  const img = x.createImageData(S, S)
  for (let j = 0; j < S; j++)
    for (let i = 0; i < S; i++) {
      const u = i / S
      const v = j / S
      const w =
        0.5 +
        0.22 * Math.sin((u * 2 + v * 1) * Math.PI * 2) +
        0.16 * Math.sin((v * 3 - u * 1) * Math.PI * 2 + 1.3) +
        0.08 * Math.sin((u * 7 + v * 5) * Math.PI * 2 + 0.4) +
        (Math.random() - 0.5) * 0.04
      const g = Math.round(Math.min(1, Math.max(0, w)) * 255)
      const k = (j * S + i) * 4
      img.data[k] = img.data[k + 1] = img.data[k + 2] = g
      img.data[k + 3] = 255
    }
  x.putImageData(img, 0, 0)
  filmTex = new THREE.CanvasTexture(c)
  filmTex.wrapS = filmTex.wrapT = THREE.RepeatWrapping
  filmTex.repeat.set(1.5, 2)
  return filmTex
}
export function disposeSleeveTexture() {
  filmTex?.dispose()
  filmTex = null
}

function materials(spec: CaseSpec, wrap: THREE.Texture): Mats {
  const translucent = spec.opacity < 1
  const shell = new THREE.MeshPhysicalMaterial({
    color: srgb(spec.plastic),
    roughness: translucent ? 0.2 : 0.38,
    metalness: 0,
    clearcoat: translucent ? 0.6 : 0.3,
    clearcoatRoughness: 0.2,
    transparent: translucent,
    opacity: translucent ? Math.min(0.85, spec.opacity + 0.18) : 1,
    side: THREE.DoubleSide,
  })
  const panel = new THREE.MeshPhysicalMaterial({
    color: srgb(spec.inner),
    roughness: translucent ? 0.3 : 0.62,
    metalness: 0,
    clearcoat: translucent ? 0.35 : 0.08,
    clearcoatRoughness: 0.25,
  })
  const lift = (c: number[]) => c.map((v) => Math.min(1, v)) as [number, number, number]
  const detail = new THREE.MeshPhysicalMaterial({
    color: srgb(translucent ? lift(spec.plastic.map((c) => c * 0.85 + 0.04)) : lift(spec.inner.map((c) => c * 1.25))),
    roughness: translucent ? 0.16 : 0.45,
    metalness: 0,
    clearcoat: translucent ? 0.9 : 0.25,
    transparent: translucent,
    opacity: translucent ? Math.min(0.92, spec.opacity + 0.28) : 1,
  })
  // B. paper: matte print
  const insert = new THREE.MeshStandardMaterial({ map: wrap, roughness: 0.86, metalness: 0 })
  // C. clear sleeve: reflections only
  const wave = sleeveTexture()
  const film = new THREE.MeshPhysicalMaterial({
    color: 0x000000,
    roughness: 0.26,
    roughnessMap: wave,
    bumpMap: wave,
    bumpScale: 0.5,
    metalness: 0,
    ior: 1.5,
    specularIntensity: 1,
    envMapIntensity: 4.2,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const paperBack = new THREE.MeshStandardMaterial({ color: srgb(spec.inner), roughness: 0.8 })
  return { shell, panel, detail, insert, film, paperBack }
}

// Outline of one half, seen from outside: rounder corners on the opening
// side, tight ones at the spine; Blu-ray halves get the thumb recess in the
// middle of the opening edge.
function halfShape(W: number, H: number, rOpen: number, rHinge: number, inset: number, notch: boolean) {
  const s = new THREE.Shape()
  const x0 = inset
  const x1 = W - inset
  const y0 = -H / 2 + inset
  const y1 = H / 2 - inset
  const ro = Math.max(0.1, rOpen - inset)
  const rh = Math.max(0.1, rHinge - inset)
  s.moveTo(x0 + rh, y0)
  s.lineTo(x1 - ro, y0)
  s.quadraticCurveTo(x1, y0, x1, y0 + ro)
  if (notch) {
    const n = 11 // half length of the recess
    const d = 1.1 // depth
    s.lineTo(x1, -n - 3)
    s.bezierCurveTo(x1, -n - 1, x1 - d, -n, x1 - d, -n + 2)
    s.lineTo(x1 - d, n - 2)
    s.bezierCurveTo(x1 - d, n, x1, n + 1, x1, n + 3)
  }
  s.lineTo(x1, y1 - ro)
  s.quadraticCurveTo(x1, y1, x1 - ro, y1)
  s.lineTo(x0 + rh, y1)
  s.quadraticCurveTo(x0, y1, x0, y1 - rh)
  s.lineTo(x0, y0 + rh)
  s.quadraticCurveTo(x0, y0, x0 + rh, y0)
  return s
}

function extrude(shape: THREE.Shape, depth: number, bevel: number, mat: THREE.Material) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.05, depth - bevel * 2),
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: 10,
  })
  g.translate(0, 0, bevel)
  const m = new THREE.Mesh(g, mat)
  m.castShadow = true
  m.receiveShadow = true
  return m
}

// The raised frame around the sleeve on an outer face: top, bottom and the
// opening edge (the sleeve continues round the spine, so no frame there).
// Built in the XY plane rising towards +Z from z = 0.
function sleeveFrame(W: number, H: number, e: EdgeSpec, mat: THREE.Material) {
  const s = new THREE.Shape()
  const r = Math.max(0.4, e.corner - 0.6)
  const lw = e.lipW
  const top = H / 2 - 0.4
  const right = W - 0.4
  s.moveTo(0, top)
  s.lineTo(right - r, top)
  s.quadraticCurveTo(right, top, right, top - r)
  s.lineTo(right, -top + r)
  s.quadraticCurveTo(right, -top, right - r, -top)
  s.lineTo(0, -top)
  s.lineTo(0, -top + lw)
  s.lineTo(right - lw - r * 0.5, -top + lw)
  s.quadraticCurveTo(right - lw, -top + lw, right - lw, -top + lw + r * 0.5)
  s.lineTo(right - lw, top - lw - r * 0.5)
  s.quadraticCurveTo(right - lw, top - lw, right - lw - r * 0.5, top - lw)
  s.lineTo(0, top - lw)
  s.lineTo(0, top)
  const g = new THREE.ExtrudeGeometry(s, { depth: e.lipH, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.12, bevelSegments: 2, curveSegments: 8 })
  const m = new THREE.Mesh(g, mat)
  m.castShadow = true
  m.receiveShadow = true
  return m
}

// Paper + clear sleeve for one outer face, facing +Z from z = 0 (the face of
// the plastic); callers orient it.
function coverLayers(w: number, h: number, u0: number, u1: number, M: Mats, gap: number) {
  const g = new THREE.Group()
  const paper = insertPlane(w, h, u0, u1, M.insert)
  paper.position.z = 0.05
  g.add(paper)
  const film = new THREE.Mesh(new THREE.PlaneGeometry(w + 0.6, h + 0.6), M.film)
  film.position.z = 0.05 + gap
  film.renderOrder = 3
  g.add(film)
  return g
}

export function buildCase(platform: PlatformId, wrap: THREE.Texture, labels: (THREE.Texture | null)[], keyDir: THREE.Vector3): CaseRig {
  const spec = cases[platform]
  const dspec = discs[platform]
  const e = spec.edge
  const M = materials(spec, wrap)
  const { h: H, d: D } = spec
  const t = spec.wall
  const W = spec.w - t // each half, the spine takes up the rest
  const hw = (D - 2 * t - e.seamGap) / 2 // wall height of each half
  const root = new THREE.Group()
  const SLEEVE_GAP = 0.35

  // A half, built in its own frame: outer face at z = 0 (facing −Z),
  // panel z 0…t, walls rising to t + hw. Used as is for the tray side and
  // mirrored in depth for the cover side.
  const buildHalf = (isLid: boolean) => {
    const g = new THREE.Group()
    const panel = extrude(halfShape(W, H, e.corner, e.hingeCorner, 0, e.thumbNotch), t, Math.min(e.bevel, t / 2 - 0.05), M.panel)
    g.add(panel)
    // walls: the outline minus its inside, so corners have real thickness
    const ring = halfShape(W, H, e.corner, e.hingeCorner, 0, e.thumbNotch)
    ring.holes.push(halfShape(W, H, Math.max(0.6, e.corner - spec.wall), Math.max(0.3, e.hingeCorner - 0.4), spec.wall, false))
    const walls = extrude(ring, hw + 0.6, Math.min(e.bevel * 0.6, 0.5), M.shell)
    walls.position.z = t - 0.6
    g.add(walls)
    if (e.nubs) {
      // Amaray snap nubs on the inside of the opening wall
      for (const y of [H * 0.3, -H * 0.3]) {
        const nub = new THREE.Mesh(new THREE.SphereGeometry(isLid ? 1.0 : 0.8, 16, 10), M.shell)
        nub.position.set(W - spec.wall - 0.5, y, t + hw - 1.2)
        nub.scale.set(0.7, 2.4, 1)
        g.add(nub)
      }
    } else {
      // Blu-ray: moulded catches on the top and bottom walls near the opening edge
      for (const s of [1, -1]) {
        const c = box(7, 1.4, 1.6, 0.4, M.shell)
        c.position.set(W - 12, s * (H / 2 - spec.wall - 0.6), t + hw - 0.9)
        g.add(c)
      }
    }
    return g
  }

  // ── back half (tray side) ──
  const back = new THREE.Group()
  root.add(back)
  back.add(buildHalf(false))
  {
    // outside face: frame + paper + sleeve, facing −Z (rotation only, the
    // u range runs from the far edge to the spine so the print reads right)
    const out = new THREE.Group()
    out.rotation.y = Math.PI
    out.position.x = W
    back.add(out)
    const frame = sleeveFrame(W, H, e, M.shell)
    frame.scale.x = -1 // frame's open side must stay at the spine (x = W in this flipped frame)
    frame.position.x = W
    out.add(frame)
    const layers = coverLayers(W - e.lipW - 0.8, H - 2 * e.lipW - 0.8, 0, SPINE_U0, M, SLEEVE_GAP)
    layers.position.set(W - (W - e.lipW) / 2 + 0.2, 0, 0)
    out.add(layers)
  }

  // ── spine ──
  const spine = new THREE.Group()
  spine.position.set(0, 0, t / 2)
  root.add(spine)
  {
    const round = e.spineRadius > 2 // Blu-ray: thicker, softly rounded spine
    const st = t + (round ? 0.5 : 0)
    const p = box(st, H - 0.2, D, Math.min(e.spineRadius, st / 2 - 0.01), M.panel)
    p.position.set(-st / 2, 0, D / 2 - t / 2)
    spine.add(p)
    const layers = coverLayers(D - 1.2, H - 2 * e.lipW - 0.8, SPINE_U0, SPINE_U1, M, SLEEVE_GAP * 0.6)
    layers.rotation.y = -Math.PI / 2
    layers.position.set(-st, 0, D / 2 - t / 2)
    spine.add(layers)
    // the sleeve frame continues across the spine at top and bottom
    for (const s of [1, -1]) {
      const cap = box(e.lipH + 0.3, e.lipW, D - 0.4, 0.15, M.shell)
      cap.position.set(-st - e.lipH / 2 + 0.1, s * (H / 2 - 0.4 - e.lipW / 2), D / 2 - t / 2)
      spine.add(cap)
    }
    // living hinges: rounded knuckles along each fold line; Amaray spines
    // also show a groove next to each hinge
    for (const z of [0, D - t]) {
      const k = new THREE.Mesh(new THREE.CylinderGeometry(t * 0.62, t * 0.62, H - 1.5, 20), M.shell)
      k.position.set(0, 0, z)
      k.castShadow = true
      spine.add(k)
      if (!round) {
        const groove = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, H - 6, 8), M.detail)
        groove.position.set(-t * 0.5, 0, z === 0 ? 1.6 : D - t - 1.6)
        spine.add(groove)
      }
    }
    // the two moulded dimples on the inside of Blu-ray spines
    if (spec.hub === "petal") {
      for (const y of [H * 0.22, -H * 0.22]) {
        const dimple = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.5, 24), M.detail)
        dimple.rotation.z = Math.PI / 2
        dimple.position.set(0.1, y, D / 2 - t / 2)
        spine.add(dimple)
      }
    }
  }

  // ── front lid (cover side) ──
  const lid = new THREE.Group()
  lid.position.set(0, 0, D - t)
  spine.add(lid)
  {
    // mirror in depth: (x, y, z) → (x, y, t/2 − z), so the half's outer face
    // lands on the lid's +Z side (the front cover) and its walls point inward
    const inner = new THREE.Group()
    inner.rotation.y = Math.PI
    inner.scale.x = -1
    inner.position.z = t / 2
    lid.add(inner)
    inner.add(buildHalf(true))
    // booklet clips near the opening edge (they hold the manual)
    for (const s of [1, -1]) {
      const c = clip(M.detail, s)
      c.position.set(W - 4, s * (H / 2 - 16), t)
      inner.add(c)
      if (spec.hub === "petal") {
        const rib = box(W - 40, 1.2, 1.2, 0.4, M.detail)
        rib.position.set(W / 2 - 4, s * (H / 2 - 9), t + 0.6)
        inner.add(rib)
      }
    }
    // outside (not mirrored, so the print reads correctly): frame + paper + sleeve
    const frame = sleeveFrame(W, H, e, M.shell)
    frame.position.z = t / 2
    lid.add(frame)
    const layers = coverLayers(W - e.lipW - 0.8, H - 2 * e.lipW - 0.8, SPINE_U1, 1, M, SLEEVE_GAP)
    layers.position.set((W - e.lipW) / 2 - 0.2, 0, t / 2)
    lid.add(layers)
  }

  // ── tray: hub, ring, platform extras ──
  const discRigs: DiscRig[] = []
  const trayOn = (parent: THREE.Group, cx: number, cy: number, z: number) => {
    const g = new THREE.Group()
    g.position.set(cx, cy, z)
    parent.add(g)
    if (spec.hub === "petal") g.add(petalHub(M.detail))
    else g.add(buttonHub(M.detail, spec.hub === "ps2" ? 8 : 10))
    if (spec.tray === "ring") g.add(trayRing(M.detail, 62.5, true))
    if (spec.tray === "dish") g.add(trayRing(M.detail, 61.8, false))
    if (spec.tray === "flat") {
      // PS2: low ring of supports under the disc edge
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2
        const s = box(4, 1.6, 1.4, 0.4, M.detail)
        s.position.set(Math.cos(a) * 52, Math.sin(a) * 52, 0.7)
        s.rotation.z = a + Math.PI / 2
        g.add(s)
      }
    }
    return g
  }

  const discZ = t + 2.45 // resting on the hub boss
  const backCx = W / 2 + 1
  trayOn(back, backCx, spec.discY, t)

  if (spec.memoryCard) {
    // PS2 memory-card holder, upper part of the tray side
    const mc = new THREE.Group()
    mc.position.set(backCx, H / 2 - 34, t)
    back.add(mc)
    const fw = 50
    const fh = 42
    for (const [x, y, w, h] of [
      [0, fh / 2, fw, 2.4],
      [0, -fh / 2, fw, 2.4],
      [fw / 2, 0, 2.4, fh],
      [-fw / 2, 0, 2.4, fh],
    ] as const) {
      const b = box(w, h, 3.2, 0.5, M.detail)
      b.position.set(x, y, 1.6)
      mc.add(b)
    }
    const floor = box(fw - 4, fh - 4, 0.6, 0.3, M.detail)
    floor.position.z = 0.3
    mc.add(floor)
    for (const s of [1, -1]) {
      const tab = box(8, 3, 3.6, 0.6, M.detail)
      tab.position.set(s * (fw / 2 - 6), fh / 2 + 1.6, 1.8)
      mc.add(tab)
    }
  }

  if (labels.length >= 2) {
    // second tray on the inside of the front cover
    const lidTray = new THREE.Group()
    lidTray.rotation.y = Math.PI
    lidTray.scale.x = -1
    lid.add(lidTray)
    trayOn(lidTray, backCx, spec.discY, t / 2)
  }

  labels.forEach((label, i) => {
    const onLid = i === 1
    const { group, body, pick } = buildDisc(dspec, label, keyDir, onLid ? 0.14 : -0.06)
    if (!onLid) {
      group.position.set(backCx, spec.discY, discZ)
      back.add(group)
    } else {
      // rotation only (no mirroring), so the print reads correctly
      const holder = new THREE.Group()
      holder.rotation.y = Math.PI
      lid.add(holder)
      group.position.set(-backCx, spec.discY, t / 2 + 2.45)
      holder.add(group)
    }
    discRigs.push({ group, body, pick, rest: group.position.clone(), side: onLid ? "lid" : "back" })
  })

  const setOpen = (k: number) => {
    const a = (-Math.PI / 2) * k
    spine.rotation.y = a
    lid.rotation.y = a
  }
  setOpen(0)

  return {
    root,
    spine,
    lid,
    discs: discRigs,
    spec,
    closedCenter: new THREE.Vector3(W / 2 - t / 2, 0, D / 2),
    frontCenter: new THREE.Vector3(W / 2 - t / 2, 0, D),
    openCenter: new THREE.Vector3(-D / 2, 0, t / 2 + 2),
    setOpen,
  }
}
