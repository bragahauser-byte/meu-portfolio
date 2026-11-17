import { Fragment, useEffect, useRef, useState } from "react"
import type { CSSProperties } from "react"
import "./intro.css"

// ── Opening sequence ─────────────────────────────────────────────────────────
// Plays once per session while the site actually loads (fonts + home images).
// A 2px bar grows across the top with the real
// progress, the counter and the year tick up, and a line from the About text
// comes out of a blur. At 100% everything clears and the panel lifts like a
// curtain, handing over to the Home entrance underneath.
//
// The shown progress is min(real, time): fast connections still get the full
// rhythm (never under MIN_MS), slow ones never see a bar that lies.

const MIN_MS = 4400
const HOLD_MS = 600
const OUT_MS = 1900
const REVEAL_AT = 700 // ms into the exit when the Home starts its entrance
const MAX_WAIT_MS = 8000

const phrase = "If it doesn't make someone's life a little easier, what's the point?"

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

function preload(src: string) {
  return new Promise<void>((resolve) => {
    const img = new Image()
    img.onload = img.onerror = () => resolve()
    img.src = src
  })
}

export default function Intro({
  assets,
  reducedMotion,
  onReveal,
  onDone,
}: {
  assets: string[]
  reducedMotion: boolean
  onReveal: () => void
  onDone: () => void
}) {
  const [shown, setShown] = useState(0) // 0–1
  const [phase, setPhase] = useState<"in" | "out">("in")
  const real = useRef(0)
  const onRevealRef = useRef(onReveal)
  const onDoneRef = useRef(onDone)
  onRevealRef.current = onReveal
  onDoneRef.current = onDone

  // real loading progress
  useEffect(() => {
    const jobs: Promise<unknown>[] = [
      document.fonts?.load('400 16px "PP Neue Montreal"').catch(() => undefined) ?? Promise.resolve(),
      document.fonts?.load('400 40px "PP Neue Montreal"').catch(() => undefined) ?? Promise.resolve(),
      ...assets.map(preload),
    ]
    let done = 0
    jobs.forEach((j) =>
      j.then(() => {
        done++
        real.current = done / jobs.length
      }),
    )
    const giveUp = window.setTimeout(() => (real.current = 1), MAX_WAIT_MS)
    return () => window.clearTimeout(giveUp)
  }, [assets])

  // displayed progress
  useEffect(() => {
    const minMs = reducedMotion ? 600 : MIN_MS
    const t0 = performance.now()
    let raf = 0
    let value = 0
    const tick = (now: number) => {
      const time = easeInOut(Math.min(1, (now - t0) / minMs))
      const goal = Math.min(real.current, time)
      value += (goal - value) * 0.12
      if (goal >= 1 && 1 - value < 0.004) value = 1
      setShown(value)
      if (value < 1) raf = requestAnimationFrame(tick)
      else {
        window.setTimeout(() => setPhase("out"), HOLD_MS)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reducedMotion])

  // exit
  useEffect(() => {
    if (phase !== "out") return
    const total = reducedMotion ? 320 : OUT_MS
    const a = window.setTimeout(() => onRevealRef.current(), reducedMotion ? 0 : REVEAL_AT)
    const b = window.setTimeout(() => onDoneRef.current(), total)
    return () => {
      window.clearTimeout(a)
      window.clearTimeout(b)
    }
  }, [phase, reducedMotion])

  const pct = Math.round(shown * 100)
  const year = 2024 + Math.min(2, Math.floor(shown * 2.999))
  const words = phrase.split(" ")

  return (
    <div className="intro" data-phase={phase} data-reduced={reducedMotion} aria-hidden="true">
      <div className="intro-panel">
        <div className="intro-bar" style={{ transform: `scaleX(${shown})` }} />

        <div className="intro-block intro-tl">
          {["Gabriel Braga", "Designer", "São Paulo, Brazil"].map((t, i) => (
            <span key={t} className="intro-line">
              <span style={{ "--i": i } as CSSProperties}>{t}</span>
            </span>
          ))}
        </div>

        <div className="intro-block intro-tr">
          <span className="intro-line">
            <span className="intro-num" style={{ "--i": 1 } as CSSProperties}>
              {pct}%
            </span>
          </span>
        </div>

        <div className="intro-block intro-bl">
          <span className="intro-line">
            <span style={{ "--i": 3 } as CSSProperties}>Selected work</span>
          </span>
          <span className="intro-line">
            <span className="intro-num" style={{ "--i": 4 } as CSSProperties}>
              (2024—{year})
            </span>
          </span>
        </div>

        <p className="intro-phrase">
          {words.map((w, i) => (
            <Fragment key={i}>
              {i > 0 && " "}
              <span className="intro-word" style={{ "--w": i } as CSSProperties}>
                {w}
              </span>
            </Fragment>
          ))}
        </p>
      </div>
    </div>
  )
}
