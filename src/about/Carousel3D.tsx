import { useEffect, useLayoutEffect, useRef, useState } from "react"
import type { CSSProperties } from "react"
import type { Category, Favorite } from "./data"

// ── Looping 3D carousel ──────────────────────────────────────────────────────
// Pure CSS 3D (no WebGL): every item is a small box of transformed faces that
// lives in one shared preserve-3d world, so the browser depth-sorts records,
// discs and books against each other for free.
//
// Motion model: `target` is where the visitor asked to go (wheel / drag /
// keys / click), `pos` chases it with a frame-rate independent exponential
// ease, and a short pause after the last input snaps `target` to the nearest
// item. Positions are taken modulo N, so the line of items never ends.
// The per-frame work writes transforms straight to the DOM — React only
// re-renders when the active item changes.

type Placement = {
  x: number
  y: number
  z: number
  rx: number
  ry: number
  rz: number
  o: number // opacity 0–1 (applied on faces: opacity on a preserve-3d node would flatten it)
}

type Layout = {
  unit: (vw: number, vh: number) => number
  // half the on-screen width of the active item: the world origin sits this
  // far to the right of the anchor, so the item's left edge meets the column
  half: (u: number) => number
  place: (rel: number, a: number, u: number) => Placement
  top: number // world origin, % of the stage height
  perspective: number
  intro: number // how far (in items) the row sweeps on entrance
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
const smooth = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1)
  return t * t * (3 - 2 * t)
}
// 1 inside [lo, hi], easing to 0 over `f` items outside it
const band = (rel: number, lo: number, hi: number, f: number) =>
  smooth(lo - f, lo, rel) * (1 - smooth(hi, hi + f, rel))

// Horizontal rows. The active item faces the camera at x=0; the next one
// takes a wide step and turns into the row, the rest stack tighter behind it.
// f: 0→1 over the first step, g: items beyond it. Leaving items slide left
// and fade before they cross into the first column.
const step = (rel: number) => ({ f: clamp(rel, 0, 1), g: Math.max(rel - 1, 0) })
const BOOK_RATIO = 670 / 966
const mobile = (vw: number) => vw < 768

const layouts: Record<Category, Layout> = {
  // Sleeves in a row; the active record slides out of its sleeve to the right.
  albums: {
    unit: (vw, vh) => (mobile(vw) ? Math.min(vw * 0.56, vh * 0.3) : Math.min(vh * 0.44, vw * 0.25)),
    half: (u) => u / 2,
    top: 55,
    perspective: 1800,
    intro: 6,
    place: (rel, a, u) => {
      const { f, g } = step(rel)
      return {
        x: rel < 0 ? rel * u * 1.1 : u * 1.2 * f + u * 0.42 * g,
        y: 0,
        z: rel < 0 ? 0 : -u * 0.42 * f - u * 0.1 * g,
        rx: 0,
        ry: rel < 0 ? 0 : -38 * f,
        rz: 0,
        o: band(rel, -0.35, 5.6, 0.6),
      }
    },
  },
  // Discs in a row, tilted back like plates on a table; the active one lifts
  // up towards the camera.
  films: {
    unit: (vw, vh) => (mobile(vw) ? Math.min(vw * 0.64, vh * 0.34) : Math.min(vh * 0.5, vw * 0.28)),
    half: (u) => u / 2,
    top: 54,
    perspective: 1600,
    intro: 4,
    place: (rel, a, u) => {
      const { f, g } = step(rel)
      return {
        x: rel < 0 ? rel * u * 1.0 : u * 0.98 * f + u * 0.5 * g,
        y: -a * u * 0.02,
        z: rel < 0 ? 0 : -u * 0.3 * f - u * 0.1 * g,
        rx: 56 - a * 24,
        ry: 0,
        rz: -6 + a * 4,
        o: band(rel, -0.35, 4.8, 0.6),
      }
    },
  },
  // Books on a shelf: the active one faces you, the rest turn to show spines.
  books: {
    unit: (vw, vh) => (mobile(vw) ? Math.min(vw * 0.78, vh * 0.42) : Math.min(vh * 0.54, vw * 0.3)),
    half: (u) => (u * BOOK_RATIO) / 2,
    top: 55,
    perspective: 1800,
    intro: 5,
    place: (rel, a, u) => {
      const { f, g } = step(rel)
      const w = u * BOOK_RATIO
      return {
        x: rel < 0 ? rel * w * 1.2 : w * 1.16 * f + w * 0.42 * g,
        y: -a * u * 0.015,
        z: rel < 0 ? 0 : -w * 0.32 * f - w * 0.06 * g,
        rx: 2,
        ry: rel < 0 ? 6 : 6 + 44 * f,
        rz: 0,
        o: band(rel, -0.35, 5.6, 0.6),
      }
    },
  },
}

