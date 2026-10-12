import {
  Fragment,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useRef,
} from "react"
import type { CSSProperties, RefObject } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import seo from "./seo.json"

// ── Home carousel images ──────────────────────────────────────────────────────
import imgC0 from "@/imports/Home/b9f92c64362555697b1bf52070200b5776449dd9.png"
import imgC1 from "@/imports/Home/4b5167c4a83880a558c5b79baa6ae60061ce52f8.png"
import imgC2 from "@/imports/Home/b58f7daf888dd48b7986d465085c4fdbcd6f8c99.png"
import imgC3 from "@/imports/Home/aa654c04a6f140ac88b78962f565617c7dcaa413.png"
import imgC4 from "@/imports/Home/004629f91487238df39fc28fee710a8cab755db8.png"
import imgC5 from "@/imports/Home/af2de6f8c956799a70ea9619414a9a2c14e518b4.png"
import imgC6 from "@/imports/Home/cd6a0912d75915aaed59d8e5bec53dd84e0c0c5d.png"
import imgC7 from "@/imports/Home/8fd822f7ab07d7a0c81ff2fde78f8afcc6dee1cb.png"

// ── Playstation detail ────────────────────────────────────────────────────────
import imgPS1 from "@/imports/Playstation-1/b9f92c64362555697b1bf52070200b5776449dd9.png"
import imgPS2 from "@/imports/Playstation-1/712bc7808b04958224ac8952234b52ff22823da0.png"
import imgPS3 from "@/imports/Playstation-1/399f11adf248c3bddad6aa41d12930562278241a.png"
import imgPS4 from "@/imports/Playstation-1/d141364c892e76f9f0086baf105fbc5003b811df.png"
import imgPS5 from "@/imports/Playstation-1/1bfd329f51e198222cbf1335e958f93e9bbef465.png"
import imgPS6 from "@/imports/Playstation-1/957bca79229f9f620b8e6263af445e3b16bc178b.png"

// ── Decolar detail ────────────────────────────────────────────────────────────
import imgDec1 from "@/imports/Decolar/1.jpg"
import imgDec2 from "@/imports/Decolar/2.jpg"
import imgDec3 from "@/imports/Decolar/3.jpg"
import imgDec4 from "@/imports/Decolar/4.jpg"
import imgDec5 from "@/imports/Decolar/5.jpg"
import imgDec6 from "@/imports/Decolar/6.jpg"
import imgDec7 from "@/imports/Decolar/7.jpg"
import imgDec8 from "@/imports/Decolar/8.jpg"
import imgDec9 from "@/imports/Decolar/9.jpg"
import imgDec10 from "@/imports/Decolar/10.jpg"

// ── Soundroom detail ──────────────────────────────────────────────────────────
import imgSnd1 from "@/imports/Soundroom/5c1c7db8bda671d3301de454303f2df32f7f02e6.png"
import imgSnd2 from "@/imports/Soundroom/b3e76a13886665494eb1e3bd7733419efa6ad114.png"
import imgSnd3 from "@/imports/Soundroom/b729fc34dc283d938b246926ebce3bc057101490.png"
import imgSnd4 from "@/imports/Soundroom/d34bc3c6bfe03581ef4b363fef18edb46113864f.png"
import imgSnd5 from "@/imports/Soundroom/608d83c88b6e1960d9629dc8ad826e8cca3bb30f.png"
import imgSnd6 from "@/imports/Soundroom/d3277e896ea1e722febcfba8f22e8cdab3ba256d.png"

// ── Types & data ──────────────────────────────────────────────────────────────
type ProjectId = "playstation" | "decolar" | "soundroom"

// "bg" marks a mockup slide with a flat background: the mobile gallery shows
// these whole (object-contain, blending into bg) instead of cropping them.
// Full-bleed photos have no bg and are always object-cover.
const carouselItems: { img: string; project: ProjectId; bg?: string }[] = [
  { img: imgC0, project: "playstation", bg: "#0B0C10" },
  { img: imgC1, project: "playstation" },
  { img: imgC2, project: "decolar", bg: "#F4F5F0" },
  { img: imgC3, project: "decolar" },
  { img: imgC4, project: "decolar", bg: "#F4F5F0" },
  { img: imgC5, project: "soundroom", bg: "#0B0C10" },
  { img: imgC6, project: "soundroom", bg: "#0B0C10" },
  { img: imgC7, project: "soundroom", bg: "#0B0C10" },
]

const psText = [
  `Over the past decade, the gaming market has undergone a structural shift, with a growing number of gamers migrating from consoles to PC, driven by flexibility, performance, and more affordable price points. While competitors like Xbox have moved forward with initiatives such as Game Pass for PC, PlayStation has maintained a strong reliance on its console ecosystem. PlayStation Connect emerges as an exploration of how the brand could strategically enter the PC gaming space without diluting its premium positioning.`,
  `The main friction lies not in interest in the games themselves, but in the commitment to the hardware. Many PC gamers don't reject PlayStation titles, but they avoid the need to purchase an additional console. They seek more direct access, more flexible pricing models, and continuity across devices — something the current ecosystem doesn't consistently provide. Understanding this, the goal became clear: create a structured way to expand PlayStation's presence on PC, offering a centralized experience that eliminated barriers to entry and adapted to the habits of this audience. More than just distributing games, the intention was to build a new gateway for the brand.`,
  `The answer was PlayStation Connect, a dedicated launcher that consolidates distribution, identity, and access on a single platform. Since hardware commitment was the biggest barrier, the experience was designed to be fully native to PC, with no console required. Account continuity ensures that progress, trophies, and libraries carry over seamlessly across devices, closing the gap that currently pushes PC gamers away, while a subscription model responds to this audience's expectation for more flexible pricing. Together, these pieces turn Connect into a bridge between the PlayStation ecosystem and this new context of use, rather than just another storefront for ports.`,
  `As a result, the project repositions PlayStation's presence on PC, moving away from a collection of isolated ports and towards a platform strategy. By reducing access friction and expanding brand reach, the solution points to a future where value lies less in hardware and more in the integrated service experience. If this platform were live, I would track launcher downloads, subscription conversion, and account-linking rates between console and PC as core indicators of adoption, complemented by a post-launch survey to understand how PC gamers perceive the brand's accessibility now that hardware is no longer the entry point.`,
]

