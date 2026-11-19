import * as THREE from "three"
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js"
import { buildCase } from "./models"
import type { CaseRig } from "./models"
import type { PlatformId } from "./platforms"

// ── Game case viewer (WebGL) ─────────────────────────────────────────────────
// One renderer per opened case, created on click and destroyed on close.
// Rendering is on demand: frames are drawn only while something moves (a
// tween, a drag, inertia, a zoom), never while the case just sits there.
//
// Motion: the case flies out of its exact place on the shelf (the CSS box's
// screen rectangle) to the centre, opens on its two hinges, and can then be
// turned freely by hand. Closing plays the same path backwards.

export type Tier = "high" | "low"

export type SceneOptions = {
  canvas: HTMLCanvasElement
  platform: PlatformId
  wrapUrl: string
  discUrls: string[]
  reducedMotion: boolean
  tier: Tier
  onInteract?: () => void
}

export type GameScene = {
  ready: Promise<void>
  flyIn: (rect: DOMRect) => Promise<void>
  open: () => Promise<void>
  close: (rect: DOMRect | null, onFly?: () => void) => Promise<void>
  toggleDiscs: () => boolean
  hasDiscs: boolean
  reset: () => void
  rotateBy: (yaw: number, pitch: number) => void
  zoomBy: (f: number) => void
  dispose: () => void
}

const FOV = 26
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
// opening: starts like a snap-fit letting go, then a slow settle
const easeHinge = (t: number) => {
  const k = t < 0.12 ? (t / 0.12) * 0.06 : 0.06 + 0.94 * easeOut((t - 0.12) / 0.88)
  return clamp(k, 0, 1)
}

type Tween = { from: number; to: number; dur: number; t0: number; ease: (t: number) => number; set: (v: number) => void; done: () => void }

function loadTexture(loader: THREE.TextureLoader, url: string, aniso: number) {
  return new Promise<THREE.Texture>((resolve, reject) => {
    loader.load(
      url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace
        tex.anisotropy = aniso
        resolve(tex)
      },
      undefined,
      reject,
    )
  })
}