function useViewport() {
  const [vp, setVp] = useState(() => ({
    w: typeof window === "undefined" ? 1920 : window.innerWidth,
    h: typeof window === "undefined" ? 1080 : window.innerHeight,
  }))
  useEffect(() => {
    const on = () => setVp({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener("resize", on)
    return () => window.removeEventListener("resize", on)
  }, [])
  return vp
}

export default function Carousel3D({
  kind,
  items,
  anchor,
  playing,
  reducedMotion,
  onActiveChange,
  onActivate,
}: {
  kind: Category
  items: Favorite[]
  anchor: number // x (px) where the active item's left edge sits
  playing: boolean
  reducedMotion: boolean
  onActiveChange: (index: number) => void
  onActivate: (index: number) => void // click on the already-active item
}) {
  const layout = layouts[kind]
  const n = items.length
  const vp = useViewport()
  const u = layout.unit(vp.w, vp.h)
  const originX = anchor + layout.half(u)

  const stageRef = useRef<HTMLDivElement>(null)
  const worldRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const onActiveChangeRef = useRef(onActiveChange)
  const onActivateRef = useRef(onActivate)
  onActiveChangeRef.current = onActiveChange
  onActivateRef.current = onActivate

  const state = useRef({
    pos: reducedMotion ? 0 : -layout.intro,
    target: 0,
    active: -1,
    lastInput: 0,
    tiltX: 0,
    tiltY: 0,
    pointerX: 0,
    pointerY: 0,
  })

  const [active, setActive] = useState(0)

  // ── frame loop ──
  useLayoutEffect(() => {
    const s = state.current
    let raf = 0
    let last = performance.now()

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now

      // snap to the nearest item once input has settled
      if (now - s.lastInput > 160) s.target = Math.round(s.target)

      const k = 1 - Math.exp(-dt * (reducedMotion ? 30 : 6.5))
      s.pos += (s.target - s.pos) * k
      if (Math.abs(s.target - s.pos) < 0.0005) s.pos = s.target

      // pointer parallax on the whole world
      s.tiltX += (s.pointerY * -1.6 - s.tiltX) * (1 - Math.exp(-dt * 4))
      s.tiltY += (s.pointerX * 2.2 - s.tiltY) * (1 - Math.exp(-dt * 4))
      if (worldRef.current) {
        worldRef.current.style.transform = `rotateX(${s.tiltX.toFixed(3)}deg) rotateY(${s.tiltY.toFixed(3)}deg)`
      }

      for (let i = 0; i < n; i++) {
        const el = itemRefs.current[i]
        if (!el) continue
        let rel = i - s.pos
        rel -= n * Math.round(rel / n)
        const a = Math.max(0, 1 - Math.abs(rel))
        const p = layout.place(rel, a, u)
        el.style.transform = `translate3d(${p.x.toFixed(2)}px, ${p.y.toFixed(2)}px, ${p.z.toFixed(2)}px) rotateX(${p.rx.toFixed(2)}deg) rotateY(${p.ry.toFixed(2)}deg) rotateZ(${p.rz.toFixed(2)}deg)`
        el.style.setProperty("--o", p.o.toFixed(3))
        el.style.setProperty("--a", a.toFixed(3))
        el.style.visibility = p.o < 0.002 ? "hidden" : "visible"
      }

      const idx = ((Math.round(s.pos) % n) + n) % n
      if (idx !== s.active) {
        s.active = idx
        setActive(idx)
        onActiveChangeRef.current(idx)
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [layout, n, u, reducedMotion])

  // ── input: wheel, keys, drag, pointer parallax ──
  useEffect(() => {
    const s = state.current
    const stage = stageRef.current
    if (!stage) return

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const d = (e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY) + (e.deltaMode === 1 ? e.deltaX * 16 : e.deltaX)
      s.target += clamp(d * 0.0042, -0.75, 0.75)
      s.lastInput = performance.now()
    }
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowRight", "ArrowDown", "PageDown"].includes(e.key)) {
        s.target = Math.round(s.target) + 1
      } else if (["ArrowLeft", "ArrowUp", "PageUp"].includes(e.key)) {
        s.target = Math.round(s.target) - 1
      } else return
      e.preventDefault()
      s.lastInput = 0
    }

    let drag: { x: number; y: number; t: number; moved: boolean; id: number } | null = null
    let lastMove = { x: 0, t: 0, v: 0 }
    const onDown = (e: PointerEvent) => {
      drag = { x: e.clientX, y: e.clientY, t: s.target, moved: false, id: e.pointerId }
      lastMove = { x: e.clientX, t: performance.now(), v: 0 }
    }
    const onMove = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect()
      s.pointerX = (e.clientX - r.left) / r.width - 0.5
      s.pointerY = (e.clientY - r.top) / r.height - 0.5
      if (!drag || e.pointerId !== drag.id) return
      const dx = e.clientX - drag.x
      const dy = e.clientY - drag.y
      if (!drag.moved && Math.hypot(dx, dy) > 6) {
        drag.moved = true
        stage.setPointerCapture(e.pointerId)
      }
      if (!drag.moved) return
      // either axis drives the line; dragging left/up moves forward
      const d = Math.abs(dx) > Math.abs(dy) ? dx : dy
      s.target = drag.t - d / (u * 0.6)
      s.lastInput = performance.now() + 10_000 // hold while the finger is down
      const now = performance.now()
      lastMove = { x: d, t: now, v: (d - lastMove.x) / Math.max(1, now - lastMove.t) }
    }
    const onUp = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return
      if (drag.moved) {
        // fling: carry a little of the release velocity
        s.target -= clamp((lastMove.v * 180) / (u * 0.6), -3, 3)
        s.lastInput = performance.now() - 120
      } else {
        const hit = (e.target as Element).closest<HTMLElement>("[data-idx]")
        if (hit) {
          const i = Number(hit.dataset.idx)
          let rel = i - s.pos
          rel -= n * Math.round(rel / n)
          if (Math.abs(rel) < 0.5) onActivateRef.current(i)
          else {
            s.target = Math.round(s.pos + rel)
            s.lastInput = 0
          }
        }
      }
      drag = null
    }
    const onLeave = () => {
      s.pointerX = 0
      s.pointerY = 0
    }

    window.addEventListener("wheel", onWheel, { passive: false })
    window.addEventListener("keydown", onKey)
    stage.addEventListener("pointerdown", onDown)
    stage.addEventListener("pointermove", onMove)
    stage.addEventListener("pointerup", onUp)
    stage.addEventListener("pointercancel", onUp)
    stage.addEventListener("pointerleave", onLeave)
    return () => {
      window.removeEventListener("wheel", onWheel)
      window.removeEventListener("keydown", onKey)
      stage.removeEventListener("pointerdown", onDown)
      stage.removeEventListener("pointermove", onMove)
      stage.removeEventListener("pointerup", onUp)
      stage.removeEventListener("pointercancel", onUp)
      stage.removeEventListener("pointerleave", onLeave)
    }
  }, [n, u])

  return (
    <div
      ref={stageRef}
      className={`c3d-stage c3d-${kind}`}
      style={{ perspective: `${layout.perspective}px`, perspectiveOrigin: `${originX + u * 0.6}px ${layout.top - 4}%` } as CSSProperties}
      aria-roledescription="carousel"
    >
      <div
        className="c3d-origin"
        style={{ left: originX, top: `${layout.top}%` }}
      >
        <div ref={worldRef} className="c3d-world">
          {items.map((it, i) => (
            <div
              key={it.slug}
              ref={(el) => {
                itemRefs.current[i] = el
              }}
              data-idx={i}
              className="c3d-item"
              data-active={i === active}
              aria-hidden={i !== active}
            >
              {kind === "albums" && <Record item={it} u={u} spinning={i === active && playing} />}
              {kind === "films" && <Disc item={it} u={u} />}
              {kind === "books" && <Book item={it} u={u} index={i} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Vinyl record + sleeve ────────────────────────────────────────────────────
function Record({ item, u, spinning }: { item: Favorite; u: number; spinning: boolean }) {
  const t = Math.max(4, u * 0.014) // sleeve thickness
  const s = u
  const face = (extra: CSSProperties): CSSProperties => ({ position: "absolute", left: "50%", top: "50%", ...extra })
  return (
    <div className="rec" style={{ "--s": `${s}px`, "--t": `${t}px` } as CSSProperties}>
      {/* the disc lives between the sleeve's front and back faces */}
      <div className="rec-vinyl">
        <div className="rec-disc face" data-spin={spinning}>
          <div className="rec-label" style={{ backgroundImage: `url(${item.cover})` }} />
          <div className="rec-hole" />
        </div>
        <div className="rec-sheen face" />
      </div>
      <div className="rec-sleeve">
        <div
          className="face rec-front"
          style={face({ width: s, height: s, marginLeft: -s / 2, marginTop: -s / 2, transform: `translateZ(${t / 2}px)`, backgroundImage: `url(${item.cover})` })}
        />
        <div
          className="face rec-back"
          style={face({ width: s, height: s, marginLeft: -s / 2, marginTop: -s / 2, transform: `rotateY(180deg) translateZ(${t / 2}px)`, background: item.tone })}
        />
        {/* edges */}
        <div className="face rec-edge" style={face({ width: t, height: s, marginLeft: -t / 2, marginTop: -s / 2, transform: `rotateY(90deg) translateZ(${s / 2}px)`, background: item.edge })} />
        <div className="face rec-edge" style={face({ width: t, height: s, marginLeft: -t / 2, marginTop: -s / 2, transform: `rotateY(-90deg) translateZ(${s / 2}px)`, background: item.edge })} />
        <div className="face rec-edge rec-edge-top" style={face({ width: s, height: t, marginLeft: -s / 2, marginTop: -t / 2, transform: `rotateX(90deg) translateZ(${s / 2}px)`, background: item.edge })} />
        <div className="face rec-edge" style={face({ width: s, height: t, marginLeft: -s / 2, marginTop: -t / 2, transform: `rotateX(-90deg) translateZ(${s / 2}px)`, background: item.edge })} />
      </div>
    </div>
  )
}

// ── CD / DVD ─────────────────────────────────────────────────────────────────
function Disc({ item, u }: { item: Favorite; u: number }) {
  return (
    <div className="cd" style={{ "--d": `${u}px` } as CSSProperties}>
      <div className="cd-spin">
        <div className="face cd-edge" style={{ transform: "translateZ(-3px)" }} />
        <div className="face cd-edge" style={{ transform: "translateZ(-2px)" }} />
        <div className="face cd-edge cd-edge-top" style={{ transform: "translateZ(-1px)" }} />
        <div className="face cd-art" style={{ backgroundImage: `url(${item.cover})` }} />
        <div className="face cd-hub" />
      </div>
      {/* reflections stay still while the disc turns underneath them */}
      <div className="face cd-iris" />
      <div className="face cd-rim" />
    </div>
  )
}

// ── Book ─────────────────────────────────────────────────────────────────────
const lum = (rgb: string) => {
  const [r, g, b] = rgb.match(/\d+/g)!.map(Number)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function Book({ item, u, index }: { item: Favorite; u: number; index: number }) {
  const h = u
  const w = (u * 670) / 966
  const d = u * (0.085 + ((index * 37) % 5) * 0.012) // thickness varies a little per book
  const face = (fw: number, fh: number, transform: string, extra: CSSProperties = {}): CSSProperties => ({
    position: "absolute",
    left: "50%",
    top: "50%",
    width: fw,
    height: fh,
    marginLeft: -fw / 2,
    marginTop: -fh / 2,
    transform,
    ...extra,
  })
  const ink = lum(item.edge) > 150 ? "#1A1A1A" : "#F5F5F2"
  const [main, sub] = item.title.split(":")
  return (
    <div className="book" style={{ "--bw": `${w}px`, "--bh": `${h}px`, "--bd": `${d}px` } as CSSProperties}>
      <div className="face book-cover" style={face(w, h, `translateZ(${d / 2}px)`, { backgroundImage: `url(${item.cover})` })} />
      <div className="face book-back" style={face(w, h, `rotateY(180deg) translateZ(${d / 2}px)`, { background: item.edge })} />
      <div className="face book-spine" style={face(d, h, `rotateY(-90deg) translateZ(${w / 2}px)`, { background: item.edge, color: ink })}>
        <span className="book-spine-title" style={{ fontSize: Math.max(8, Math.min(d * 0.3, h * 0.03)) }}>
          {main}
          {sub && <span className="book-spine-sub">{sub}</span>}
        </span>
        <span className="book-spine-author" style={{ fontSize: Math.max(7, Math.min(d * 0.22, h * 0.022)) }}>
          {item.credit.split(",")[0]}
        </span>
      </div>
      <div className="face book-pages book-pages-side" style={face(d - 4, h - 6, `rotateY(90deg) translateZ(${w / 2 - 3}px)`)} />
      <div className="face book-pages book-pages-top" style={face(w - 4, d - 4, `rotateX(90deg) translateZ(${h / 2 - 3}px)`)} />
      <div className="face book-pages book-pages-bottom" style={face(w - 4, d - 4, `rotateX(-90deg) translateZ(${h / 2 - 3}px)`)} />
    </div>
  )
}
