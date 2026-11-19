import { useCallback, useEffect, useRef, useState } from "react"
import type { CSSProperties } from "react"
import type { Favorite } from "../data"
import type { GameScene, SceneEvent, Tier } from "./scene"
import { cases, SPINE_U0 } from "./platforms"
import { foldRegion, isFolded } from "./fold"

// ── Game viewer ──────────────────────────────────────────────────────────────
// Dialog on top of the shelf. Steps: select (the case flies out of its exact
// place on the shelf to the centre) → open (hinges) → explore (drag to turn
// it in 360°, pinch / wheel to zoom) → take a disc out (tap it: it lifts off
// the hub and comes to you; drag turns the disc on its own; tap again or
// "Put disc back" to return it) → close (same path backwards, landing back
// in the same spot on the shelf). three.js loads only here (dynamic import).

type Phase = "loading" | "flying" | "open" | "closing" | "fallback"

let sceneModule: Promise<typeof import("./scene")> | null = null
export const loadSceneModule = () => (sceneModule ??= import("./scene"))

function detectTier(): Tier {
  const nav = navigator as Navigator & { deviceMemory?: number }
  const cores = nav.hardwareConcurrency || 4
  const mem = nav.deviceMemory ?? 8
  const coarse = window.matchMedia("(pointer: coarse)").matches
  if (cores <= 4 || mem <= 4) return "low"
  if (coarse && Math.min(window.innerWidth, window.innerHeight) < 500 && cores < 8) return "low"
  return "high"
}

const touchFirst = () => typeof window !== "undefined" && window.matchMedia("(hover: none)").matches

