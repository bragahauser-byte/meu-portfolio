import * as THREE from "three"
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js"
import { buildCase, disposeSleeveTexture } from "./models"
import type { CaseRig } from "./models"
import type { PlatformId } from "./platforms"

// ── Game case viewer (WebGL) ─────────────────────────────────────────────────
// One renderer per opened case, created on click and destroyed on close.
// Rendering is on demand: frames are drawn only while something moves (a
// tween, a drag, inertia, a zoom), never while the case just sits there.
//
// Motion: the case flies out of its exact place on the shelf (the CSS box's
// screen rectangle) to the centre, opens on its two hinges, and can then be
// turned freely by hand. A tap on a disc lifts it off the hub (straight up,
// clear of the grip), then carries it towards the viewer, where it can be
// turned on its own; another tap (or "Put back") flies it home. Closing
// plays everything backwards.

export type Tier = "high" | "low"

export type SceneEvent = { type: "turn" } | { type: "disc"; index: number | null } | { type: "disc-turn" } | { type: "hover"; disc: boolean }

export type SceneOptions = {
  canvas: HTMLCanvasElement
  platform: PlatformId
  wrapUrl: string
  discUrls: string[]
  reducedMotion: boolean
  tier: Tier
  region?: () => { x: number; w: number } // usable area (px), e.g. right half on a folded Duo
  onEvent?: (e: SceneEvent) => void
}

