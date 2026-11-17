import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import type { CSSProperties, ReactNode } from "react"
import Carousel3D from "./Carousel3D"
import { aboutParagraphs, categoryLabel, favorites } from "./data"
import type { Category } from "./data"
import { useTrack } from "./useTrack"
import "./about.css"

export type AboutView = "about" | Category

const categories: Category[] = ["albums", "films", "books"]

const links = {
  workco: "https://www.work.co/",
  cherey: "https://www.instagram.com/cherey.br/",
  anhembi: "https://landing.anhembi.br/curso/design-digital-bacharelado",
}

// Keeps the previous view mounted for a moment so it can leave (blur + fade)
// while the next one enters.
function usePresence<T>(value: T, ms: number) {
  const [shown, setShown] = useState(value)
  const [leaving, setLeaving] = useState(false)
  useEffect(() => {
    if (value === shown) return
    setLeaving(true)
    const t = window.setTimeout(() => {
      setShown(value)
      setLeaving(false)
    }, ms)
    return () => window.clearTimeout(t)
  }, [value, shown, ms])
  return [shown, leaving] as const
}

function useMedia(query: string) {
  const [m, setM] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setM(mq.matches)
    on()
    mq.addEventListener("change", on)
    return () => mq.removeEventListener("change", on)
  }, [query])
  return m
}