export default function GameViewer({
  item,
  origin,
  reducedMotion,
  onLift,
  onLand,
  onClosed,
}: {
  item: Favorite
  origin: () => DOMRect | null // the shelf case's front face, on screen
  reducedMotion: boolean
  onLift: () => void // the 3D case has taken over: hide the shelf copy
  onLand: () => void // the 3D case is back in place: show the shelf copy
  onClosed: () => void
}) {
  const game = item.game!
  const discCount = game.discs.length
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const sceneRef = useRef<GameScene | null>(null)
  const [phase, setPhase] = useState<Phase>("loading")
  const [backdrop, setBackdrop] = useState(false)
  const [canvasOn, setCanvasOn] = useState(false)
  const [inHand, setInHand] = useState<number | null>(null)
  const [turned, setTurned] = useState(false) // the case has been turned once
  const [discSeen, setDiscSeen] = useState(false) // a disc has been taken out once
  const [discTurned, setDiscTurned] = useState(false)
  const [discHint, setDiscHint] = useState(false) // time to suggest the disc
  const [hoverDisc, setHoverDisc] = useState(false)
  const [touch] = useState(touchFirst)

  // the dialog's close button sits exactly on top of the page's own one
  // (on a folded Duo it moves to the right half, away from the hinge)
  const [closeAt, setCloseAt] = useState<CSSProperties | undefined>(undefined)
  useEffect(() => {
    const place = () => {
      if (isFolded()) return setCloseAt(undefined)
      const el = document.querySelector<HTMLElement>(".about-header .about-close")
      if (!el) return
      const r = el.getBoundingClientRect()
      setCloseAt({ top: r.top, left: r.left, right: "auto" })
    }
    place()
    window.addEventListener("resize", place)
    return () => window.removeEventListener("resize", place)
  }, [])

  const phaseRef = useRef<Phase>("loading")
  phaseRef.current = phase
  const cb = useRef({ onLift, onLand, onClosed, origin })
  cb.current = { onLift, onLand, onClosed, origin }

  const onEvent = useCallback((e: SceneEvent) => {
    if (e.type === "turn") setTurned(true)
    if (e.type === "disc-turn") setDiscTurned(true)
    if (e.type === "hover") setHoverDisc(e.disc)
    if (e.type === "disc") {
      setInHand(e.index)
      if (e.index !== null) setDiscSeen(true)
    }
  }, [])

  // ── open ──
  useEffect(() => {
    let alive = true
    const prevFocus = document.activeElement as HTMLElement | null
    rootRef.current?.focus({ preventScroll: true })
    ;(async () => {
      try {
        const mod = await loadSceneModule()
        if (!alive) return
        if (!mod.webglSupport() || !canvasRef.current) throw new Error("no webgl")
        const scene = mod.createGameScene({
          canvas: canvasRef.current,
          platform: game.platform,
          wrapUrl: game.wrap,
          discUrls: game.discs,
          reducedMotion,
          tier: detectTier(),
          region: foldRegion,
          onEvent,
        })
        sceneRef.current = scene
        await scene.ready
        if (!alive) return
        const rect = cb.current.origin()
        setBackdrop(true)
        setCanvasOn(true)
        setPhase("flying")
        const fly = scene.flyIn(rect ?? new DOMRect(window.innerWidth / 2 - 100, window.innerHeight / 2 - 140, 200, 280))
        // hand-off: once the WebGL copy is drawn in place, hide the CSS one
        requestAnimationFrame(() => requestAnimationFrame(() => alive && cb.current.onLift()))
        await fly
        if (!alive) return
        await scene.open()
        if (!alive) return
        setPhase("open")
      } catch {
        if (!alive) return
        setBackdrop(true)
        setPhase("fallback")
      }
    })()
    return () => {
      alive = false
      sceneRef.current?.dispose()
      sceneRef.current = null
      prevFocus?.focus?.({ preventScroll: true })
    }
  }, [game, reducedMotion, onEvent])

  useEffect(() => {
    if (phase === "open" || phase === "fallback") closeRef.current?.focus({ preventScroll: true })
  }, [phase])

  // suggest the disc after the first turn, or after a few seconds anyway
  useEffect(() => {
    if (phase !== "open" || !discCount || discHint) return
    if (turned) {
      const t = window.setTimeout(() => setDiscHint(true), 600)
      return () => window.clearTimeout(t)
    }
    const t = window.setTimeout(() => setDiscHint(true), 4200)
    return () => window.clearTimeout(t)
  }, [phase, discCount, turned, discHint])

  // ── close ──
  const close = useCallback(async () => {
    const p = phaseRef.current
    if (p === "closing") return
    if (p === "loading") {
      cb.current.onClosed()
      return
    }
    setPhase("closing")
    const scene = sceneRef.current
    if (scene && p !== "fallback") {
      // the backdrop clears while the case flies home
      const rect = cb.current.origin()
      setInHand(null)
      await scene.close(rect, () => setBackdrop(false))
      cb.current.onLand()
      setCanvasOn(false)
      await new Promise((r) => setTimeout(r, reducedMotion ? 40 : 140))
    } else {
      setBackdrop(false)
      cb.current.onLand()
      await new Promise((r) => setTimeout(r, 280))
    }
    cb.current.onClosed()
  }, [reducedMotion])

  // keys: Esc closes (and stops the About page from also leaving), arrows
  // turn the case (or the disc in hand), +/− zoom, R resets, D takes the
  // disc out / puts it back, Tab stays inside the dialog
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const scene = sceneRef.current
      if (e.key === "Escape") {
        e.preventDefault()
        e.stopImmediatePropagation()
        void close()
        return
      }
      if (e.key === "Tab") {
        const els = rootRef.current?.querySelectorAll<HTMLElement>("button:not([disabled])")
        if (!els || !els.length) return
        const first = els[0]
        const last = els[els.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
        return
      }
      if (!scene || phaseRef.current !== "open") return
      const step = Math.PI / 8
      const map: Record<string, () => void> = {
        ArrowLeft: () => scene.rotateBy(-step, 0),
        ArrowRight: () => scene.rotateBy(step, 0),
        ArrowUp: () => scene.rotateBy(0, -step),
        ArrowDown: () => scene.rotateBy(0, step),
        "+": () => scene.zoomBy(0.85),
        "=": () => scene.zoomBy(0.85),
        "-": () => scene.zoomBy(1.18),
        r: () => scene.reset(),
        R: () => scene.reset(),
      }
      if (scene.discCount) {
        map.d = map.D = () => (inHandRef.current !== null ? scene.putBack() : scene.takeOut(0))
      }
      const fn = map[e.key]
      if (fn) {
        e.preventDefault()
        e.stopImmediatePropagation()
        if (e.key.startsWith("Arrow")) {
          if (inHandRef.current !== null) setDiscTurned(true)
          else setTurned(true)
        }
        fn()
      }
    }
    window.addEventListener("keydown", onKey, true)
    return () => window.removeEventListener("keydown", onKey, true)
  }, [close])
  const inHandRef = useRef<number | null>(null)
  inHandRef.current = inHand

  const spec = cases[game.platform]
  const ui = phase === "open" || phase === "fallback"
  const verb = touch ? "Tap" : "Click"

  // one short line at a time, each gone after the gesture it teaches
  let hint: string | null = null
  if (phase === "open") {
    if (inHand !== null && !discTurned) hint = `Drag to turn the disc · ${verb} it to put it back`
    else if (inHand === null && !turned && !(discHint && discCount && !discSeen)) hint = "Drag to turn the case"
    else if (inHand === null && discCount && !discSeen && discHint) hint = discCount > 1 ? `${verb} a disc to take it out` : `${verb} the disc to take it out`
  }

  return (
    <div
      ref={rootRef}
      className="gv"
      role="dialog"
      aria-modal="true"
      aria-label={`${item.title}, ${spec.label} case`}
      tabIndex={-1}
      data-phase={phase}
    >
      <div className="gv-backdrop" data-on={backdrop} />
      <canvas ref={canvasRef} className="gv-canvas" data-on={canvasOn} data-hover={hoverDisc} aria-hidden="true" />

      {phase === "fallback" && <Fallback item={item} />}

      <button ref={closeRef} type="button" className="about-close gv-close" style={closeAt} data-on={ui} aria-label="Close case and return to the shelf" onClick={() => void close()} />

      <div className="about-bottom about-type gv-bottom" data-on={ui || phase === "flying"}>
        <p className="about-credit m-0">
          <span className="about-credit-line">
            <span>{item.title}</span>
          </span>
          <span className="about-credit-line">
            <span>{item.credit}</span>
          </span>
        </p>
        <div className="gv-tools" data-on={ui}>
          {phase !== "fallback" && discCount > 0 && inHand === null && (
            <span className="gv-group">
              {discCount === 1 ? (
                <button type="button" className="about-link" onClick={() => sceneRef.current?.takeOut(0)}>
                  Take out disc
                </button>
              ) : (
                <>
                  <span className="gv-muted">Take out</span>
                  {game.discs.map((_, i) => (
                    <button key={i} type="button" className="about-link" onClick={() => sceneRef.current?.takeOut(i)}>
                      Disc {i + 1}
                    </button>
                  ))}
                </>
              )}
            </span>
          )}
          {phase !== "fallback" && inHand !== null && (
            <button type="button" className="about-link" onClick={() => sceneRef.current?.putBack()}>
              {discCount > 1 ? `Put disc ${inHand + 1} back` : "Put disc back"}
            </button>
          )}
          {phase !== "fallback" && (
            <button type="button" className="about-link gv-reset" onClick={() => sceneRef.current?.reset()}>
              Reset view
            </button>
          )}
          {touch ? (
            <button type="button" className="about-link" onClick={() => void close()}>
              Close
            </button>
          ) : (
            <span className="gv-muted gv-esc">Esc to close</span>
          )}
        </div>
      </div>

      <p className="gv-hint about-type m-0" data-on={!!hint} aria-hidden="true">
        <span className="gv-hint-icon" data-kind={hint?.startsWith("Drag") ? "drag" : "tap"} />
        <span key={hint ?? "none"} className="gv-hint-text">
          {hint ?? ""}
        </span>
      </p>
      <p className="sr-only" aria-live="polite">
        {phase === "open"
          ? inHand !== null
            ? `Disc ${inHand + 1} is out. Drag or use the arrow keys to turn it; press D or the button to put it back.`
            : `${item.title} is open. Drag or use the arrow keys to turn the case.${discCount ? " Press D to take the disc out." : " The case is empty."}`
          : ""}
      </p>
    </div>
  )
}

// No WebGL: the case laid out flat, front cover and disc side by side.
function Fallback({ item }: { item: Favorite }) {
  const game = item.game!
  const spec = cases[game.platform]
  const ratio = spec.w / spec.h
  return (
    <div className="gv-fallback" style={{ "--r": ratio } as CSSProperties}>
      <div
        className="gv-fallback-cover"
        style={{
          backgroundImage: `url(${game.wrap})`,
          backgroundSize: `${(1 / (1 - SPINE_U0 - 14 / 284)) * 100}% 100%`,
          backgroundPosition: "100% 0",
          borderColor: `rgb(${spec.plastic.map((c) => Math.round(c * 255)).join(" ")})`,
        }}
      />
      {game.discs.map((d) => (
        <div key={d} className="gv-fallback-disc" style={{ backgroundImage: `url(${d})` }} />
      ))}
    </div>
  )
}
