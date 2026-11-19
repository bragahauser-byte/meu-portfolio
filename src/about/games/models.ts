import * as THREE from "three"
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js"
import { cases, discs, DISC_R, HOLE_R, SPINE_U0, SPINE_U1 } from "./platforms"
import type { CaseSpec, DiscSpec, PlatformId } from "./platforms"

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
  rest: THREE.Vector3
  side: "back" | "lid"
}

type Mats = {
  shell: THREE.Material // walls, rims, clips: the plastic itself
  panel: THREE.Material // the big faces: paper behind plastic, or black plastic
  detail: THREE.Material // hub, tray ring
  insert: THREE.Material // printed cover under the clear sleeve
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

  return { group, body }
}

// ── Case ─────────────────────────────────────────────────────────────────────

function materials(spec: CaseSpec, wrap: THREE.Texture): Mats {
  const translucent = spec.opacity < 1
  const shell = new THREE.MeshPhysicalMaterial({
    color: srgb(spec.plastic),
    roughness: translucent ? 0.18 : 0.42,
    metalness: 0,
    clearcoat: translucent ? 0.8 : 0.25,
    clearcoatRoughness: 0.18,
    transparent: translucent,
    opacity: spec.opacity,
    side: THREE.DoubleSide,
  })
  const panel = new THREE.MeshPhysicalMaterial({
    color: srgb(spec.inner),
    roughness: translucent ? 0.3 : 0.55,
    metalness: 0,
    clearcoat: translucent ? 0.35 : 0.12,
    clearcoatRoughness: 0.2,
  })
  const detail = new THREE.MeshPhysicalMaterial({
    color: srgb(translucent ? spec.plastic.map((c) => Math.min(1, c * 0.85 + 0.04)) as [number, number, number] : spec.inner),
    roughness: translucent ? 0.16 : 0.5,
    metalness: 0,
    clearcoat: translucent ? 0.9 : 0.2,
    transparent: translucent,
    opacity: translucent ? Math.min(0.92, spec.opacity + 0.28) : 1,
  })
  const insert = new THREE.MeshPhysicalMaterial({
    map: wrap,
    roughness: 0.6,
    metalness: 0,
    clearcoat: 0.55, // the clear outer sleeve over the printed insert
    clearcoatRoughness: 0.12,
  })
  const paperBack = new THREE.MeshStandardMaterial({ color: srgb(spec.inner), roughness: 0.8 })
  return { shell, panel, detail, insert, paperBack }
}