const decolarText = [
  `Planning a trip with friends seems exciting at first, but it can quickly turn into a problem. What starts simple transforms into long conversations, too many options, indecision, and lack of progress. Differences in expectations, budget, travel styles, and availability make it difficult for the group to align, and often the trip doesn't even happen. For platforms like Decolar, this is a critical point, since everything depends on the user's decision.`,
  `The main difficulty lies in the group process itself. Much of the planning happens outside the product, through WhatsApp conversations, shared links, and different opinions. Aligning everything manually takes time, generates doubts, and ultimately stalls the decision. The longer the group takes, the greater the chance of losing interest and giving up altogether. The goal of the project was to make this process simpler and more organized, helping the group reach a decision more quickly and clearly — not by eliminating collaboration, but by better structuring how it happens.`,
  `The insight was realizing that the problem isn't a lack of options, but a lack of clarity. When each person can express their preferences individually, and this input is organized intelligently, deciding becomes much easier. From there, the solution took shape as a system based on a quick quiz, where each person indicates their budget, dates, travel style, and interests. Based on these answers, the product suggests three destinations that best match the group's profile, showing a compatibility percentage for each one to help guide the choice.`,
  `As a result, the process becomes less confusing and more guided, increasing the chances of the group actually making a decision. And if it's not yet time to buy, the experience continues through a shared piggy bank, helping the group manage money together and stay engaged until the trip finally happens.`,
]

const soundroomText = [
  `Music consumption has never been so intense on a global scale, with listeners dedicating hours a week to listening. Even so, the way music is experienced and discussed has become progressively superficial, shaped by algorithms and fragmented habits. Soundroom emerges in this context proposing a change of perspective: treating music not only as content to be consumed, but as culture to be reflected upon, shared, and debated.`,
  `The main friction lies in the contrast between frequency and depth. Although music is a constant part of daily life, meaningful engagement — especially with full albums and independent artists — has been weakening. Listening becomes passive, guided by automatic recommendations, while critical analysis is restricted to a few. This limits discovery and impoverishes the user's relationship with music.`,
  `The goal of the project was to deepen this relationship, encouraging more conscious and participatory listening. The proposal is not to compete with platforms like Spotify, but to complement the existing ecosystem with a layer that values expression, exchange, and discovery guided by people.`,
  `The key insight was understanding that the problem isn't a lack of access to music, but a lack of spaces that encourage reflection and dialogue. When the user stops being just a consumer and starts expressing themselves about what they hear, the experience becomes richer, more memorable, and more meaningful. From there, the solution took shape as a social platform dedicated to the musical experience, where users can record their listening sessions, write entries, create playlists, follow friends, and discover new artists within the community.`,
  `As a result, the project culturally deepens an already recurring habit, encouraging the listening of albums as complete works and expanding the visibility of independent artists. By reducing dependence on algorithmic trends, Soundroom repositions music as an active experience — something that is not only listened to, but interpreted, discussed, and preserved.`,
]

const projects: Record<ProjectId, {
  title: string
  subtitle: string
  paragraphs: string[]
  images: string[]
}> = {
  playstation: {
    title: "Playstation",
    subtitle: "Design study",
    paragraphs: psText,
    images: [imgPS1, imgPS2, imgPS3, imgPS4, imgPS5, imgPS6],
  },
  decolar: {
    title: "Decolar",
    subtitle: "Design study",
    paragraphs: decolarText,
    images: [
      imgDec1,
      imgDec2,
      imgDec3,
      imgDec4,
      imgDec5,
      imgDec6,
      imgDec7,
      imgDec8,
      imgDec9,
      imgDec10,
    ],
  },
  soundroom: {
    title: "Soundroom",
    subtitle: "University Project",
    paragraphs: soundroomText,
    images: [imgSnd1, imgSnd2, imgSnd3, imgSnd4, imgSnd5, imgSnd6],
  },
}

// ── Shared media-query hook ───────────────────────────────────────────────────
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches,
  )

  useEffect(() => {
    const mq = window.matchMedia(query)
    const update = () => setMatches(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [query])

  return matches
}

// Custom fixed-position cursors (ViewCursor, CloseCursor, HomePageCursor) only
// make sense on pointer devices with real hover: on touch, there is no
// mouseleave when a finger lifts, so they would stay stuck floating at the
// last tap position. Callers gate rendering on this and fall back to the
// browser's normal cursor.
function useHasHover() {
  return useMediaQuery("(hover: hover) and (pointer: fine)")
}

// The scroll-controlled project navigation and the vertical gallery are two
// different interactions for the same data — this is the single switch
// between them, matching the `lg` (1024px) Tailwind breakpoint used for the
// rest of the responsive layout.
function useIsDesktop() {
  return useMediaQuery("(min-width: 1024px)")
}

function usePrefersReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)")
}

