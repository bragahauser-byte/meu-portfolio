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
import AboutPage from "./about/AboutPage"
import type { AboutView } from "./about/AboutPage"
import Intro from "./Intro"

// ── Home carousel images ──────────────────────────────────────────────────────
import imgC0 from "@/imports/Playstation/01.webp"
import imgC1 from "@/imports/Playstation/card-2.webp"
import imgC2 from "@/imports/Decolar/card-1.webp"
import imgC3 from "@/imports/Decolar/card-2.webp"
import imgC4 from "@/imports/Decolar/card-3.webp"
import imgC5 from "@/imports/Soundroom/card-1.webp"

// ── Playstation detail ────────────────────────────────────────────────────────
import imgPS1 from "@/imports/Playstation/01.webp"
import imgPS2 from "@/imports/Playstation/02.webp"
import imgPS3 from "@/imports/Playstation/03.webp"
import imgPS4 from "@/imports/Playstation/04.webp"
import imgPS5 from "@/imports/Playstation/05.webp"
import imgPS6 from "@/imports/Playstation/06.webp"

// ── Decolar detail ────────────────────────────────────────────────────────────
import imgDec1 from "@/imports/Decolar/01.webp"
import imgDec2 from "@/imports/Decolar/02.webp"
import imgDec3 from "@/imports/Decolar/03.webp"
import imgDec4 from "@/imports/Decolar/04.webp"
import imgDec5 from "@/imports/Decolar/05.webp"
import imgDec6 from "@/imports/Decolar/06.webp"
import imgDec7 from "@/imports/Decolar/07.webp"
import imgDec8 from "@/imports/Decolar/08.webp"
import imgDec9 from "@/imports/Decolar/09.webp"
import imgDec10 from "@/imports/Decolar/10.webp"

// ── Aviva detail ──────────────────────────────────────────────────────────────
import imgAvC1 from "@/imports/Aviva/card-1.webp"
import imgAvC2 from "@/imports/Aviva/card-2.webp"
import imgAvC3 from "@/imports/Aviva/card-3.webp"
import imgAv1 from "@/imports/Aviva/01.webp"
import imgAv2 from "@/imports/Aviva/02.webp"
import imgAv3 from "@/imports/Aviva/03.webp"
import imgAv4 from "@/imports/Aviva/04.webp"
import imgAv5 from "@/imports/Aviva/05.webp"
import imgAv6 from "@/imports/Aviva/06.webp"
import imgAv7 from "@/imports/Aviva/07.webp"
import imgAv8 from "@/imports/Aviva/08.webp"
import imgAv9 from "@/imports/Aviva/09.webp"
import imgAv10 from "@/imports/Aviva/10.webp"
import vidAvMenu from "@/imports/Aviva/menu.mp4"
import vidAvProduto from "@/imports/Aviva/produto.mp4"

// ── São Paulo Metro detail ────────────────────────────────────────────────────
import imgMtC1 from "@/imports/Metro/card-1.webp"
import imgMtC2 from "@/imports/Metro/card-2.webp"
import imgMt1 from "@/imports/Metro/01.webp"
import imgMt2 from "@/imports/Metro/02.webp"
import imgMt3 from "@/imports/Metro/03.webp"
import imgMt4 from "@/imports/Metro/04.webp"
import imgMt5 from "@/imports/Metro/05.webp"
import imgMt6 from "@/imports/Metro/06.webp"
import imgMt7 from "@/imports/Metro/07.webp"
import imgMt8 from "@/imports/Metro/08.webp"
import imgMt9 from "@/imports/Metro/09.webp"
import vidMtVisaoGeral from "@/imports/Metro/visao-geral.mp4"

// ── Soundroom detail ──────────────────────────────────────────────────────────
import imgSnd1 from "@/imports/Soundroom/01.webp"
import imgSnd2 from "@/imports/Soundroom/02.webp"
import imgSnd3 from "@/imports/Soundroom/03.webp"
import imgSnd4 from "@/imports/Soundroom/04.webp"
import imgSnd5 from "@/imports/Soundroom/05.webp"
import imgSnd6 from "@/imports/Soundroom/06.webp"

// ── Types & data ──────────────────────────────────────────────────────────────
type ProjectId = "playstation" | "decolar" | "aviva" | "metro" | "soundroom"