export function buildCase(platform: PlatformId, wrap: THREE.Texture, labels: (THREE.Texture | null)[], keyDir: THREE.Vector3): CaseRig {
  const spec = cases[platform]
  const dspec = discs[platform]
  const M = materials(spec, wrap)
  const { h: H, d: D } = spec
  const t = spec.wall
  const W = spec.w - t // each half, the spine takes up the rest
  const hw = (D - 2 * t) / 2 - 0.3 // wall height of each half
  const margin = 2.2 // plastic visible around the insert
  const root = new THREE.Group()

  // ── back half (tray side) ──
  const back = new THREE.Group()
  root.add(back)
  {
    const p = box(W, H, t, 0.5, M.panel)
    p.position.set(W / 2, 0, t / 2)
    back.add(p)
    addWalls(back, W, H, t, hw, M.shell, 1)
    // outside: printed back cover (u 0 → spine)
    const ins = insertPlane(W - margin, H - margin * 2, 0, SPINE_U0, M.insert)
    ins.rotation.y = Math.PI
    ins.position.set(W / 2 - margin / 2, 0, -0.06)
    back.add(ins)
    addClosure(back, W, H, t, hw, M.shell)
  }

  // ── spine ──
  const spine = new THREE.Group()
  spine.position.set(0, 0, t / 2)
  root.add(spine)
  {
    const p = box(t, H, D, 0.5, M.panel)
    p.position.set(-t / 2, 0, D / 2 - t / 2)
    spine.add(p)
    const ins = insertPlane(D - 0.6, H - margin * 2, SPINE_U0, SPINE_U1, M.insert)
    ins.rotation.y = -Math.PI / 2
    ins.position.set(-t - 0.06, 0, D / 2 - t / 2)
    spine.add(ins)
    // top / bottom caps of the spine
    for (const s of [1, -1]) {
      const cap = box(t + 0.2, t, D, 0.4, M.shell)
      cap.position.set(-t / 2, s * (H / 2 - t / 2), D / 2 - t / 2)
      spine.add(cap)
    }
    // living hinges: rounded knuckles along each fold line
    for (const z of [0, D - t]) {
      const k = new THREE.Mesh(new THREE.CylinderGeometry(t * 0.62, t * 0.62, H - 1, 20), M.shell)
      k.position.set(0, 0, z)
      k.castShadow = true
      spine.add(k)
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
    const inner = new THREE.Group() // lid contents built facing −Z (towards the tray)
    inner.rotation.y = Math.PI
    inner.scale.x = -1 // keep +x running from the hinge to the opening edge
    lid.add(inner)
    const p = box(W, H, t, 0.5, M.panel)
    p.position.set(W / 2, 0, 0)
    inner.add(p)
    const wallsG = new THREE.Group()
    wallsG.position.z = -t / 2 // addWalls starts at z = t: the panel's inner face here is t/2
    addWalls(wallsG, W, H, t, hw, M.shell, 1)
    inner.add(wallsG)
    // booklet clips near the opening edge (they hold the manual)
    for (const s of [1, -1]) {
      const c = clip(M.detail, s)
      c.position.set(W - 4, s * (H / 2 - 16), t / 2)
      inner.add(c)
      if (spec.hub === "petal") {
        // long moulded ribs along the top and bottom
        const rib = box(W - 40, 1.2, 1.2, 0.4, M.detail)
        rib.position.set(W / 2 - 4, s * (H / 2 - 9), t / 2 + 0.6)
        inner.add(rib)
      }
    }
    // outside: printed front cover
    const ins = insertPlane(W - margin, H - margin * 2, SPINE_U1, 1, M.insert)
    ins.position.set(W / 2 - margin / 2, 0, t / 2 + 0.06)
    lid.add(ins)
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
    // finger notch tabs
    for (const s of [1, -1]) {
      const tab = box(8, 3, 3.6, 0.6, M.detail)
      tab.position.set(s * (fw / 2 - 6), fh / 2 + 1.6, 1.8)
      mc.add(tab)
    }
  }

  const twoDiscs = labels.length >= 2
  if (twoDiscs) {
    // second tray on the inside of the front cover
    const lidTray = new THREE.Group()
    lidTray.rotation.y = Math.PI
    lidTray.scale.x = -1
    lid.add(lidTray)
    trayOn(lidTray, backCx, spec.discY, t / 2)
  }

  labels.forEach((label, i) => {
    const onLid = i === 1
    const { group, body } = buildDisc(dspec, label, keyDir, onLid ? 0.14 : -0.06)
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
    discRigs.push({ group, body, rest: group.position.clone(), side: onLid ? "lid" : "back" })
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

// Walls of one half: top, bottom and the opening edge; the hinge side is
// closed by the spine.
function addWalls(g: THREE.Group, W: number, H: number, t: number, hw: number, mat: THREE.Material, dir: number) {
  for (const s of [1, -1]) {
    const w = box(W, t, hw, 0.45, mat)
    w.position.set(W / 2, s * (H / 2 - t / 2), (t + hw / 2) * dir)
    g.add(w)
  }
  const e = box(t, H, hw, 0.45, mat)
  e.position.set(W - t / 2, 0, (t + hw / 2) * dir)
  g.add(e)
}

// Snap-fit: small catches on the opening edge that click the lid shut.
function addClosure(g: THREE.Group, W: number, H: number, t: number, hw: number, mat: THREE.Material) {
  for (const y of [H * 0.32, -H * 0.32]) {
    const c = box(1.6, 9, 1.4, 0.4, mat)
    c.position.set(W - t - 0.9, y, t + hw - 0.5)
    g.add(c)
  }
}