export type GameScene = {
  ready: Promise<void>
  flyIn: (rect: DOMRect) => Promise<void>
  open: () => Promise<void>
  close: (rect: DOMRect | null, onFly?: () => void) => Promise<void>
  takeOut: (index: number) => void
  putBack: () => void
  discCount: number
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

type Tween = { id?: string; from: number; to: number; dur: number; t0: number; ease: (t: number) => number; set: (v: number) => void; done: () => void }

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
  const emit = (e: SceneEvent) => opts.onEvent?.(e)
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
  key.shadow.camera.left = -240
  key.shadow.camera.right = 240
  key.shadow.camera.top = 240
  key.shadow.camera.bottom = -240
  key.shadow.camera.near = 20
  key.shadow.camera.far = 1400
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
    zoom: 1,
    zoomTarget: 1,
    start: new THREE.Vector3(),
  }
  const user = new THREE.Quaternion() // the case, turned by hand
  const discUser = new THREE.Quaternion() // the disc in hand, turned on its own
  const discP: number[] = opts.discUrls.map(() => 0) // 0 = on its hub, 1 = in hand
  let active: number | null = null
  const vel = { x: 0, y: 0 }
  let dragTarget: "case" | "disc" = "case"
  let dragging = false
  let fitDist = 800
  let disposed = false
  let raf = 0
  let lastT = performance.now()
  const tweens: Tween[] = []

  const tween = (from: number, to: number, dur: number, ease: (t: number) => number, set: (v: number) => void, id?: string) =>
    new Promise<void>((resolve) => {
      if (reducedMotion) dur = Math.min(dur, 180)
      if (id) {
        // a new tween on the same property replaces the old one (no fighting)
        for (let i = tweens.length - 1; i >= 0; i--)
          if (tweens[i].id === id) {
            tweens[i].done()
            tweens.splice(i, 1)
          }
      }
      tweens.push({ id, from, to, dur, t0: performance.now(), ease, set, done: resolve })
      invalidate()
    })

  // ── presentation pose ──
  const qA = new THREE.Quaternion()
  const qB = new THREE.Quaternion()
  const qC = new THREE.Quaternion()
  const eShelf = new THREE.Euler(-0.035, 0.07, 0)
  const eClosed = new THREE.Euler(-0.08, 0.42, 0.0)
  const eOpen = new THREE.Euler(-0.2, -0.08, 0.0)
  const qDiscBase = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.3, 0.42, 0.05))

  // ── layout ──
  const size = { w: 1, h: 1 }
  const area = { x: 0, w: 1, cx: 0.5 } // the usable region and its centre
  let portrait = false
  let regionAspect = 1
  const tan = Math.tan(THREE.MathUtils.degToRad(FOV / 2))
  const resize = () => {
    size.w = window.innerWidth
    size.h = window.innerHeight
    renderer.setSize(size.w, size.h, false)
    camera.aspect = size.w / size.h
    const r = opts.region?.() ?? { x: 0, w: size.w }
    area.x = r.x
    area.w = Math.max(200, r.w)
    area.cx = r.x + area.w / 2
    regionAspect = area.w / size.h
    // shift the projection centre into the usable region (folded Duo:
    // the right half), keeping the whole canvas so nothing is clipped
    if (Math.abs(area.cx - size.w / 2) > 1) camera.setViewOffset(size.w, size.h, size.w / 2 - area.cx, 0, size.w, size.h)
    else camera.clearViewOffset()
    const spec = rig?.spec
    // phones in portrait: present the open case standing up (cover on top,
    // tray below), so it fills the tall screen instead of a thin strip
    portrait = regionAspect < 0.85
    eOpen.z = portrait ? -Math.PI / 2 : 0
    const wide = spec ? spec.w * 2 + spec.d + 24 : 310
    const tall = spec ? spec.h + 24 : 214
    const openW = portrait ? tall : wide
    const openH = portrait ? wide : tall
    const compact = area.w < 768
    const fillW = compact ? 0.9 : 0.62
    // keep clear of the credits / tools rows on short screens
    const fillH = Math.min(compact ? 0.64 : 0.7, (size.h - 190) / size.h)
    fitDist = Math.max(openH / (2 * tan * fillH), openW / (2 * tan * regionAspect * fillW))
    camera.updateProjectionMatrix()
    invalidate()
  }

  // where a disc in hand floats: in front of the case, about half the
  // smaller side of the screen across
  const presentDist = () => {
    const camZ = fitDist * st.zoom
    const fillFrac = portrait ? 0.78 : 0.5
    const d = 120 / (fillFrac * 2 * tan * Math.min(1, regionAspect))
    return Math.min(d, camZ * 0.72)
  }

  const v1 = new THREE.Vector3()
  const vP = new THREE.Vector3()
  const vLift = new THREE.Vector3()
  const qParent = new THREE.Quaternion()
  const qTarget = new THREE.Quaternion()
  const qIdent = new THREE.Quaternion()
  const zero = new THREE.Vector3()

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
    const camZ = fitDist * st.zoom
    camera.position.set(0, 0, camZ)
    camera.lookAt(0, 0, 0)
    pivot.position.copy(st.start).lerp(zero, f)

    // discs: reset every body to its hub, then move those that are out
    pivot.updateMatrixWorld(true)
    const dist = presentDist()
    rig.discs.forEach((d, i) => {
      const p = discP[i]
      if (p <= 0.0001) {
        d.body.position.set(0, 0, 0)
        d.body.quaternion.identity()
        return
      }
      // 1) straight up off the hub, clear of the grip petals
      const e1 = easeOut(clamp(p / 0.3, 0, 1))
      vLift.set(0, 0, 18 * e1)
      // 2) then towards the viewer, turning to face them
      const e2 = easeInOut(clamp((p - 0.2) / 0.8, 0, 1))
      vP.set(0, 0, camZ - dist)
      d.group.worldToLocal(vP)
      d.group.getWorldQuaternion(qParent)
      qTarget.copy(discUser).multiply(qDiscBase)
      qTarget.premultiply(qParent.invert())
      d.body.position.copy(vLift).lerp(vP, e2)
      d.body.quaternion.copy(qIdent).slerp(qTarget, e2)
    })
  }

  // ── loop ──
  const frame = (now: number) => {
    raf = 0
    if (disposed) return
    const dt = Math.min(0.05, (now - lastT) / 1000)
    lastT = now
    for (let i = tweens.length - 1; i >= 0; i--) {
      const tw = tweens[i]
      if (!tw) continue
      const k = tw.dur <= 0 ? 1 : clamp((now - tw.t0) / tw.dur, 0, 1)
      tw.set(tw.from + (tw.to - tw.from) * tw.ease(k))
      if (k >= 1) {
        tweens.splice(i, 1)
        tw.done()
      }
    }
    // inertia after a fling
    if (!dragging && (vel.x !== 0 || vel.y !== 0)) {
      turn(dragTarget, vel.x * dt * 60, vel.y * dt * 60)
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
  // world-space turns: horizontal drags spin about the vertical axis,
  // vertical drags tumble towards / away from the viewer — free in 360°
  function turn(target: "case" | "disc", dx: number, dy: number) {
    const q = target === "disc" ? discUser : user
    qd.setFromAxisAngle(axisY, dx)
    q.premultiply(qd)
    qd.setFromAxisAngle(axisX, dy)
    q.premultiply(qd)
    q.normalize()
  }
  const discInHand = () => active !== null && discP[active] > 0.55

  const ray = new THREE.Raycaster()
  const ndc = new THREE.Vector2()
  let canInteract = false
  let pointers = new Map<number, { x: number; y: number }>()
  let downAt = { x: 0, y: 0, t: 0 }
  let moved = 0
  let pinch0 = 0
  let zoom0 = 1
  let lastMove = 0
  let sentTurn = false
  let sentDiscTurn = false

  const pickDisc = (clientX: number, clientY: number) => {
    if (!rig || !rig.discs.length) return -1
    const r = canvas.getBoundingClientRect()
    ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1)
    ray.setFromCamera(ndc, camera)
    let best = -1
    let bestD = Infinity
    rig.discs.forEach((d, i) => {
      const hit = ray.intersectObject(d.pick, false)[0]
      if (hit && hit.distance < bestD) {
        bestD = hit.distance
        best = i
      }
    })
    return best
  }

  let hoverDisc = false
  const onDown = (e: PointerEvent) => {
    if (!canInteract) return
    canvas.setPointerCapture(e.pointerId)
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.size === 1) {
      downAt = { x: e.clientX, y: e.clientY, t: performance.now() }
      moved = 0
      dragging = true
      vel.x = vel.y = 0
      dragTarget = discInHand() ? "disc" : "case"
    } else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()]
      pinch0 = Math.hypot(a.x - b.x, a.y - b.y)
      zoom0 = st.zoomTarget
    }
    invalidate()
  }
  const onMove = (e: PointerEvent) => {
    const p = pointers.get(e.pointerId)
    if (!p) {
      // hover feedback (mouse only): a disc under the pointer can be taken
      if (canInteract && e.pointerType === "mouse") {
        const over = pickDisc(e.clientX, e.clientY) >= 0
        if (over !== hoverDisc) {
          hoverDisc = over
          canvas.dataset.hover = String(over)
          emit({ type: "hover", disc: over })
        }
      }
      return
    }
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
    if (moved < 4) return
    // radians per pixel: about half a turn across the smaller side
    const k = Math.PI / Math.min(area.w, size.h)
    const rx = dx * k
    const ry = dy * k
    turn(dragTarget, rx, ry)
    if (dragTarget === "case" && !sentTurn && moved > 30) {
      sentTurn = true
      emit({ type: "turn" })
    }
    if (dragTarget === "disc" && !sentDiscTurn && moved > 30) {
      sentDiscTurn = true
      emit({ type: "disc-turn" })
    }
    const now = performance.now()
    const dtm = Math.max(8, now - lastMove)
    lastMove = now
    // smoothed velocity (radians per 60 Hz frame) for the fling
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
    // a tap (not a drag) on a disc takes it out, or puts it back
    if (moved < 8 && performance.now() - downAt.t < 500) {
      vel.x = vel.y = 0
      const i = pickDisc(e.clientX, e.clientY)
      if (i >= 0) {
        if (i === active) putBack()
        else takeOut(i)
      }
    }
    invalidate()
  }
  const onLeave = () => {
    if (hoverDisc) {
      hoverDisc = false
      canvas.dataset.hover = "false"
      emit({ type: "hover", disc: false })
    }
  }
  const onWheel = (e: WheelEvent) => {
    if (!canInteract) return
    e.preventDefault()
    const d = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY
    st.zoomTarget = clamp(st.zoomTarget * Math.exp(d * 0.0012), 0.55, 1.5)
    invalidate()
  }
  const onDouble = (e: MouseEvent) => {
    e.preventDefault()
    if (!canInteract) return
    if (pickDisc(e.clientX, e.clientY) >= 0) return // double tap on a disc is two taps
    reset()
  }
  canvas.addEventListener("pointerdown", onDown)
  canvas.addEventListener("pointermove", onMove)
  canvas.addEventListener("pointerup", onUp)
  canvas.addEventListener("pointercancel", onUp)
  canvas.addEventListener("pointerleave", onLeave)
  canvas.addEventListener("wheel", onWheel, { passive: false })
  canvas.addEventListener("dblclick", onDouble)
  window.addEventListener("resize", resize)

  const slerpTo = (q: THREE.Quaternion, target: THREE.Quaternion, dur: number, id: string) => {
    const from = q.clone()
    return tween(0, 1, dur, easeInOut, (k) => q.copy(from).slerp(target, k), id)
  }

  function reset() {
    vel.x = vel.y = 0
    st.zoomTarget = 1
    if (discInHand()) void slerpTo(discUser, new THREE.Quaternion(), 600, "discUser")
    else void slerpTo(user, new THREE.Quaternion(), 700, "user")
  }

  function takeOut(i: number) {
    if (!canInteract || !rig || i < 0 || i >= rig.discs.length) return
    if (active !== null && active !== i) {
      const prev = active
      void tween(discP[prev], 0, 850, (t) => t, (v) => (discP[prev] = v), `disc${prev}`)
    }
    active = i
    discUser.identity()
    vel.x = vel.y = 0
    void tween(discP[i], 1, 1150, (t) => t, (v) => (discP[i] = v), `disc${i}`)
    emit({ type: "disc", index: i })
  }

  function putBack() {
    if (active === null) return Promise.resolve()
    const i = active
    active = null
    vel.x = vel.y = 0
    emit({ type: "disc", index: null })
    // turn the disc back to the way it left before it flies home
    const back = slerpTo(discUser, new THREE.Quaternion(), 420, "discUser")
    const home = tween(discP[i], 0, 1000, (t) => t, (v) => (discP[i] = v), `disc${i}`)
    return Promise.all([back, home]).then(() => undefined)
  }

  // ── assets ──
  const loader = new THREE.TextureLoader()
  const aniso = Math.min(tier === "high" ? 8 : 4, renderer.capabilities.getMaxAnisotropy())
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
    const camZ = fitDist * st.zoom
    // distance at which the case's height fills the rectangle's height; at
    // that depth one screen pixel is (2·dist·tan)/height world units
    const dist = (rig.spec.h * size.h) / (Math.max(20, rect.height) * 2 * tan)
    const px = (2 * dist * tan) / size.h
    st.start.set((rect.left + rect.width / 2 - area.cx) * px, -(rect.top + rect.height / 2 - size.h / 2) * px, camZ - dist)
  }

  return {
    ready,
    discCount: opts.discUrls.length,
    flyIn: async (rect) => {
      await ready
      placeAtRect(rect)
      st.fly = 0
      apply()
      renderer.render(scene, camera)
      await tween(0, 1, 820, (t) => t, (v) => (st.fly = v), "fly")
    },
    open: async () => {
      await tween(st.open, 1, 1250, (t) => t, (v) => (st.open = v), "open")
      canInteract = true
    },
    close: async (rect, onFly) => {
      dragging = false
      pointers = new Map()
      vel.x = vel.y = 0
      const homeDisc = active !== null ? putBack() : null
      canInteract = false
      const z0 = st.zoomTarget
      const from = user.clone()
      const jobs: Promise<void>[] = [
        tween(0, 1, 560, easeInOut, (k) => {
          user.copy(from).slerp(qIdent, k)
          st.zoomTarget = st.zoom = z0 + (1 - z0) * k
        }, "user"),
      ]
      if (homeDisc) jobs.push(homeDisc)
      // the lid starts closing once the disc is home and the case squares up
      jobs.push(
        (homeDisc ?? Promise.resolve())
          .then(() => new Promise<void>((r) => setTimeout(r, homeDisc ? 60 : 160)))
          .then(() => tween(st.open, 0, 900, (t) => t, (v) => (st.open = v), "open")),
      )
      await Promise.all(jobs)
      onFly?.()
      if (rect) {
        placeAtRect(rect)
        await tween(1, 0, 680, (t) => t, (v) => (st.fly = v), "fly")
      }
    },
    takeOut,
    putBack: () => void putBack(),
    reset,
    rotateBy: (yaw, pitch) => {
      if (!canInteract) return
      const q = discInHand() ? discUser : user
      const target = q.clone()
      qd.setFromAxisAngle(axisY, yaw)
      target.premultiply(qd)
      qd.setFromAxisAngle(axisX, pitch)
      target.premultiply(qd)
      const from = q.clone()
      void tween(0, 1, 380, easeOut, (k) => q.copy(from).slerp(target, k), discInHand() ? "discUser" : "user")
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
      canvas.removeEventListener("pointerleave", onLeave)
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
      disposeSleeveTexture()
      key.shadow.map?.dispose()
      envTex.dispose()
      pmrem.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
    },
  }
}

// WebGL available?
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