// A screen recording placed inside the flat screen of a mockup image.
// The recordings show the 1067.43×690 prototype screen centred on a #2C2C2C
// canvas; only that screen is shown, cropped exactly, on top of the same
// screen in the still image (which stays underneath as its poster).
type ScreenVideo = {
  src: string
  // the image's own aspect ratio (width / height)
  frame: number
  // the screen inside the image, in % of the image: left, top, width, height
  rect: [number, number, number, number]
  // the screen inside the recording, in px: x, y, width, height
  crop: [number, number, number, number]
  // the recording's size in px
  size: [number, number]
  // corner radius of the screen, as a fraction of its width (phone screens)
  radius?: number
}

const avivaMenuVideo = {
  src: vidAvMenu,
  crop: [428, 129, 1064, 686] as [number, number, number, number],
  size: [1920, 944] as [number, number],
}
const avivaScreenRect: [number, number, number, number] = [
  (160 / 1388) * 100,
  15.5,
  (1067.43 / 1388) * 100,
  69,
]
const avivaProductVideo = {
  src: vidAvProduto,
  crop: [428, 127, 1064, 686] as [number, number, number, number],
  size: [1920, 942] as [number, number],
}

// The Metro prototype was recorded at 90%: the 393×852 phone screen sits at
// 783.15,88.6 (353.7×766.8, corners 28.8) on the 1920×944 #EBEBEB canvas.
const metroVideo = {
  src: vidMtVisaoGeral,
  crop: [783.15, 88.6, 353.7, 766.8] as [number, number, number, number],
  size: [1920, 944] as [number, number],
  radius: 32 / 393,
}