// Same cursor as the Home: a 20px dot in the site's black that turns red
// over anything clickable that is a link or button.
function DotCursor() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return
      el.style.opacity = "1"
      el.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`
      const over = !!(e.target as Element | null)?.closest?.("a, button")
      el.dataset.link = String(over)
    }
    const leave = () => (el.style.opacity = "0")
    window.addEventListener("pointermove", move)
    document.documentElement.addEventListener("pointerleave", leave)
    return () => {
      window.removeEventListener("pointermove", move)
      document.documentElement.removeEventListener("pointerleave", leave)
    }
  }, [])
  return <div ref={ref} className="about-cursor" aria-hidden="true" />
}

function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className="about-link" href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  )
}

export default function AboutPage({
  view,
  onNavigate,
  onClose,
}: {
  view: AboutView
  onNavigate: (view: AboutView) => void
  onClose: () => void
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const col2Ref = useRef<HTMLDivElement>(null)
  const col4Ref = useRef<HTMLDivElement>(null)
  const reducedMotion = useMedia("(prefers-reduced-motion: reduce)")
  const hasHover = useMedia("(hover: hover) and (pointer: fine)")
  const [shown, leaving] = usePresence(view, reducedMotion ? 120 : 340)
  const [anchor, setAnchor] = useState(372)

  // Share the header's live column edges with the body, the bottom row and
  // the carousel (the active item lines up with the Experience column).
  useLayoutEffect(() => {
    const root = rootRef.current
    const c2 = col2Ref.current
    const c4 = col4Ref.current
    if (!root || !c2 || !c4) return
    const update = () => {
      const r2 = c2.getBoundingClientRect()
      const r4 = c4.getBoundingClientRect()
      root.style.setProperty("--c2", `${r2.left}px`)
      root.style.setProperty("--c4", `${r4.left}px`)
      root.style.setProperty("--c4r", `${r4.right}px`)
      const pad = parseFloat(getComputedStyle(root).getPropertyValue("--pad")) || 32
      setAnchor(window.innerWidth >= 1360 ? r2.left : pad)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(root)
    document.fonts?.ready.then(update)
    return () => ro.disconnect()
  }, [])

  // Esc leaves: category → About → Home
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      if (view === "about") onClose()
      else onNavigate("about")
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [view, onClose, onNavigate])

  useEffect(() => {
    rootRef.current?.scrollTo({ top: 0 })
  }, [shown])

  const isScene = shown !== "about"

  return (
    <div
      ref={rootRef}
      className="about fixed inset-0"
      data-enter="true"
      data-cursor={hasHover ? "dot" : "auto"}
      style={{ overflowY: isScene ? "hidden" : "auto", overflowX: "hidden" }}
    >
      <header className="about-header about-type">
        <div className="about-col" data-col="1" style={{ "--i": 0 } as CSSProperties}>
          <p className="about-title">Gabriel Braga</p>
          <p>Designer</p>
          <p>São Paulo, Brazil</p>
        </div>
        <div ref={col2Ref} className="about-col" data-col="2" style={{ "--i": 1 } as CSSProperties}>
          <p className="about-title">Experience</p>
          <p>
            <Ext href={links.workco}>Work &amp; Co</Ext> — Designer, 2026
          </p>
          <p>
            <Ext href={links.cherey}>Cherey</Ext> — Internship, 2024–2026
          </p>
        </div>
        <div className="about-col" data-col="3" style={{ "--i": 2 } as CSSProperties}>
          <p className="about-title">Education</p>
          <p>
            <Ext href={links.anhembi}>Digital Design — Anhembi Morumbi</Ext>, 2023–2026
          </p>
        </div>
        <div ref={col4Ref} className="about-col" data-col="4" style={{ "--i": 3 } as CSSProperties}>
          <p className="about-title">
            <button type="button" className="about-link" onClick={() => onNavigate("about")}>
              Favorites
            </button>
          </p>
          {categories.map((c) => (
            <p key={c}>
              <button
                type="button"
                className="about-link about-fav"
                aria-current={view === c ? "page" : undefined}
                onClick={() => onNavigate(view === c ? "about" : c)}
              >
                {categoryLabel[c]}
              </button>
            </p>
          ))}
        </div>
        <button
          type="button"
          className="about-close"
          aria-label={view === "about" ? "Close About" : "Back to About"}
          onClick={() => (view === "about" ? onClose() : onNavigate("about"))}
        />
      </header>

      <div className="about-view" data-leaving={leaving}>
        {shown === "about" ? (
          <AboutBody />
        ) : (
          <FavoritesScene key={shown} kind={shown} anchor={anchor} reducedMotion={reducedMotion} />
        )}
      </div>

      {hasHover && <DotCursor />}
    </div>
  )
}

// ── About text ───────────────────────────────────────────────────────────────
// Five paragraphs. Words rise out of a blur line by line; lines are measured
// after the font has loaded so the stagger follows the real justified layout.
// A link is one unit, so it never breaks across lines.
function AboutBody() {
  const ref = useRef<HTMLDivElement>(null)
  const [lines, setLines] = useState<number[] | null>(null)

  useEffect(() => {
    let cancelled = false
    const measure = () => {
      const el = ref.current
      if (!el || cancelled) return
      let line = -1
      let lastTop = Number.NaN
      setLines(
        Array.from(el.querySelectorAll<HTMLElement>(".about-word")).map((w) => {
          const top = w.getBoundingClientRect().top
          if (Math.abs(top - lastTop) > 4) {
            lastTop = top
            line++
          }
          return line
        }),
      )
    }
    Promise.race([
      document.fonts?.load('400 40px "PP Neue Montreal"').catch(() => undefined),
      new Promise((r) => setTimeout(r, 800)),
    ]).then(measure)
    return () => {
      cancelled = true
    }
  }, [])

  let n = 0
  return (
    <div ref={ref} className="about-body" data-ready={lines !== null}>
      {aboutParagraphs.map((para, pi) => (
        <p key={pi}>
          {para.map((seg, si) => {
            if (typeof seg !== "string") {
              const i = n++
              return (
                <span key={si} className="about-word" style={{ "--l": lines?.[i] ?? 0 } as CSSProperties}>
                  <a className="about-link about-link-body" href={seg.href} target="_blank" rel="noreferrer">
                    {seg.text}
                  </a>
                </span>
              )
            }
            // keep leading/trailing spaces so words and links stay apart
            const parts = seg.split(/(\s+)/)
            return (
              <Fragment key={si}>
                {parts.map((p, k) => {
                  if (p === "") return null
                  if (/^\s+$/.test(p)) return " "
                  const i = n++
                  return (
                    <span key={k} className="about-word" style={{ "--l": lines?.[i] ?? 0 } as CSSProperties}>
                      {p}
                    </span>
                  )
                })}
              </Fragment>
            )
          })}
        </p>
      ))}
    </div>
  )
}

// ── Favorites scene: 3D carousel + credits (+ sound for albums) ─────────────
function FavoritesScene({
  kind,
  anchor,
  reducedMotion,
}: {
  kind: Category
  anchor: number
  reducedMotion: boolean
}) {
  const items = favorites[kind]
  const [active, setActive] = useState(0)
  const [touched, setTouched] = useState(false)
  const item = items[active]
  const track = kind === "albums" ? item.track ?? null : null
  const { playing, muted, toggle } = useTrack(track?.src ?? null)

  const onActiveChange = useCallback((i: number) => setActive(i), [])
  const onActivate = useCallback(() => {
    if (kind === "albums") toggle()
  }, [kind, toggle])

  useEffect(() => {
    const on = () => setTouched(true)
    window.addEventListener("wheel", on, { once: true })
    window.addEventListener("pointerdown", on, { once: true })
    return () => {
      window.removeEventListener("wheel", on)
      window.removeEventListener("pointerdown", on)
    }
  }, [])

  return (
    <>
      <Carousel3D
        kind={kind}
        items={items}
        anchor={anchor}
        playing={playing}
        reducedMotion={reducedMotion}
        onActiveChange={onActiveChange}
        onActivate={onActivate}
      />

      <div className="about-bottom about-type">
        <p className="about-credit m-0" data-anim="true" key={item.slug} aria-live="polite">
          <span className="about-credit-line">
            <span>{item.title}</span>
          </span>
          <span className="about-credit-line">
            <span>{item.credit}</span>
          </span>
        </p>

        {track && (
          <div className="about-sound">
            <button type="button" onClick={toggle} aria-pressed={!muted} aria-label={muted ? "Turn sound on" : "Turn sound off"}>
              <span className="eq" data-on={playing} aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
              </span>
            </button>
            <span className="about-credit-line about-sound-track" key={track.src} title={track.title}>
              <span style={{ animation: "credit-in 620ms var(--ease-enter) 80ms both" }}>{track.title}</span>
            </span>
          </div>
        )}
      </div>

      {!touched && !track && (
        <p className="about-hint about-type m-0" aria-hidden="true">
          Scroll
        </p>
      )}
    </>
  )
}