// ── Cursors ───────────────────────────────────────────────────────────────────
function CloseCursor({ x, y }: { x: number; y: number }) {
  return (
    <div
      className="pointer-events-none fixed z-[9999]"
      style={{ left: x, top: y, transform: "translate(-50%, -50%)" }}
    >
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path
          d="M3 3L19 19"
          stroke="#1a1a1a"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M19 3L3 19"
          stroke="#1a1a1a"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}

// Over the home desktop project images: a plain white circle blended with
// `mix-blend-mode: difference`, so whatever sits under the cursor — image,
// text, flat background — reads as its own color inverted. No icon: the
// inversion itself is the affordance, and drawing anything on top of it would
// just sit on top of the effect instead of taking part in it.
function ImageInvertCursor({
  x,
  y,
  visible,
}: {
  x: number
  y: number
  visible: boolean
}) {
  // `transform` and `mix-blend-mode` live on the same element deliberately:
  // a transformed *ancestor* creates its own stacking context and isolates
  // blending inside it, so the circle would only ever blend against its own
  // (empty) wrapper and paint as flat white instead of inverting the page.
  return (
    <div
      className="pointer-events-none fixed z-[9998] rounded-full bg-white"
      style={{
        left: x,
        top: y,
        width: 64,
        height: 64,
        mixBlendMode: "difference",
        transform: `translate(-50%, -50%) scale(${visible ? 1 : 0})`,
        transition: "transform 220ms var(--ease-standard)",
      }}
    />
  )
}

function HomePageCursor({
  x,
  y,
  hidden,
  overLink,
}: {
  x: number
  y: number
  hidden: boolean
  overLink: boolean
}) {
  if (hidden) return null
  return (
    <div
      className="pointer-events-none fixed z-[9998]"
      style={{ left: x, top: y, transform: "translate(-50%, -50%)" }}
    >
      <div
        className="rounded-full"
        style={{
          width: 20,
          height: 20,
          // same color + timing as the link hover, so dot and text change together
          backgroundColor: overLink ? "var(--link-hover)" : "#000",
          transition: "background-color 150ms var(--ease-standard)",
        }}
      />
    </div>
  )
}

// ── Home page ─────────────────────────────────────────────────────────────────
type HeroWord = {
  text: string
  tone: "dark" | "gray"
  href?: string
  after?: string
}

// Words (not lines) are the animated unit: after fonts load we measure which
// visual line each word landed on and stagger by line. "Work & Co" is a single
// unbreakable unit and carries its trailing comma outside the link.
const heroWords: HeroWord[] = [
  { text: "Hi!", tone: "dark" },
  { text: "I'm", tone: "dark" },
  { text: "Gabriel", tone: "dark" },
  { text: "Braga,", tone: "dark" },
  { text: "a", tone: "gray" },
  { text: "designer", tone: "gray" },
  { text: "at", tone: "gray" },
  { text: "Work & Co", tone: "gray", href: "https://www.work.co/", after: "," },
  { text: "based", tone: "gray" },
  { text: "in", tone: "gray" },
  { text: "São", tone: "gray" },
  { text: "Paulo.", tone: "gray" },
]

const footerLinks = [
  { label: "Linkedin", href: "https://www.linkedin.com/in/gabriel-bragaa/" },
  { label: "Medium", href: "https://medium.com/@bragahauser" },
  { label: "Github", href: "https://github.com/bragahauser-byte" },
]

// Where a desktop project transition starts: the on-screen box of the image
// being flown and which image it shows.
type FlightOrigin = { rect: DOMRect; img: string }

type EnterPhase = "wait" | "run" | "fast"

const ENTERED_KEY = "portfolio:home-entered"
// Safety net: never keep the page hidden longer than this waiting on assets.
const ENTER_GATE_TIMEOUT_MS = 1000
// Fallback open/close for the project overlay (mobile, direct links, browser
// back): a quick scale + fade.
const TRANSITION_MS = 200
const REDUCED_MOTION_MS = 150

// Desktop scroll between projects: the current image fades to white, then the
// new one fades in — fade, white, fade. Input stays locked for the whole
// sequence so a single wheel gesture can't fire more than one change.
const SWAP_OUT_MS = 110
const SWAP_IN_MS = 170
const SWAP_LOCK_MS = SWAP_OUT_MS + SWAP_IN_MS

// Desktop home ↔ project: the card grows from the home frame to the project's
// first image (its left edge travels right → left) while the text on the left
// swaps with a short fade.
const FLIGHT_MS = 520
const FLIGHT_EASE = "cubic-bezier(0.6, 0, 0.2, 1)"
// When the incoming text starts fading in, relative to the flight's start.
const FLIGHT_TEXT_IN_MS = 300

function hasEnteredThisSession() {
  try {
    return sessionStorage.getItem(ENTERED_KEY) === "1"
  } catch {
    return false
  }
}

function markEnteredThisSession() {
  try {
    sessionStorage.setItem(ENTERED_KEY, "1")
  } catch {
    /* storage unavailable — animation just replays next visit */
  }
}

// Index of the visual line each hero word sits on (0, 1, 2…).
function measureHeroLines(root: HTMLElement | null): number[] {
  if (!root) return []
  let line = -1
  let lastTop = Number.NaN
  return Array.from(root.querySelectorAll<HTMLElement>(".hero-word")).map(
    (el) => {
      if (el.offsetTop !== lastTop) {
        lastTop = el.offsetTop
        line++
      }
      return line
    },
  )
}

// Holds the Home in its hidden "from" state until the font and the first
// panel image are ready (or ~1s passes), so the panel never animates empty and
// the image never "jumps" in afterwards. Full sequence plays once per session.
function useHomeEntrance(heroRef: RefObject<HTMLElement | null>) {
  const [phase, setPhase] = useState<EnterPhase>("wait")
  const [lines, setLines] = useState<number[]>([])

  useEffect(() => {
    let cancelled = false
    const seen = hasEnteredThisSession()

    const fontReady = Promise.all([
      document.fonts?.load('400 32px "Plus Jakarta Sans"'),
      document.fonts?.ready,
    ]).catch(() => undefined)

    const firstImage = new Image()
    firstImage.src = carouselItems[0].img
    const imageReady = firstImage.decode().catch(() => undefined)

    const timeout = new Promise<void>((resolve) =>
      setTimeout(resolve, ENTER_GATE_TIMEOUT_MS),
    )

    Promise.race([Promise.all([fontReady, imageReady]), timeout]).then(() => {
      if (cancelled) return
      setLines(measureHeroLines(heroRef.current))
      setPhase(seen ? "fast" : "run")
      markEnteredThisSession()
    })

    return () => {
      cancelled = true
    }
  }, [heroRef])

  return { phase, lines }
}

function HomePage({
  onOpenProject,
  isActive,
  chromeVisible,
  panelHidden,
}: {
  onOpenProject: (id: ProjectId, origin?: FlightOrigin) => void
  isActive: boolean
  // hero, footer and image counter — faded out while a project is open
  chromeVisible: boolean
  // the image frame itself — hidden while its flying copy is on screen
  panelHidden: boolean
}) {
  const [idx, setIdx] = useState(0)
  const [cursor, setCursor] = useState({ x: 0, y: 0 })
  const [viewCursorVisible, setViewCursorVisible] = useState(false)
  const [overLink, setOverLink] = useState(false)
  const heroRef = useRef<HTMLHeadingElement>(null)
  const { phase, lines } = useHomeEntrance(heroRef)
  const hasHover = useHasHover()
  const isDesktop = useIsDesktop()
  // Synchronous lock (not state) so a burst of wheel events arriving in the
  // same tick can never slip past the check before the first one lands.
  const isAnimatingRef = useRef(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const goTo = useCallback((delta: 1 | -1) => {
    if (isAnimatingRef.current) return
    setIdx((current) => {
      const next = Math.min(
        Math.max(current + delta, 0),
        carouselItems.length - 1,
      )
      if (next === current) return current
      isAnimatingRef.current = true
      window.setTimeout(() => {
        isAnimatingRef.current = false
      }, SWAP_LOCK_MS)
      return next
    })
  }, [])

  const goToIndex = useCallback((next: number) => {
    if (isAnimatingRef.current) return
    setIdx((current) => {
      if (next === current) return current
      isAnimatingRef.current = true
      window.setTimeout(() => {
        isAnimatingRef.current = false
      }, SWAP_LOCK_MS)
      return next
    })
  }, [])

  // Desktop-only: one wheel gesture or arrow-key press moves exactly one
  // project, forward or back. Never a free-running or looping carousel.
  useEffect(() => {
    if (!isDesktop || !isActive) return

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 2) return
      e.preventDefault()
      goTo(e.deltaY > 0 ? 1 : -1)
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") goTo(1)
      else if (e.key === "ArrowUp" || e.key === "PageUp") goTo(-1)
    }

    window.addEventListener("wheel", handleWheel, { passive: false })
    window.addEventListener("keydown", handleKey)
    return () => {
      window.removeEventListener("wheel", handleWheel)
      window.removeEventListener("keydown", handleKey)
    }
  }, [isDesktop, isActive, goTo])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setCursor({ x: e.clientX, y: e.clientY })
    setOverLink(!!(e.target as Element).closest("a"))
  }, [])

  const activeProject = carouselItems[idx].project

  const openActive = () => {
    setViewCursorVisible(false)
    const rect = panelRef.current?.getBoundingClientRect()
    onOpenProject(
      activeProject,
      rect ? { rect, img: carouselItems[idx].img } : undefined,
    )
  }

  return (
    // Two different "media" blocks below (desktop scroll-panel / mobile
    // vertical gallery) are shown one at a time via `hidden lg:block` /
    // `lg:hidden` — their behaviour genuinely differs, so they're not forced
    // into one shared markup. The hero and footer stay single elements whose
    // *position* (sticky header → absolute corner) simply changes at `lg`.
    <div
      className="home relative w-full min-h-[100svh] bg-white lg:h-full lg:min-h-0"
      data-enter={phase}
      data-chrome={chromeVisible ? "visible" : "hidden"}
      onMouseMove={handleMouseMove}
      style={{ cursor: hasHover ? "none" : "auto" }}
    >
      {/* Desktop width: 428px (Figma), never reaching into the counter's
          column — viewport minus image, 3×32px gaps/margins, the 8px counter
          and 32px of air before it. */}
      <h1
        ref={heroRef}
        className="hero home-chrome type-hero sticky top-0 z-20 m-0 w-full select-none bg-white px-4 pt-16 pb-6 lg:absolute lg:top-[32px] lg:left-[32px] lg:z-auto lg:w-[min(428px,calc(100vw_-_var(--home-img-w)_-_136px))] lg:bg-transparent lg:p-0"
      >
        {heroWords.map((w, i) => (
          <Fragment key={i}>
            {i > 0 && " "}
            <span
              className="hero-word inline-block whitespace-nowrap"
              style={
                {
                  // gray copy trails the dark copy by half a step
                  "--i": (lines[i] ?? 0) + (w.tone === "gray" ? 0.5 : 0),
                  color: w.tone === "gray" ? "#757575" : "#1A1A1A",
                } as CSSProperties
              }
            >
              {w.href ? (
                <>
                  <a
                    href={w.href}
                    target="_blank"
                    rel="noreferrer"
                    className="link-underline"
                    style={
                      {
                        cursor: hasHover ? "none" : "auto",
                        "--u-bottom": "0.06em",
                      } as CSSProperties
                    }
                  >
                    {w.text}
                  </a>
                  {w.after}
                </>
              ) : (
                w.text
              )}
            </span>
          </Fragment>
        ))}
      </h1>

      {/* ── Desktop (lg+): one project fills the frame (1074×1016 at 1920,
          32px from the top/right/bottom); scrolling or the arrow keys move
          to the next/previous one — fade out to white, fade the new one in. */}
      <div className="hidden lg:block lg:absolute lg:top-[32px] lg:bottom-[32px] lg:right-[32px] lg:w-[var(--home-img-w)]">
        <div
          ref={panelRef}
          data-home-panel
          className="panel relative h-full w-full overflow-hidden rounded-[12px] bg-white"
          style={{
            cursor: hasHover ? "none" : "pointer",
            visibility: panelHidden ? "hidden" : "visible",
          }}
          onMouseEnter={() => hasHover && setViewCursorVisible(true)}
          onMouseLeave={() => setViewCursorVisible(false)}
          onClick={openActive}
        >
          <div className="panel-media absolute inset-0">
            {carouselItems.map((item, i) => (
              <img
                key={i}
                src={item.img}
                alt=""
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                fetchPriority={i === 0 ? "high" : "low"}
                data-active={i === idx}
                className="absolute inset-0 h-full w-full object-cover pointer-events-none select-none"
                style={{
                  opacity: i === idx ? 1 : 0,
                  // incoming waits for the outgoing to clear: fade → white → fade
                  transition:
                    i === idx
                      ? `opacity ${SWAP_IN_MS}ms var(--ease-standard) ${SWAP_OUT_MS}ms`
                      : `opacity ${SWAP_OUT_MS}ms linear`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Image counter: one 8px dot per home image, 12px apart, vertically
          centred, 32px to the left of the frame. */}
      <div className="home-chrome hidden lg:block lg:absolute lg:top-1/2 lg:-translate-y-1/2 lg:right-[calc(64px_+_var(--home-img-w))] lg:w-2">
        <div className="dots flex flex-col gap-[12px]" aria-label="Projetos">
          {carouselItems.map((item, i) => (
            <button
              key={i}
              type="button"
              aria-label={`${projects[item.project].title} ${i + 1} de ${carouselItems.length}`}
              aria-current={i === idx ? "true" : undefined}
              className="block size-2 rounded-full p-0 border-0"
              style={{
                backgroundColor: i === idx ? "#000000" : "#D9D9D9",
                transition: `background-color ${SWAP_LOCK_MS}ms var(--ease-standard)`,
                cursor: hasHover ? "none" : "pointer",
              }}
              onClick={() => goToIndex(i)}
            />
          ))}
        </div>
      </div>

      {/* ── Mobile / tablet (<lg): every project image, stacked in document
          order, natural scroll — no carousel, no snap, no auto-play. The
          hero above acts as the fixed header via `sticky top-0`. ─────────── */}
      <div className="panel-media flex flex-col gap-4 px-4 pt-10 pb-2 lg:hidden">
        {carouselItems.map((item, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Abrir ${projects[item.project].title}`}
            className="relative block aspect-[4/3] w-full overflow-hidden rounded-[12px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--link-hover)]"
            style={{
              backgroundColor: item.bg,
              cursor: hasHover ? "none" : "pointer",
            }}
            onClick={() => onOpenProject(item.project)}
          >
            <img
              src={item.img}
              alt=""
              loading={i < 2 ? "eager" : "lazy"}
              decoding="async"
              className={`absolute inset-0 h-full w-full pointer-events-none select-none ${
                item.bg ? "object-contain" : "object-cover"
              }`}
            />
          </button>
        ))}
      </div>

      <nav
        aria-label="Links externos"
        className="footer home-chrome type-footer flex flex-wrap gap-x-[40px] gap-y-2 px-4 pb-10 text-[#1A1A1A] lg:absolute lg:bottom-[32px] lg:left-[32px] lg:flex-nowrap lg:px-0 lg:pb-0"
        style={{ "--u-bottom": "-0.1em" } as CSSProperties}
      >
        {footerLinks.map((l, i) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noreferrer"
            className="footer-link link-underline"
            style={
              { cursor: hasHover ? "none" : "auto", "--i": i } as CSSProperties
            }
          >
            {l.label}
          </a>
        ))}
      </nav>

      <p className="sr-only">
        Gabriel Braga (also written Gabriel Braga Hauser or Gabriel Braga
        Houser) is a Product Designer, UX Designer, UI Designer, UX/UI Designer,
        UX Researcher, Interaction Designer, Visual Designer, Digital Designer
        and Graphic Designer based in São Paulo, Brazil, currently at Work & Co.
        Background: Work & Co, Cherey, Beauty Express, Alinea Hair and Digital
        Design at Universidade Anhembi Morumbi.
      </p>
      <p className="sr-only" lang="pt-BR">
        Gabriel Braga (Gabriel Braga Hauser / Houser) é Designer de Produto,
        Designer UX, Designer UI, Designer UX/UI, UX Researcher, Designer de
        Interação, Designer Visual, Designer Digital e Designer Gráfico em São
        Paulo, atualmente na Work & Co.
      </p>
      <nav className="sr-only" aria-label="Case studies">
        {(Object.keys(projects) as ProjectId[]).map((id) => (
          <a
            key={id}
            href={seo.routes[id].path}
            tabIndex={-1}
            onClick={(e) => {
              e.preventDefault()
              onOpenProject(id)
            }}
          >
            {projects[id].title} — {projects[id].subtitle}
          </a>
        ))}
      </nav>

      {hasHover && (
        <ImageInvertCursor
          x={cursor.x}
          y={cursor.y}
          visible={viewCursorVisible}
        />
      )}
      {hasHover && isActive && (
        <HomePageCursor
          x={cursor.x}
          y={cursor.y}
          hidden={viewCursorVisible}
          overLink={overLink}
        />
      )}
    </div>
  )
}

// ── Project page ──────────────────────────────────────────────────────────────
// The desktop text block is sticky. Once it is taller than the viewport a plain
// `top: 32px` would cut off its end, so the stick point moves up: the block
// scrolls until its bottom is 32px above the viewport bottom, then holds there
// while the images keep scrolling. Short blocks behave exactly as before.
function useStickyTop(ref: RefObject<HTMLElement | null>, margin = 32) {
  const [top, setTop] = useState(margin)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () =>
      setTop(Math.min(margin, window.innerHeight - el.offsetHeight - margin))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    window.addEventListener("resize", update)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", update)
    }
  }, [ref, margin])

  return top
}

// The project image the visitor is mostly looking at — where the closing
// flight takes off from.
function mostVisibleProjectImage(root: HTMLElement): FlightOrigin | null {
  let best: FlightOrigin | null = null
  let bestVisible = 0
  for (const img of root.querySelectorAll<HTMLImageElement>(
    "img[data-project-media]",
  )) {
    const rect = img.parentElement!.getBoundingClientRect()
    const visible =
      Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0)
    if (visible > bestVisible) {
      bestVisible = visible
      best = { rect, img: img.currentSrc || img.src }
    }
  }
  return best
}

function ProjectPage({
  id,
  onClose,
  backdropVisible = true,
  mediaVisible = true,
  textVisible = true,
}: {
  id: ProjectId
  onClose: (origin?: FlightOrigin) => void
  // During the desktop flight the page shows only its text: the white
  // backdrop and images stay off so the flying card and the Home beneath
  // read as one surface.
  backdropVisible?: boolean
  mediaVisible?: boolean
  textVisible?: boolean
}) {
  const [cursor, setCursor] = useState({ x: -100, y: -100 })
  const project = projects[id]
  const textBlockRef = useRef<HTMLDivElement>(null)
  const desktopMediaRef = useRef<HTMLDivElement>(null)
  const stickyTop = useStickyTop(textBlockRef)
  const hasHover = useHasHover()

  const textStyle: CSSProperties = {
    opacity: textVisible ? 1 : 0,
    transition: `opacity ${textVisible ? 260 : 140}ms var(--ease-standard)`,
  }

  return (
    // fixed inset-0 so the overlay always covers the full viewport, regardless
    // of whatever scroll position the Home page (behind it) is at.
    <div
      className="fixed inset-0 overflow-y-auto"
      style={{
        cursor: hasHover ? "none" : "auto",
        backgroundColor: backdropVisible ? "#FFFFFF" : "transparent",
      }}
      onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
      onClick={() => {
        const media = desktopMediaRef.current
        // offsetParent is null while the desktop layout is display:none
        onClose(
          media?.offsetParent ? mostVisibleProjectImage(media) ?? undefined : undefined,
        )
      }}
    >
      {/* ── Mobile / tablet layout (< lg) — simple stacked flow ──────────── */}
      <div className="flex flex-col gap-10 p-6 md:p-10 lg:hidden">
        <div>
          <p className="type-title m-0 text-[#1A1A1A]">{project.title}</p>
          <p className="type-title m-0 text-[#757575]">{project.subtitle}</p>
        </div>
        <div className="flex flex-col gap-[28px]">
          {project.paragraphs.map((p, i) => (
            <p
              key={i}
              className="type-body m-0 text-[#333333] [word-break:break-word]"
            >
              {p}
            </p>
          ))}
        </div>
        <div className="flex flex-col gap-[20px]">
          {project.images.map((img, i) => (
            <div
              key={i}
              className="relative w-full aspect-[4/3] rounded-[12px] overflow-hidden"
            >
              <img
                src={img}
                alt=""
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Desktop layout (>= lg) — two-column sticky design ────────────── */}
      {/* No `items-start` here: the row keeps the default `stretch`, so the
          Left column's box grows to match the Right column's full height.
          That gives the sticky text room to stick — and, combined with the
          32px bottom padding on Left, it stops with a clean 32px gap above
          the bottom instead of leaving blank space once the text runs out. */}
      <div
        className="hidden lg:flex"
        style={{ paddingTop: 32, paddingBottom: 32 }}
      >
        {/* Left: text column — 437px at 1920 (Figma), 32px from the screen
            edge and 32px from the images. */}
        <div
          style={{
            flexShrink: 0,
            width: "calc(64px + var(--proj-col))",
            paddingLeft: 32,
            paddingRight: 32,
            paddingBottom: 32,
          }}
        >
          <div
            ref={textBlockRef}
            style={{ position: "sticky", top: stickyTop, ...textStyle }}
          >
            {/* Body starts at y=251 in the 1080px frame: 32 + 64 + 155. */}
            <div style={{ marginBottom: "min(155px, 14.35vh)" }}>
              <p className="type-title m-0 text-[#1A1A1A]">{project.title}</p>
              <p className="type-title m-0 text-[#757575]">
                {project.subtitle}
              </p>
            </div>
            <div className="flex flex-col gap-[28px]">
              {project.paragraphs.map((p, i) => (
                <p
                  key={i}
                  className="type-body m-0 text-[#333333] [word-break:break-word]"
                >
                  {p}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Right: image catalog — natural flow, scrolls with the single scroll.
            Each image fills the viewport minus the 32px top/bottom margins. */}
        <div style={{ flex: 1, paddingRight: 32 }}>
          <div
            ref={desktopMediaRef}
            className="flex flex-col gap-[32px]"
            style={{ visibility: mediaVisible ? "visible" : "hidden" }}
          >
            {project.images.map((img, i) => (
              <div
                key={i}
                className="relative w-full rounded-[12px] overflow-hidden"
                style={{ height: "calc(100vh - 64px)" }}
              >
                <img
                  src={img}
                  alt=""
                  data-project-media={i}
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {hasHover && <CloseCursor x={cursor.x} y={cursor.y} />}
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────
const pathToProject: Record<string, ProjectId> = {
  "/decolar": "decolar",
  "/sound-room": "soundroom",
  "/playstation-connect": "playstation",
}
const projectToPath: Record<ProjectId, string> = {
  decolar: "/decolar",
  soundroom: "/sound-room",
  playstation: "/playstation-connect",
}

// ── Home ↔ project flight (desktop) ──────────────────────────────────────────
// A fixed copy of the image travels from where it is to where it lands: the
// home frame grows into the project's first image (only its left edge moves,
// right → left) and shrinks back on close. If the two pictures differ, the
// landing one fades in over the last stretch so the hand-off is seamless.
type FlightKind = "open" | "close"

function absoluteUrl(src: string) {
  return new URL(src, window.location.href).href
}

function Flight({
  kind,
  from,
  fromImg,
  onDone,
}: {
  kind: FlightKind
  from: DOMRect
  fromImg: string
  onDone: () => void
}) {
  const boxRef = useRef<HTMLDivElement>(null)
  const toImgRef = useRef<HTMLImageElement>(null)

  useLayoutEffect(() => {
    const box = boxRef.current
    const toImgEl = toImgRef.current
    const landingImg =
      kind === "open"
        ? document.querySelector<HTMLImageElement>('img[data-project-media="0"]')
        : document.querySelector<HTMLImageElement>(
            '[data-home-panel] img[data-active="true"]',
          )
    const landingBox =
      kind === "open"
        ? landingImg?.parentElement
        : document.querySelector<HTMLElement>("[data-home-panel]")
    if (!box || !toImgEl || !landingImg || !landingBox) {
      onDone()
      return
    }

    const to = landingBox.getBoundingClientRect()
    const rect = (r: DOMRect) => ({
      left: `${r.left}px`,
      top: `${r.top}px`,
      width: `${r.width}px`,
      height: `${r.height}px`,
    })
    const move = box.animate([rect(from), rect(to)], {
      duration: FLIGHT_MS,
      easing: FLIGHT_EASE,
      fill: "forwards",
    })
    const anims = [move]

    const landingSrc = landingImg.currentSrc || landingImg.src
    if (absoluteUrl(landingSrc) !== absoluteUrl(fromImg)) {
      toImgEl.src = landingSrc
      anims.push(
        toImgEl.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 240,
          delay: FLIGHT_MS - 280,
          easing: "linear",
          fill: "both",
        }),
      )
    }

    move.onfinish = () => onDone()
    return () => anims.forEach((a) => a.cancel())
    // runs once per flight; the parent remounts it (key) for a new one
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      ref={boxRef}
      aria-hidden="true"
      className="pointer-events-none fixed z-40 overflow-hidden rounded-[12px] bg-white"
      style={{
        left: from.left,
        top: from.top,
        width: from.width,
        height: from.height,
      }}
    >
      <img
        src={fromImg}
        alt=""
        className="absolute inset-0 h-full w-full object-cover select-none"
      />
      <img
        ref={toImgRef}
        alt=""
        className="absolute inset-0 h-full w-full object-cover select-none"
        style={{ opacity: 0 }}
      />
    </div>
  )
}

type Stage = "idle" | "opening" | "open" | "closing"

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const cleanPath = location.pathname.replace(/\/$/, "") || "/"
  const overlay = pathToProject[cleanPath] ?? null
  const reducedMotion = usePrefersReducedMotion()
  const isDesktop = useIsDesktop()

  const [overlayVisible, setOverlayVisible] = useState(false)
  const [renderedOverlay, setRenderedOverlay] = useState<ProjectId | null>(null)

  // Desktop flight between home and project. `stage` is "idle" whenever no
  // flight-opened project is on screen (including the plain-fade fallback).
  const [stage, setStage] = useState<Stage>("idle")
  const [flight, setFlight] = useState<{
    kind: FlightKind
    from: DOMRect
    fromImg: string
    key: number
  } | null>(null)
  const [projectTextIn, setProjectTextIn] = useState(false)
  const [homeChromeIn, setHomeChromeIn] = useState(false)
  const timerRef = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  useEffect(() => {
    if (overlay) {
      // the flight already mounted the page itself
      if (stage === "opening") return
      setRenderedOverlay(overlay)
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setOverlayVisible(true)),
      )
    } else if (renderedOverlay) {
      // e.g. browser back while a project is open: plain fade out
      setStage("idle")
      setFlight(null)
      setOverlayVisible(false)
      const t = setTimeout(
        () => setRenderedOverlay(null),
        reducedMotion ? REDUCED_MOTION_MS : TRANSITION_MS,
      )
      return () => clearTimeout(t)
    }
  }, [overlay])

  useEffect(() => {
    const page = overlay ? seo.routes[overlay] : seo.home
    const url = seo.siteUrl + (overlay ? seo.routes[overlay].path : "/")
    document.title = page.title
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", page.description)
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute("content", page.title)
    document
      .querySelector('meta[property="og:description"]')
      ?.setAttribute("content", page.description)
    document
      .querySelector('meta[property="og:url"]')
      ?.setAttribute("content", url)
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", url)
  }, [overlay])

  const canFly = isDesktop && !reducedMotion

  function openProject(id: ProjectId, origin?: FlightOrigin) {
    if (stage !== "idle") return
    if (origin && canFly) {
      setRenderedOverlay(id)
      setOverlayVisible(true)
      setProjectTextIn(false)
      setStage("opening")
      setFlight({ kind: "open", ...originToFlight(origin) })
      window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(
        () => setProjectTextIn(true),
        FLIGHT_TEXT_IN_MS,
      )
    }
    navigate(projectToPath[id])
  }

  function closeProject(origin?: FlightOrigin) {
    if (stage === "opening" || stage === "closing") return
    if (origin && canFly) {
      setHomeChromeIn(false)
      setStage("closing")
      setFlight({ kind: "close", ...originToFlight(origin) })
      window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(
        () => setHomeChromeIn(true),
        FLIGHT_MS * 0.55,
      )
      return // the route changes once the card has landed
    }
    navigate("/")
  }

  function originToFlight(origin: FlightOrigin) {
    return { from: origin.rect, fromImg: origin.img, key: Date.now() }
  }

  function handleFlightDone(kind: FlightKind) {
    setFlight(null)
    if (kind === "open") {
      setProjectTextIn(true)
      setStage("open")
    } else {
      setRenderedOverlay(null)
      setOverlayVisible(false)
      setHomeChromeIn(false)
      setStage("idle")
      navigate("/")
    }
  }

  // Smart-animate style: fast, direct, subtle — a quick scale + fade, the
  // same 200ms both ways in and out, no slide. `prefers-reduced-motion`
  // drops the scale and keeps a short plain fade.
  const overlayStyle: CSSProperties = reducedMotion
    ? {
        opacity: overlayVisible ? 1 : 0,
        transition: `opacity ${REDUCED_MOTION_MS}ms linear`,
      }
    : {
        opacity: overlayVisible ? 1 : 0,
        transform: `scale(${overlayVisible ? 1 : 0.97})`,
        transition: `opacity ${TRANSITION_MS}ms var(--ease-standard), transform ${TRANSITION_MS}ms var(--ease-standard)`,
      }

  return (
    // No `overflow-y-auto` here below `lg`: this div's height is unconstrained
    // (min-h only), so it never scrolls internally anyway — but `overflow`
    // being anything but `visible` makes it register as the nearest
    // scrolling ancestor for `position: sticky` below, which stops the
    // mobile header from sticking to the real viewport. `lg:overflow-hidden`
    // is still correct at `lg`, where nothing should scroll at all.
    <div className="relative min-h-[100svh] lg:fixed lg:inset-0 lg:overflow-hidden lg:min-h-0 bg-white">
      <div className="relative lg:absolute lg:inset-0">
        <HomePage
          onOpenProject={openProject}
          isActive={!overlay && stage === "idle"}
          chromeVisible={
            stage === "idle" || (stage === "closing" && homeChromeIn)
          }
          panelHidden={stage !== "idle"}
        />
      </div>

      {/* z-30: must beat the mobile sticky header's z-20, or that header's
          explicit z-index would stack it above this overlay (which has no
          z-index of its own) regardless of DOM order, leaking through on
          mobile. */}
      {renderedOverlay && (
        <div
          className="fixed inset-0 z-30"
          style={
            stage === "idle" ? overlayStyle : { pointerEvents: "auto" }
          }
        >
          <ProjectPage
            id={renderedOverlay}
            onClose={closeProject}
            backdropVisible={stage === "idle" || stage === "open"}
            mediaVisible={stage === "idle" || stage === "open"}
            textVisible={
              stage === "idle" ||
              stage === "open" ||
              (stage === "opening" && projectTextIn)
            }
          />
        </div>
      )}

      {flight && (
        <Flight
          key={flight.key}
          kind={flight.kind}
          from={flight.from}
          fromImg={flight.fromImg}
          onDone={() => handleFlightDone(flight.kind)}
        />
      )}
    </div>
  )
}