// "bg" marks a mockup slide with a flat background: the mobile gallery shows
// these whole (object-contain, blending into bg) instead of cropping them.
// Full-bleed photos have no bg and are always object-cover.
// Order on the home: Decolar, Aviva, São Paulo Metro, PlayStation, Soundroom.
const carouselItems: {
  img: string
  project: ProjectId
  bg?: string
  video?: ScreenVideo
}[] = [
  { img: imgC2, project: "decolar", bg: "#F4F5F0" },
  { img: imgC3, project: "decolar" },
  { img: imgC4, project: "decolar", bg: "#F4F5F0" },
  { img: imgAvC1, project: "aviva" },
  { img: imgAvC2, project: "aviva" },
  {
    img: imgAvC3,
    project: "aviva",
    bg: "#2C2C2C",
    video: {
      ...avivaMenuVideo,
      frame: 2148 / 2000,
      rect: [(176 / 2148) * 100, 21, (1795 / 2148) * 100, 58],
    },
  },
  {
    img: imgMtC1,
    project: "metro",
    bg: "#EBEBEB",
    // the empty phone screen of the card: 2192×4766 at 2351,829 (of 6900×6424)
    video: {
      ...metroVideo,
      frame: 6900 / 6424,
      rect: [(2351 / 6900) * 100, (829 / 6424) * 100, (2192 / 6900) * 100, (4766 / 6424) * 100],
    },
  },
  { img: imgMtC2, project: "metro" },
  { img: imgC0, project: "playstation", bg: "#0B0C10" },
  { img: imgC1, project: "playstation" },
  { img: imgC5, project: "soundroom", bg: "#0B0C10" },
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

const avivaText = [
  `Aviva is a Brazilian independent denim label, and Remanesce is its first collection, developed as a collaborative project for the Fashion Design undergraduate thesis (TCC) at Universidade Anhembi Morumbi. The project brought together fashion and digital design to translate the brand’s identity, creative concept and craftsmanship into an online shopping experience.`,
  `The e-commerce was designed to balance editorial storytelling with functionality, allowing the collection’s garments, textures and visual language to take center stage. Through curated product discovery, immersive campaign imagery and intuitive navigation, the experience encourages exploration while maintaining a seamless shopping journey.`,
  `The result is a digital storefront that connects fashion, storytelling and commerce, reflecting the essence of Aviva while bringing its first collection to life online.`,
]

const metroText = [
  `São Paulo is a city in constant movement. With millions of people relying on public transportation every day, navigating the metro system should be as simple and seamless as possible.`,
  `Metro SP is a digital mobility concept designed to make everyday commuting more practical, accessible, and intuitive. The idea was to bring essential metro services together in one place, transforming the smartphone into a central tool for navigating the city.`,
  `Through a clean and user-friendly interface, the app allows users to plan routes, explore metro stations, check real-time service updates, and manage their tickets without relying on physical cards or paper tickets.`,
  `One of its core features is the integration of QR Code ticketing, allowing passengers to access the metro directly through their smartphones. Users can also recharge their balance, manage payments, and keep track of their transactions in just a few steps.`,
  `Beyond convenience, the project explores how thoughtful digital experiences can contribute to urban mobility. By reducing friction in everyday interactions, simplifying access to information, and bringing essential services together, Metro SP aims to make public transportation more efficient and approachable for everyone.`,
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
  // screen recordings layered on top of some images, by image index
  videos?: Record<number, ScreenVideo>
  // where the cover crop is anchored, by image index (default: center).
  // Slides whose phone bleeds off the bottom keep their top margin with "top".
  positions?: Record<number, string>
  shortText?: boolean
}> = {
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
  aviva: {
    title: "Aviva",
    subtitle: "E-commerce design",
    paragraphs: avivaText,
    images: [imgAv1, imgAv2, imgAv3, imgAv4, imgAv5, imgAv6, imgAv7, imgAv8, imgAv9, imgAv10],
    // short text: title at the top, body resting on the bottom margin
    shortText: true,
    videos: {
      // 06 · product page and 08 · menu: the same 1067.43×690 screen at
      // 160,155 on the dark 1388×1000 slide
      5: { ...avivaProductVideo, frame: 1388 / 1000, rect: avivaScreenRect },
      7: { ...avivaMenuVideo, frame: 1388 / 1000, rect: avivaScreenRect },
    },
  },
  metro: {
    title: "São Paulo Metro",
    subtitle: "Design Study",
    paragraphs: metroText,
    images: [imgMt1, imgMt2, imgMt3, imgMt4, imgMt5, imgMt6, imgMt7, imgMt8, imgMt9],
    // 02 · ticket and 07 · map: enlarged phones bleeding off the bottom
    positions: { 1: "top", 6: "top" },
    videos: {
      // 01 · overview: the phone screen, 393×852 at 720,377 on the 1834×1606 slide
      0: {
        ...metroVideo,
        frame: 1834 / 1606,
        rect: [(720 / 1834) * 100, (377 / 1606) * 100, (393 / 1834) * 100, (852 / 1606) * 100],
      },
    },
  },
  playstation: {
    title: "Playstation",
    subtitle: "Design study",
    paragraphs: psText,
    images: [imgPS1, imgPS2, imgPS3, imgPS4, imgPS5, imgPS6],
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

// ── Screen recordings inside mockups ──────────────────────────────────────────
// Sits over an <img> that fills the same box with object-fit cover/contain.
// The wrapper is a size container, so the inner box reproduces exactly the
// rectangle the image is drawn into (cqw/cqh), and the video is placed in %
// of that rectangle: it stays locked to the screen at any size and is never
// stretched, because the cropped screen keeps the recording's proportions.
// Only one recording plays at a time: the most visible one. Every
// MockupVideo reports how much of it is on screen; the bus elects a leader.
const videoBus = {
  ratios: new Map<number, number>(),
  leader: -1,
  subs: new Set<() => void>(),
  next: 1,
  set(id: number, r: number) {
    if (r > 0) this.ratios.set(id, r)
    else this.ratios.delete(id)
    let best = -1
    let bestR = 0
    this.ratios.forEach((v, k) => {
      if (v > bestR + 0.001) {
        best = k
        bestR = v
      }
    })
    if (best !== this.leader) {
      this.leader = best
      this.subs.forEach((f) => f())
    }
  },
}

function MockupVideo({
  video,
  fit,
  playing = true,
}: {
  video: ScreenVideo
  fit: "cover" | "contain"
  playing?: boolean
}) {
  const ref = useRef<HTMLVideoElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const reduceMotion = usePrefersReducedMotion()
  // near: within about a screen of the viewport → attach the source and fetch
  // metadata only. inView: at least a quarter on screen → play. Leaving pauses.
  // Nothing is downloaded for recordings the visitor never gets close to.
  const [near, setNear] = useState(false)
  const [inView, setInView] = useState(false)
  const [ratio, setRatio] = useState(0)
  const idRef = useRef(0)
  if (!idRef.current) idRef.current = videoBus.next++
  const [leader, setLeader] = useState(videoBus.leader)
  useEffect(() => {
    const on = () => setLeader(videoBus.leader)
    videoBus.subs.add(on)
    return () => {
      videoBus.subs.delete(on)
      videoBus.set(idRef.current, 0)
    }
  }, [])

  useEffect(() => {
    const el = boxRef.current
    if (!el || typeof IntersectionObserver === "undefined") {
      setNear(true)
      setInView(true)
      return
    }
    const nearIO = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setNear(true)
      },
      { rootMargin: "35% 25% 35% 25%" },
    )
    const viewIO = new IntersectionObserver(
      ([e]) => {
        setInView(e.isIntersecting && e.intersectionRatio >= 0.25)
        setRatio(e.isIntersecting ? e.intersectionRatio : 0)
      },
      { threshold: [0, 0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 1] },
    )
    nearIO.observe(el)
    viewIO.observe(el)
    return () => {
      nearIO.disconnect()
      viewIO.disconnect()
    }
  }, [])

  // the source is attached only once the recording is close AND its slide is
  // the active one (stacked, faded-out slides are "in view" too); after that
  // it stays attached so scrolling back doesn't refetch
  const [armed, setArmed] = useState(false)
  useEffect(() => {
    if (near && playing) setArmed(true)
  }, [near, playing])
  useEffect(() => {
    videoBus.set(idRef.current, playing && armed && inView ? ratio : 0)
  }, [playing, armed, inView, ratio])
  const shouldPlay = playing && inView && armed && !reduceMotion && leader === idRef.current
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (shouldPlay) el.play().catch(() => undefined)
    else if (!el.paused) el.pause()
  }, [shouldPlay])

  // pause while the tab is hidden
  useEffect(() => {
    const on = () => {
      const el = ref.current
      if (!el) return
      if (document.hidden) el.pause()
      else if (shouldPlay) el.play().catch(() => undefined)
    }
    document.addEventListener("visibilitychange", on)
    return () => document.removeEventListener("visibilitychange", on)
  }, [shouldPlay])

  const [l, t, w, h] = video.rect
  const [cx, cy, cw, ch] = video.crop
  const [vw, vh] = video.size
  const ar = video.frame
  const boxW =
    fit === "cover"
      ? `max(100cqw, calc(100cqh * ${ar}))`
      : `min(100cqw, calc(100cqh * ${ar}))`

  return (
    <div
      ref={boxRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ containerType: "size" }}
    >
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          width: boxW,
          aspectRatio: String(ar),
          transform: "translate(-50%, -50%)",
        }}
      >
        <div
          className="absolute overflow-hidden"
          style={{
            left: `${l}%`,
            top: `${t}%`,
            width: `${w}%`,
            height: `${h}%`,
            // circular corners: % of the width horizontally, of the height vertically
            borderRadius: video.radius
              ? `${video.radius * 100}% / ${video.radius * 100 * ((w * ar) / h)}%`
              : undefined,
          }}
        >
          <video
            ref={ref}
            src={armed ? video.src : undefined}
            muted
            loop
            playsInline
            disablePictureInPicture
            // no autoplay attribute: playback is driven by visibility (above)
            preload={armed ? (shouldPlay ? "auto" : "metadata") : "none"}
            className="absolute max-w-none"
            style={{
              left: `${(-cx / cw) * 100}%`,
              top: `${(-cy / ch) * 100}%`,
              width: `${(vw / cw) * 100}%`,
              height: `${(vh / ch) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  )
}

// ── Cursors ───────────────────────────────────────────────────────────────────
function CloseCursor({ x, y }: { x: number; y: number }) {
  return (
    <div
      className="pointer-events-none fixed z-[9999]"
      style={{ left: x, top: y, transform: "translate(-50%, -50%)" }}
    >
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="text-label">
        <path
          d="M3 3L19 19"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M19 3L3 19"
          stroke="currentColor"
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
          backgroundColor: overLink ? "var(--link-hover)" : "var(--c-label)",
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
  // desktop only: start a new line before this word
  breakBefore?: boolean
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
  { text: "based", tone: "gray", breakBefore: true },
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

// Desktop scroll between projects: the current image fades out to the dark
// frame (--c-media), then the new one fades in — fade, dark, fade. Input stays
// locked for the whole sequence so a single wheel gesture can't fire more
// than one change.
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
function useHomeEntrance(heroRef: RefObject<HTMLElement | null>, hold: boolean) {
  const [phase, setPhase] = useState<EnterPhase>("wait")
  const [lines, setLines] = useState<number[]>([])

  useEffect(() => {
    if (hold) return
    let cancelled = false
    const seen = hasEnteredThisSession()

    const fontReady = Promise.all([
      document.fonts?.load('400 16px "PP Neue Montreal"'),
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
  }, [heroRef, hold])

  return { phase, lines }
}

function HomePage({
  onOpenProject,
  onOpenAbout,
  isActive,
  chromeVisible,
  panelHidden,
  holdEntrance,
}: {
  onOpenProject: (id: ProjectId, origin?: FlightOrigin) => void
  onOpenAbout: () => void
  // the intro is still on screen: keep everything in its "before" state
  holdEntrance: boolean
  isActive: boolean
  // hero, footer and image counter — faded out while a project is open
  chromeVisible: boolean
  // the image frame itself — hidden while its flying copy is on screen
  panelHidden: boolean
}) {
  const [idx, setIdx] = useState(0)
  // Desktop panel: every image sits in the same spot of the viewport, so the
  // browser's lazy loading never kicks in and all of them (tens of MB) would
  // download at once. Instead each one mounts when it is at most two steps
  // ahead, so the next image is ready before it's needed and the current one
  // never waits in line behind the rest.
  const [reach, setReach] = useState(2)
  useEffect(() => setReach((r) => Math.max(r, idx + 2)), [idx])
  const isNear = (i: number) => i <= reach || Math.abs(i - idx) <= 1
  const [cursor, setCursor] = useState({ x: 0, y: 0 })
  const [viewCursorVisible, setViewCursorVisible] = useState(false)
  const [overLink, setOverLink] = useState(false)
  const heroRef = useRef<HTMLHeadingElement>(null)
  const { phase, lines } = useHomeEntrance(heroRef, holdEntrance)
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
        className="hero home-chrome type-hero safe-x sticky top-0 z-20 m-0 w-full select-none bg-white px-4 pt-16 pb-6 [@media(max-height:560px)]:pt-6 [@media(max-height:560px)]:pb-4 lg:absolute lg:top-[32px] lg:left-[32px] lg:z-auto lg:w-[min(428px,calc(100vw_-_var(--home-img-w)_-_136px))] lg:bg-transparent lg:p-0"
      >
        {heroWords.map((w, i) => (
          <Fragment key={i}>
            {i > 0 && " "}
            {w.breakBefore && <br className="hidden lg:inline" />}
            <span
              className="hero-word inline-block whitespace-nowrap"
              style={
                {
                  // gray copy trails the dark copy by half a step
                  "--i": (lines[i] ?? 0) + (w.tone === "gray" ? 0.5 : 0),
                  color: w.tone === "gray" ? "var(--c-secondary)" : "var(--c-label)",
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
          to the next/previous one — fade out to the media tone (--c-media), fade the new one in. */}
      <div className="hidden lg:block lg:absolute lg:top-[32px] lg:bottom-[32px] lg:right-[32px] lg:w-[var(--home-img-w)]">
        <div
          ref={panelRef}
          data-home-panel
          className="panel relative h-full w-full overflow-hidden rounded-[12px] bg-media"
          style={{
            cursor: hasHover ? "none" : "pointer",
            visibility: panelHidden ? "hidden" : "visible",
          }}
          onMouseEnter={() => hasHover && setViewCursorVisible(true)}
          onMouseLeave={() => setViewCursorVisible(false)}
          onClick={openActive}
        >
          <div className="panel-media absolute inset-0">
            {carouselItems.map((item, i) => {
              const fade: CSSProperties = {
                opacity: i === idx ? 1 : 0,
                // incoming waits for the outgoing to clear: fade → --c-media → fade
                transition:
                  i === idx
                    ? `opacity ${SWAP_IN_MS}ms var(--ease-standard) ${SWAP_OUT_MS}ms`
                    : `opacity ${SWAP_OUT_MS}ms linear`,
              }
              if (!isNear(i)) return null
              return (
                <Fragment key={i}>
                  <img
                    src={item.img}
                    alt=""
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
                    fetchPriority={i === idx || i === 0 ? "high" : "low"}
                    data-active={i === idx}
                    className="absolute inset-0 h-full w-full object-cover pointer-events-none select-none"
                    style={fade}
                  />
                  {item.video && isDesktop && (
                    <div className="absolute inset-0" style={fade}>
                      <MockupVideo
                        video={item.video}
                        fit="cover"
                        playing={i === idx && isActive && !panelHidden}
                      />
                    </div>
                  )}
                </Fragment>
              )
            })}
          </div>
        </div>
      </div>

      {/* Image counter: one 6px dot per home image, 12px apart, vertically
          centred, 32px to the left of the frame. */}
      <div className="home-chrome hidden lg:block lg:absolute lg:top-1/2 lg:-translate-y-1/2 lg:right-[calc(64px_+_var(--home-img-w))] lg:w-1.5">
        <div className="dots flex flex-col gap-[12px]" aria-label="Projetos">
          {carouselItems.map((item, i) => (
            <button
              key={i}
              type="button"
              aria-label={`${projects[item.project].title} ${i + 1} de ${carouselItems.length}`}
              aria-current={i === idx ? "true" : undefined}
              className="dot"
              style={
                {
                  "--dot-ms": `${SWAP_LOCK_MS}ms`,
                  cursor: hasHover ? "none" : "pointer",
                } as CSSProperties
              }
              onClick={() => goToIndex(i)}
            />
          ))}
        </div>
      </div>

      {/* ── Mobile / tablet (<lg): every project image, stacked in document
          order, natural scroll — no carousel, no snap, no auto-play. The
          hero above acts as the fixed header via `sticky top-0`. ─────────── */}
      {/* Phones: one column. iPhone Duo / tablets (640–1023px): two columns,
          so a whole row of work fits on the folded and unfolded screens. */}
      <div className="panel-media home-gallery safe-x flex flex-col gap-4 px-4 pt-10 pb-2 sm:grid sm:grid-cols-2 [@media(max-height:560px)]:pt-4 lg:hidden">
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
            {item.video && !isDesktop && (
              <MockupVideo
                video={item.video}
                fit={item.bg ? "contain" : "cover"}
                playing={isActive}
              />
            )}
          </button>
        ))}
      </div>

      <nav
        aria-label="Links externos"
        className="footer home-chrome type-footer safe-mx mx-4 mt-12 border-t border-separator pt-[13px] pb-[calc(32px+env(safe-area-inset-bottom))] text-label [--u-bottom:12px] lg:absolute lg:bottom-[32px] lg:left-[32px] lg:m-0 lg:border-0 lg:p-0 lg:[--u-bottom:2px]"
      >
        {/* Mobile: 4 links in one row; 24px line + 10px padding top/bottom = 44px touch target (the underline offset above compensates). */}
        <div className="flex flex-nowrap justify-between lg:justify-start lg:gap-x-[40px]">
          <a
            href="/about"
            className="footer-link link-underline py-[10px] lg:py-0"
            style={{ cursor: hasHover ? "none" : "auto", "--i": 0 } as CSSProperties}
            onClick={(e) => {
              e.preventDefault()
              onOpenAbout()
            }}
          >
            About
          </a>
          {footerLinks.map((l, i) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              className="footer-link link-underline py-[10px] lg:py-0"
              style={
                { cursor: hasHover ? "none" : "auto", "--i": i + 1 } as CSSProperties
              }
            >
              {l.label}
            </a>
          ))}
        </div>
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
  // only the visible layout plays its recordings
  const wideLayout = useMediaQuery("(min-width: 900px)")

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
        backgroundColor: backdropVisible ? "var(--c-bg)" : "transparent",
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
      {/* Two columns from 900px (iPhone Duo open, 951×669) and whenever the
          screen is split by a hinge; stacked below that. */}
      <div className="proj-mobile flex flex-col gap-10 p-6 md:p-10 min-[900px]:hidden">
        <div>
          <p className="type-title m-0 text-label">{project.title}</p>
          <p className="type-title m-0 text-secondary">{project.subtitle}</p>
        </div>
        <div className="flex flex-col gap-[28px]">
          {project.paragraphs.map((p, i) => (
            <p
              key={i}
              className="type-body m-0 text-body [word-break:break-word]"
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
                style={{ objectPosition: project.positions?.[i] }}
              />
              {project.videos?.[i] && !wideLayout && (
                <MockupVideo video={project.videos[i]} fit="cover" playing={mediaVisible} />
              )}
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
        className="proj-desktop hidden min-[900px]:flex"
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
            style={{
              position: "sticky",
              top: stickyTop,
              ...textStyle,
              // A short text rests on the bottom margin, title kept at the top
              ...(project.shortText
                ? {
                    height: "calc(100vh - 64px)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }
                : null),
            }}
          >
            {/* Body starts at y=251 in the 1080px frame: 32 + 64 + 155. */}
            <div style={{ marginBottom: project.shortText ? 32 : "min(155px, 14.35vh)" }}>
              <p className="type-title m-0 text-label">{project.title}</p>
              <p className="type-title m-0 text-secondary">
                {project.subtitle}
              </p>
            </div>
            <div className="flex flex-col gap-[28px]">
              {project.paragraphs.map((p, i) => (
                <p
                  key={i}
                  className="type-body m-0 text-body [word-break:break-word]"
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
                  style={{ objectPosition: project.positions?.[i] }}
                />
                {project.videos?.[i] && wideLayout && (
                  <MockupVideo video={project.videos[i]} fit="cover" playing={mediaVisible} />
                )}
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
  "/aviva": "aviva",
  "/sao-paulo-metro": "metro",
  "/sound-room": "soundroom",
  "/playstation-connect": "playstation",
}
const aboutViews: Record<string, AboutView> = {
  "/about": "about",
  "/about/albums": "albums",
  "/about/screen": "films",
  "/about/films": "films", // old link
  "/about/books": "books",
  "/about/games": "games",
}
const aboutToPath: Record<AboutView, string> = {
  about: "/about",
  albums: "/about/albums",
  films: "/about/screen",
  books: "/about/books",
  games: "/about/games",
}
const projectToPath: Record<ProjectId, string> = {
  decolar: "/decolar",
  aviva: "/aviva",
  metro: "/sao-paulo-metro",
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
      className="pointer-events-none fixed z-40 overflow-hidden rounded-[12px] bg-media"
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

// what the intro waits for (besides the fonts): the Home's images
// The intro waits for the images seen first, not the whole carousel: the
// rest load progressively as you browse (see the panel in HomePage).
const introAssets = carouselItems.slice(0, 3).map((c) => c.img)

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const cleanPath = location.pathname.replace(/\/$/, "") || "/"
  const overlay = pathToProject[cleanPath] ?? null
  const aboutView = aboutViews[cleanPath] ?? null
  const reducedMotion = usePrefersReducedMotion()
  const isDesktop = useIsDesktop()

  // Intro: first visit of the session only.
  const [introOn, setIntroOn] = useState(() => !hasEnteredThisSession())
  const [homeHeld, setHomeHeld] = useState(introOn)

  // About overlay: mounted while visible + during its fade out.
  const [aboutRendered, setAboutRendered] = useState<AboutView | null>(aboutView)
  const [aboutVisible, setAboutVisible] = useState(false)
  useEffect(() => {
    if (aboutView) {
      setAboutRendered(aboutView)
      requestAnimationFrame(() => requestAnimationFrame(() => setAboutVisible(true)))
      return
    }
    setAboutVisible(false)
    const t = setTimeout(() => setAboutRendered(null), reducedMotion ? 150 : 380)
    return () => clearTimeout(t)
  }, [aboutView, reducedMotion])

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
    const page = overlay
      ? seo.routes[overlay]
      : aboutView
        ? seo.pages[aboutView]
        : seo.home
    const url =
      seo.siteUrl +
      (overlay ? seo.routes[overlay].path : aboutView ? seo.pages[aboutView].path : "/")
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
  }, [overlay, aboutView])

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
          onOpenAbout={() => navigate("/about")}
          holdEntrance={homeHeld}
          isActive={!overlay && !aboutView && !introOn && stage === "idle"}
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

      {aboutRendered && (
        <div
          className="fixed inset-0 z-30"
          style={{
            opacity: aboutVisible ? 1 : 0,
            transition: `opacity ${reducedMotion ? 150 : aboutVisible ? 420 : 300}ms var(--ease-standard)`,
          }}
        >
          <AboutPage
            view={aboutView ?? aboutRendered}
            onNavigate={(v) => navigate(aboutToPath[v])}
            onClose={() => navigate("/")}
          />
        </div>
      )}

      {introOn && (
        <Intro
          assets={introAssets}
          reducedMotion={reducedMotion}
          onReveal={() => setHomeHeld(false)}
          onDone={() => setIntroOn(false)}
        />
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