export function createGameScene(opts: SceneOptions): GameScene {
  const { canvas, tier, reducedMotion } = opts
  const dpr = Math.min(window.devicePixelRatio || 1, tier === "high" ? 2 : 1.5)

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: dpr < 2,
    alpha: true,
    powerPreference: tier === "high" ? "high-performance" : "low-power",
  })
  renderer.setPixelRatio(dpr)
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.NeutralToneMapping
  renderer.toneMappingExposure = 1.0
  renderer.shadowMap.enabled = tier === "high"
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = envTex
  // turn the room so its bright panels sit above and to the side, not right
  // behind the camera — otherwise every face-on surface gets a white veil
  scene.environmentIntensity = 0.42
  scene.environmentRotation.set(0.5, 2.4, 0)

  const camera = new THREE.PerspectiveCamera(FOV, 1, 10, 6000)

  // key light high front-left (soft shadows of hub and disc on the tray),
  // a cool fill from the right, and the room environment for reflections
  const keyPos = new THREE.Vector3(-180, 260, 420)
  const key = new THREE.DirectionalLight(0xffffff, 1.7)
  key.position.copy(keyPos)
  key.castShadow = tier === "high"
  key.shadow.mapSize.set(2048, 2048)
  key.shadow.camera.left = -220
  key.shadow.camera.right = 220
  key.shadow.camera.top = 220
  key.shadow.camera.bottom = -220
  key.shadow.camera.near = 50
  key.shadow.camera.far = 1200
  key.shadow.bias = -0.0004
  key.shadow.normalBias = 0.6
  key.shadow.radius = 4
  scene.add(key)
  const fill = new THREE.DirectionalLight(0xdfe8ff, 0.45)
  fill.position.set(300, 40, 200)
  scene.add(fill)
  scene.add(new THREE.HemisphereLight(0xffffff, 0x9a9a9a, 0.35))

  const pivot = new THREE.Group() // screen position + presentation + user rotation
  const model = new THREE.Group() // centres the case on the pivot
  pivot.add(model)
  scene.add(pivot)

  let rig: CaseRig | null = null
  const textures: THREE.Texture[] = []

  // ── state ──
  const st = {
    fly: 0, // 0 = on the shelf, 1 = centred
    open: 0,
    lift: 0,
    zoom: 1,
    zoomTarget: 1,
    start: new THREE.Vector3(),
    startDist: 1,
  }
  const user = new THREE.Quaternion()
  const vel = { x: 0, y: 0 }
  let dragging = false
  let fitDist = 800
  let disposed = false
  let raf = 0
  let lastT = performance.now()
  const tweens: Tween[] = []

  const tween = (from: number, to: number, dur: number, ease: (t: number) => number, set: (v: number) => void) =>
    new Promise<void>((resolve) => {
      if (reducedMotion) dur = Math.min(dur, 180)
      tweens.push({ from, to, dur, t0: performance.now(), ease, set, done: resolve })
      invalidate()
    })

  // ── presentation pose ──
  const qA = new THREE.Quaternion()
  const qB = new THREE.Quaternion()
  const qC = new THREE.Quaternion()
  const eShelf = new THREE.Euler(-0.035, 0.07, 0)
  const eClosed = new THREE.Euler(-0.08, 0.42, 0.0)
  const eOpen = new THREE.Euler(-0.2, -0.08, 0.0)

  // ── layout ──
  const size = { w: 1, h: 1 }
  let portrait = false
  const resize = () => {
    size.w = window.innerWidth
    size.h = window.innerHeight
    renderer.setSize(size.w, size.h, false)
    camera.aspect = size.w / size.h
    const tan = Math.tan(THREE.MathUtils.degToRad(FOV / 2))
    const spec = rig?.spec
    // phones in portrait: present the open case standing up (cover on top,
    // tray below), so it fills the tall screen instead of a thin strip
    portrait = camera.aspect < 0.85
    eOpen.z = portrait ? -Math.PI / 2 : 0
    const wide = spec ? spec.w * 2 + spec.d + 24 : 310
    const tall = spec ? spec.h + 24 : 214
    const openW = portrait ? tall : wide
    const openH = portrait ? wide : tall
    const mobile = size.w < 768
    const fillW = mobile ? 0.92 : 0.62
    const fillH = mobile ? 0.66 : 0.7
    fitDist = Math.max(openH / (2 * tan * fillH), openW / (2 * tan * camera.aspect * fillW))
    camera.updateProjectionMatrix()
    invalidate()
  }

  // ── presentation pose ──
  const v1 = new THREE.Vector3()
  const v2 = new THREE.Vector3()

  const apply = () => {
    if (!rig) return
    const f = easeInOut(clamp(st.fly, 0, 1))
    const o = clamp(st.open, 0, 1)
    rig.setOpen(easeHinge(o))

    // where the case's centre sits relative to the pivot
    v1.copy(rig.frontCenter).lerp(rig.closedCenter, f)
    v1.lerp(rig.openCenter, easeInOut(o))
    model.position.copy(v1).multiplyScalar(-1)

    // presentation rotation: shelf → closed (shows the spine) → open
    qA.setFromEuler(eShelf)
    qB.setFromEuler(eClosed)
    qA.slerp(qB, f)
    qC.setFromEuler(eOpen)
    qA.slerp(qC, easeInOut(o))
    pivot.quaternion.copy(user).multiply(qA)

    // screen position: from the shelf rectangle to the centre
    camera.position.set(0, 0, fitDist * st.zoom)
    camera.lookAt(0, 0, 0)
    v2.copy(st.start).lerp(new THREE.Vector3(0, 0, 0), f)
    pivot.position.copy(v2)

    // discs: lift off the hub and tilt to show the read side
    const l = easeInOut(clamp(st.lift, 0, 1))
    for (const d of rig.discs) {
      d.body.position.set(0, -l * 8, l * 34)
      d.body.rotation.set(-l * 2.05, l * 0.25, 0)
    }
  }

  // ── loop ──
  const frame = (now: number) => {
    raf = 0
    if (disposed) return
    const dt = Math.min(0.05, (now - lastT) / 1000)
    lastT = now
    for (let i = tweens.length - 1; i >= 0; i--) {
      const tw = tweens[i]
      const k = tw.dur <= 0 ? 1 : clamp((now - tw.t0) / tw.dur, 0, 1)
      tw.set(tw.from + (tw.to - tw.from) * tw.ease(k))
      if (k >= 1) {
        tweens.splice(i, 1)
        tw.done()
      }
    }
    // inertia after a fling
    if (!dragging && (Math.abs(vel.x) > 1e-4 || Math.abs(vel.y) > 1e-4)) {
      rotateWorld(vel.x * dt * 60, vel.y * dt * 60)
      const damp = Math.exp(-dt * 5.5)
      vel.x *= damp
      vel.y *= damp
      if (Math.abs(vel.x) < 1e-4) vel.x = 0
      if (Math.abs(vel.y) < 1e-4) vel.y = 0
    }
    st.zoom += (st.zoomTarget - st.zoom) * (1 - Math.exp(-dt * 10))
    if (Math.abs(st.zoomTarget - st.zoom) < 1e-4) st.zoom = st.zoomTarget

    apply()
    renderer.render(scene, camera)

    const busy = tweens.length > 0 || dragging || vel.x !== 0 || vel.y !== 0 || st.zoom !== st.zoomTarget
    if (busy) invalidate()
  }
  function invalidate() {
    if (!raf && !disposed && !document.hidden) {
      lastT = Math.min(lastT, performance.now())
      raf = requestAnimationFrame(frame)
    }
  }
  const onVisibility = () => {
    if (!document.hidden) {
      lastT = performance.now()
      invalidate()
    }
  }
  document.addEventListener("visibilitychange", onVisibility)

  // ── manipulation ──
  const axisY = new THREE.Vector3(0, 1, 0)
  const axisX = new THREE.Vector3(1, 0, 0)
  const qd = new THREE.Quaternion()
  function rotateWorld(dx: number, dy: number) {
    // world-space turns: horizontal drags spin about the vertical axis,
    // vertical drags tumble towards / away from the viewer — free in 360°
    qd.setFromAxisAngle(axisY, dx)
    user.premultiply(qd)
    qd.setFromAxisAngle(axisX, dy)
    user.premultiply(qd)
    user.normalize()
  }

  const ray = new THREE.Raycaster()
  const ndc = new THREE.Vector2()
  let canInteract = false
  let pointers = new Map<number, { x: number; y: number }>()
  let downAt = { x: 0, y: 0, t: 0 }
  let moved = 0
  let pinch0 = 0
  let zoom0 = 1
  let lastMove = 0

  const onDown = (e: PointerEvent) => {
    if (!canInteract) return
    canvas.setPointerCapture(e.pointerId)
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.size === 1) {
      downAt = { x: e.clientX, y: e.clientY, t: performance.now() }
      moved = 0
      dragging = true
      vel.x = vel.y = 0
    } else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()]
      pinch0 = Math.hypot(a.x - b.x, a.y - b.y)
      zoom0 = st.zoomTarget
    }
    opts.onInteract?.()
    invalidate()
  }
  const onMove = (e: PointerEvent) => {
    const p = pointers.get(e.pointerId)
    if (!p) return
    const dx = e.clientX - p.x
    const dy = e.clientY - p.y
    p.x = e.clientX
    p.y = e.clientY
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()]
      const dist = Math.hypot(a.x - b.x, a.y - b.y)
      if (pinch0 > 0) st.zoomTarget = clamp(zoom0 * (pinch0 / dist), 0.55, 1.5)
      moved += 10
      invalidate()
      return
    }
    moved += Math.abs(dx) + Math.abs(dy)
    // radians per pixel: about half a turn across the smaller side
    const k = Math.PI / Math.min(size.w, size.h)
    const rx = dx * k
    const ry = dy * k
    rotateWorld(rx, ry)
    const now = performance.now()
    const dtm = Math.max(8, now - lastMove)
    lastMove = now
    // keep a smoothed velocity (radians per 60 Hz frame) for the fling
    vel.x = vel.x * 0.6 + ((rx * 16) / dtm) * 0.4
    vel.y = vel.y * 0.6 + ((ry * 16) / dtm) * 0.4
    invalidate()
  }
  const onUp = (e: PointerEvent) => {
    if (!pointers.has(e.pointerId)) return
    pointers.delete(e.pointerId)
    if (pointers.size > 0) return
    dragging = false
    if (performance.now() - lastMove > 90 || reducedMotion) vel.x = vel.y = 0
    vel.x = clamp(vel.x, -0.12, 0.12)
    vel.y = clamp(vel.y, -0.12, 0.12)
    // a tap on a disc takes it out (or puts it back)
    if (moved < 6 && performance.now() - downAt.t < 450 && rig && rig.discs.length) {
      const r = canvas.getBoundingClientRect()
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
      ray.setFromCamera(ndc, camera)
      const hit = ray.intersectObjects(
        rig.discs.map((d) => d.body),
        true,
      )
      if (hit.length) toggleDiscs()
    }
    invalidate()
  }
  const onWheel = (e: WheelEvent) => {
    if (!canInteract) return
    e.preventDefault()
    const d = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY
    st.zoomTarget = clamp(st.zoomTarget * Math.exp(d * 0.0012), 0.55, 1.5)
    invalidate()
  }
  const onDouble = () => {
    if (canInteract) reset()
  }
  canvas.addEventListener("pointerdown", onDown)
  canvas.addEventListener("pointermove", onMove)
  canvas.addEventListener("pointerup", onUp)
  canvas.addEventListener("pointercancel", onUp)
  canvas.addEventListener("wheel", onWheel, { passive: false })
  canvas.addEventListener("dblclick", onDouble)
  window.addEventListener("resize", resize)

  function reset() {
    const from = user.clone()
    vel.x = vel.y = 0
    st.zoomTarget = 1
    void tween(0, 1, 700, easeInOut, (k) => {
      user.copy(from).slerp(new THREE.Quaternion(), k)
    })
  }

  let lifted = false
  function toggleDiscs() {
    if (!rig || !rig.discs.length) return false
    lifted = !lifted
    void tween(st.lift, lifted ? 1 : 0, 900, easeInOut, (v) => (st.lift = v))
    return lifted
  }

  // ── assets ──
  const loader = new THREE.TextureLoader()
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy())
  const ready = (async () => {
    const [wrap, ...labels] = await Promise.all([loadTexture(loader, opts.wrapUrl, aniso), ...opts.discUrls.map((u) => loadTexture(loader, u, aniso))])
    if (disposed) return
    textures.push(wrap, ...labels)
    rig = buildCase(opts.platform, wrap, labels, keyPos.clone().normalize())
    model.add(rig.root)
    resize()
    apply()
    // compile shaders now so the first animated frame doesn't stall
    await renderer.compileAsync(scene, camera).catch(() => undefined)
  })()

  const placeAtRect = (rect: DOMRect) => {
    if (!rig) return
    const tan = Math.tan(THREE.MathUtils.degToRad(FOV / 2))
    const camZ = fitDist * st.zoom
    // distance at which the case's height fills the rectangle's height
    const dist = (rig.spec.h * size.h) / (Math.max(20, rect.height) * 2 * tan)
    const nx = ((rect.left + rect.width / 2) / size.w) * 2 - 1
    const ny = -(((rect.top + rect.height / 2) / size.h) * 2 - 1)
    st.start.set(nx * dist * tan * camera.aspect, ny * dist * tan, camZ - dist)
  }

  return {
    ready,
    hasDiscs: opts.discUrls.length > 0,
    flyIn: async (rect) => {
      await ready
      placeAtRect(rect)
      st.fly = 0
      apply()
      renderer.render(scene, camera)
      await tween(0, 1, 820, (t) => t, (v) => (st.fly = v))
    },
    open: async () => {
      await tween(st.open, 1, 1250, (t) => t, (v) => (st.open = v))
      canInteract = true
    },
    close: async (rect, onFly) => {
      canInteract = false
      dragging = false
      pointers = new Map()
      vel.x = vel.y = 0
      const from = user.clone()
      const z0 = st.zoomTarget
      const jobs: Promise<void>[] = [
        tween(0, 1, 560, easeInOut, (k) => {
          user.copy(from).slerp(new THREE.Quaternion(), k)
          st.zoomTarget = st.zoom = z0 + (1 - z0) * k
        }),
      ]
      const hadDisc = st.lift > 0
      if (hadDisc) {
        lifted = false
        jobs.push(tween(st.lift, 0, 520, easeInOut, (v) => (st.lift = v)))
      }
      // the lid starts closing while the case squares up (after the disc is home)
      jobs.push(
        new Promise<void>((r) => setTimeout(r, hadDisc ? 420 : 160)).then(() =>
          tween(st.open, 0, 900, (t) => t, (v) => (st.open = v)),
        ),
      )
      await Promise.all(jobs)
      onFly?.()
      if (rect) {
        placeAtRect(rect)
        await tween(1, 0, 680, (t) => t, (v) => (st.fly = v))
      }
    },
    toggleDiscs,
    reset,
    rotateBy: (yaw, pitch) => {
      if (!canInteract) return
      const from = user.clone()
      const q = new THREE.Quaternion()
      const target = from.clone()
      q.setFromAxisAngle(axisY, yaw)
      target.premultiply(q)
      q.setFromAxisAngle(axisX, pitch)
      target.premultiply(q)
      void tween(0, 1, 380, easeOut, (k) => user.copy(from).slerp(target, k))
    },
    zoomBy: (f) => {
      if (!canInteract) return
      st.zoomTarget = clamp(st.zoomTarget * f, 0.55, 1.5)
      invalidate()
    },
    dispose: () => {
      disposed = true
      if (raf) cancelAnimationFrame(raf)
      document.removeEventListener("visibilitychange", onVisibility)
      canvas.removeEventListener("pointerdown", onDown)
      canvas.removeEventListener("pointermove", onMove)
      canvas.removeEventListener("pointerup", onUp)
      canvas.removeEventListener("pointercancel", onUp)
      canvas.removeEventListener("wheel", onWheel)
      canvas.removeEventListener("dblclick", onDouble)
      window.removeEventListener("resize", resize)
      tweens.length = 0
      scene.traverse((o) => {
        const m = o as THREE.Mesh
        if (m.geometry) m.geometry.dispose()
        const mat = m.material as THREE.Material | THREE.Material[] | undefined
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose())
        else mat?.dispose()
      })
      textures.forEach((t) => t.dispose())
      envTex.dispose()
      pmrem.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
    },
  }
}

// WebGL available and not software-rendered at a crawl?
export function webglSupport(): boolean {
  try {
    const c = document.createElement("canvas")
    const gl = c.getContext("webgl2") || c.getContext("webgl")
    if (!gl) return false
    ;(gl as WebGLRenderingContext).getExtension("WEBGL_lose_context")?.loseContext()
    return true
  } catch {
    return false
  }
}
