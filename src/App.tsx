import { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

// ── Home carousel images ──────────────────────────────────────────────────────
import imgC0 from '@/imports/Home/b9f92c64362555697b1bf52070200b5776449dd9.png'
import imgC1 from '@/imports/Home/4b5167c4a83880a558c5b79baa6ae60061ce52f8.png'
import imgC2 from '@/imports/Home/b58f7daf888dd48b7986d465085c4fdbcd6f8c99.png'
import imgC3 from '@/imports/Home/aa654c04a6f140ac88b78962f565617c7dcaa413.png'
import imgC4 from '@/imports/Home/004629f91487238df39fc28fee710a8cab755db8.png'
import imgC5 from '@/imports/Home/af2de6f8c956799a70ea9619414a9a2c14e518b4.png'
import imgC6 from '@/imports/Home/cd6a0912d75915aaed59d8e5bec53dd84e0c0c5d.png'
import imgC7 from '@/imports/Home/8fd822f7ab07d7a0c81ff2fde78f8afcc6dee1cb.png'

// ── Playstation detail ────────────────────────────────────────────────────────
import imgPS1 from '@/imports/Playstation-1/b9f92c64362555697b1bf52070200b5776449dd9.png'
import imgPS2 from '@/imports/Playstation-1/712bc7808b04958224ac8952234b52ff22823da0.png'
import imgPS3 from '@/imports/Playstation-1/399f11adf248c3bddad6aa41d12930562278241a.png'
import imgPS4 from '@/imports/Playstation-1/d141364c892e76f9f0086baf105fbc5003b811df.png'
import imgPS5 from '@/imports/Playstation-1/1bfd329f51e198222cbf1335e958f93e9bbef465.png'
import imgPS6 from '@/imports/Playstation-1/957bca79229f9f620b8e6263af445e3b16bc178b.png'

// ── Decolar detail ────────────────────────────────────────────────────────────
import imgDec1 from '@/imports/Decolar/1.jpg'
import imgDec2 from '@/imports/Decolar/2.jpg'
import imgDec3 from '@/imports/Decolar/3.jpg'
import imgDec4 from '@/imports/Decolar/4.jpg'
import imgDec5 from '@/imports/Decolar/5.jpg'
import imgDec6 from '@/imports/Decolar/6.jpg'
import imgDec7 from '@/imports/Decolar/7.jpg'
import imgDec8 from '@/imports/Decolar/8.jpg'
import imgDec9 from '@/imports/Decolar/9.jpg'
import imgDec10 from '@/imports/Decolar/10.jpg'

// ── Soundroom detail ──────────────────────────────────────────────────────────
import imgSnd1 from '@/imports/Soundroom/5c1c7db8bda671d3301de454303f2df32f7f02e6.png'
import imgSnd2 from '@/imports/Soundroom/b3e76a13886665494eb1e3bd7733419efa6ad114.png'
import imgSnd3 from '@/imports/Soundroom/b729fc34dc283d938b246926ebce3bc057101490.png'
import imgSnd4 from '@/imports/Soundroom/d34bc3c6bfe03581ef4b363fef18edb46113864f.png'
import imgSnd5 from '@/imports/Soundroom/608d83c88b6e1960d9629dc8ad826e8cca3bb30f.png'
import imgSnd6 from '@/imports/Soundroom/d3277e896ea1e722febcfba8f22e8cdab3ba256d.png'

// ── Types & data ──────────────────────────────────────────────────────────────
type ProjectId = 'playstation' | 'decolar' | 'soundroom'

const carouselItems: { img: string; project: ProjectId }[] = [
  { img: imgC0, project: 'playstation' },
  { img: imgC1, project: 'playstation' },
  { img: imgC2, project: 'decolar' },
  { img: imgC3, project: 'decolar' },
  { img: imgC4, project: 'decolar' },
  { img: imgC5, project: 'soundroom' },
  { img: imgC6, project: 'soundroom' },
  { img: imgC7, project: 'soundroom' },
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

const projects: Record<ProjectId, { title: string; subtitle: string; paragraphs: string[]; images: string[] }> = {
  playstation: {
    title: 'Playstation',
    subtitle: 'Design study',
    paragraphs: psText,
    images: [imgPS1, imgPS2, imgPS3, imgPS4, imgPS5, imgPS6],
  },
  decolar: {
    title: 'Decolar',
    subtitle: 'Design study',
    paragraphs: decolarText,
    images: [imgDec1, imgDec2, imgDec3, imgDec4, imgDec5, imgDec6, imgDec7, imgDec8, imgDec9, imgDec10],
  },
  soundroom: {
    title: 'Soundroom',
    subtitle: 'University Project',
    paragraphs: soundroomText,
    images: [imgSnd1, imgSnd2, imgSnd3, imgSnd4, imgSnd5, imgSnd6],
  },
}

// ── Cursors ───────────────────────────────────────────────────────────────────
function CloseCursor({ x, y }: { x: number; y: number }) {
  return (
    <div
      className="pointer-events-none fixed z-[9999]"
      style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
    >
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M3 3L19 19" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" />
        <path d="M19 3L3 19" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  )
}

function ViewCursor({ x, y, visible }: { x: number; y: number; visible: boolean }) {
  return (
    <div
      className="pointer-events-none fixed z-[9999]"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.15s ease',
      }}
    >
      <div
        className="flex items-center justify-center rounded-full bg-white"
        style={{ width: 56, height: 56, boxShadow: '0 2px 16px rgba(0,0,0,0.18)' }}
      >
        <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
          <path d="M13 1L19 7L13 13" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M1 7H19" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  )
}

function HomePageCursor({ x, y, hidden }: { x: number; y: number; hidden: boolean }) {
  if (hidden) return null
  return (
    <div
      className="pointer-events-none fixed z-[9998]"
      style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
    >
      <div
        className="rounded-full bg-black"
        style={{ width: 8, height: 8 }}
      />
    </div>
  )
}

// ── Home page ─────────────────────────────────────────────────────────────────
function HomePage({ onOpenProject, isActive }: { onOpenProject: (id: ProjectId) => void; isActive: boolean }) {
  const [idx, setIdx] = useState(0)
  const [cursor, setCursor] = useState({ x: 0, y: 0 })
  const [viewCursorVisible, setViewCursorVisible] = useState(false)

  // FIX 1: preload carousel images by mounting them all; only first is eager
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % carouselItems.length), 3500)
    return () => clearInterval(t)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setCursor({ x: e.clientX, y: e.clientY })
  }, [])

  // Uppercase text always *reads* larger than mixed-case at the same px size,
  // so the links are set a notch below the title's size to look visually
  // equal — not literally equal. Same 3:4 ratio kept at both breakpoints.
  const linkClsDesktop = "text-[16px] leading-[24px] font-medium tracking-[0.06em] uppercase text-[#000000] no-underline transition-colors duration-150 hover:text-[#DB224D] hover:underline"
  const linkClsMobile = "text-[12px] leading-[16px] font-medium tracking-[0.08em] uppercase text-[#000000] no-underline transition-colors duration-150 hover:text-[#DB224D] hover:underline"

  return (
    // RESPONSIVE: below `lg` (1024px) we use a normal, stacked, scrollable layout.
    // At `lg` and above we switch to the original pixel-perfect desktop layout.
    <div className="relative w-full min-h-full lg:h-full bg-white" onMouseMove={handleMouseMove} style={{ cursor: 'none' }}>

      {/* ── Mobile / tablet layout (< lg) ─────────────────────────────────── */}
      <div className="flex flex-col gap-8 p-6 pb-12 lg:hidden">
        <p className="anim-text max-w-[560px] text-[16px] leading-[24px] text-[#000000] tracking-[-0.01em] [word-break:break-word] m-0 select-none">
          <span className="font-medium">{"Hi, I'm Gabriel Braga, "}</span>
          <span className="font-normal text-[#707070]">{"a digital designer from São Paulo who likes turning ideas into clear, functional interfaces :)"}</span>
        </p>

        <div
          className="anim-image relative w-full aspect-[4/5] sm:aspect-[16/10] rounded-[12px] overflow-hidden"
          onClick={() => onOpenProject(carouselItems[idx].project)}
          style={{ cursor: 'none' }}
        >
          {carouselItems.map((item, i) => (
            <img
              key={i}
              src={item.img}
              alt=""
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
              fetchPriority={i === 0 ? 'high' : 'low'}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
              style={{ opacity: i === idx ? 1 : 0, transition: 'opacity 0.7s ease' }}
            />
          ))}
        </div>

        <div className="anim-footer w-full max-w-[560px] flex flex-wrap justify-between items-center gap-x-6 gap-y-2" style={{ fontFeatureSettings: '"dlig" 1' }}>
          <a href="https://www.linkedin.com/in/gabriel-bragaa/" target="_blank" rel="noreferrer" style={{ cursor: 'none' }} className={linkClsMobile}>LINKEDIN</a>
          <a href="https://medium.com/@bragahauser" target="_blank" rel="noreferrer" style={{ cursor: 'none' }} className={linkClsMobile}>MEDIUM</a>
          <a href="mailto:bragahauser@gmail.com" style={{ cursor: 'none' }} className={linkClsMobile}>EMAIL</a>
        </div>
      </div>

      {/* ── Desktop layout (>= lg) — original pixel-perfect design ────────── */}
      <div className="hidden lg:block absolute inset-0">
        <p className="anim-text absolute top-[40px] left-[40px] max-w-[524px] text-[24px] leading-[32px] text-[#000000] tracking-[-0.01em] [word-break:break-word] m-0 select-none">
          <span className="font-medium">{"Hi, I'm Gabriel Braga, "}</span>
          <span className="font-normal text-[#707070]">{"a digital designer from São Paulo who likes turning ideas into clear, functional interfaces :)"}</span>
        </p>

        <div
          className="anim-image absolute top-[40px] bottom-[40px] rounded-[12px] overflow-hidden"
          style={{ left: 'calc(37.5% + 18px)', right: '40px', cursor: 'none' }}
          onMouseEnter={() => setViewCursorVisible(true)}
          onMouseLeave={() => setViewCursorVisible(false)}
          onClick={() => onOpenProject(carouselItems[idx].project)}
        >
          {carouselItems.map((item, i) => (
            <img
              key={i}
              src={item.img}
              alt=""
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
              fetchPriority={i === 0 ? 'high' : 'low'}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
              style={{ opacity: i === idx ? 1 : 0, transition: 'opacity 0.7s ease' }}
            />
          ))}
        </div>

        <div
          className="anim-footer absolute bottom-[40px] left-[40px] flex justify-between items-center"
          style={{ width: 'min(524px, calc(37.5% - 58px))', fontFeatureSettings: '"dlig" 1' }}
        >
          <a href="https://www.linkedin.com/in/gabriel-bragaa/" target="_blank" rel="noreferrer" style={{ cursor: 'none' }} className={linkClsDesktop}>LINKEDIN</a>
          <a href="https://medium.com/@bragahauser" target="_blank" rel="noreferrer" style={{ cursor: 'none' }} className={linkClsDesktop}>MEDIUM</a>
          <a href="mailto:bragahauser@gmail.com" style={{ cursor: 'none' }} className={linkClsDesktop}>EMAIL</a>
        </div>
      </div>

      <ViewCursor x={cursor.x} y={cursor.y} visible={viewCursorVisible} />
      {isActive && <HomePageCursor x={cursor.x} y={cursor.y} hidden={viewCursorVisible} />}
    </div>
  )
}

// ── Project page ──────────────────────────────────────────────────────────────
function ProjectPage({ id, onClose }: { id: ProjectId; onClose: () => void }) {
  const [cursor, setCursor] = useState({ x: -100, y: -100 })
  const project = projects[id]

  return (
    // fixed inset-0 so the overlay always covers the full viewport, regardless
    // of whatever scroll position the Home page (behind it) is at.
    <div
      className="fixed inset-0 overflow-y-auto bg-white"
      style={{ cursor: 'none' }}
      onMouseMove={e => setCursor({ x: e.clientX, y: e.clientY })}
      onClick={onClose}
    >
      {/* ── Mobile / tablet layout (< lg) — simple stacked flow ──────────── */}
      <div className="flex flex-col gap-10 p-6 pb-16 lg:hidden">
        <div>
          <p className="text-[16px] leading-[24px] font-medium text-[#000000] tracking-[-0.01em] m-0">{project.title}</p>
          <p className="text-[16px] leading-[24px] font-normal text-[#707070] tracking-[-0.01em] m-0">{project.subtitle}</p>
        </div>
        <div className="flex flex-col gap-[24px]">
          {project.paragraphs.map((p, i) => (
            <p key={i} className="text-[16px] leading-[24px] text-[#000000] text-justify tracking-normal [word-break:break-word] m-0">{p}</p>
          ))}
        </div>
        <div className="flex flex-col gap-[20px]">
          {project.images.map((img, i) => (
            <div key={i} className="relative w-full aspect-[4/3] rounded-[12px] overflow-hidden">
              <img
                src={img}
                alt=""
                loading={i === 0 ? 'eager' : 'lazy'}
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Desktop layout (>= lg) — original two-column sticky design ───── */}
      {/* No `items-start` here: the row keeps the default `stretch`, so the
          Left column's box grows to match the Right column's full height.
          That gives the sticky text room to stick — and, combined with the
          40px bottom padding on Left, it stops with a clean 40px gap above
          the bottom instead of leaving blank space once the text runs out. */}
      <div className="hidden lg:flex" style={{ paddingTop: 40, paddingBottom: 40 }}>

        {/* Left: text column — sticky, stops 40px before the column ends */}
        <div
          style={{
            flexShrink: 0,
            width: 'calc(37.5% - 18px)',
            paddingLeft: 40,
            paddingRight: 40,
            paddingBottom: 40,
          }}
        >
          <div style={{ position: 'sticky', top: 40 }}>
            <div style={{ marginBottom: 72 }}>
              <p className="text-[24px] leading-[32px] font-medium text-[#000000] tracking-[-0.01em] m-0">{project.title}</p>
              <p className="text-[24px] leading-[32px] font-normal text-[#707070] tracking-[-0.01em] m-0">{project.subtitle}</p>
            </div>
            <div className="flex flex-col gap-[24px]">
              {project.paragraphs.map((p, i) => (
                <p key={i} className="text-[16px] leading-[24px] text-[#000000] text-justify tracking-normal [word-break:break-word] m-0">{p}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Right: image catalog — natural flow, scrolls with the single scroll */}
        <div style={{ flex: 1, paddingRight: 40 }}>
          <div className="flex flex-col gap-[40px]">
            {project.images.map((img, i) => (
              <div
                key={i}
                className="relative w-full rounded-[12px] overflow-hidden"
                style={{ height: '85vh' }}
              >
                <img
                  src={img}
                  alt=""
                  loading={i === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <CloseCursor x={cursor.x} y={cursor.y} />
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────
const pathToProject: Record<string, ProjectId> = {
  '/decolar': 'decolar',
  '/sound-room': 'soundroom',
  '/playstation-connect': 'playstation',
}
const projectToPath: Record<ProjectId, string> = {
  decolar: '/decolar',
  soundroom: '/sound-room',
  playstation: '/playstation-connect',
}

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const overlay = pathToProject[location.pathname] ?? null

  const [overlayVisible, setOverlayVisible] = useState(false)
  const [renderedOverlay, setRenderedOverlay] = useState<ProjectId | null>(null)

  useEffect(() => {
    if (overlay) {
      setRenderedOverlay(overlay)
      requestAnimationFrame(() => requestAnimationFrame(() => setOverlayVisible(true)))
    } else if (renderedOverlay) {
      setOverlayVisible(false)
      const t = setTimeout(() => setRenderedOverlay(null), 420)
      return () => clearTimeout(t)
    }
  }, [overlay])

  useEffect(() => {
    const meta = document.querySelector('meta[name="description"]')
    if (overlay) {
      const p = projects[overlay]
      document.title = `${p.title} — UX/UI Case Study | Gabriel Braga`
      if (meta) meta.setAttribute('content', `Case study de UX/UI Design: ${p.title}. ${p.subtitle}.`)
    } else {
      document.title = 'Gabriel Braga — Digital Designer'
      if (meta) meta.setAttribute('content', "Hi, I'm Gabriel Braga, a digital designer from São Paulo who likes turning ideas into clear, functional interfaces.")
    }
  }, [overlay])

  function openProject(id: ProjectId) {
    navigate(projectToPath[id])
  }

  function closeProject() {
    navigate('/')
  }

  return (
    <div className="relative min-h-screen overflow-y-auto lg:fixed lg:inset-0 lg:overflow-hidden lg:min-h-0 bg-white">
      <div className="relative lg:absolute lg:inset-0">
        <HomePage onOpenProject={openProject} isActive={!overlay} />
      </div>

      {renderedOverlay && (
        <div
          className="fixed inset-0"
          style={{
            transform: overlayVisible ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.42s cubic-bezier(0.4, 0, 0.2, 1)',
            willChange: 'transform',
          }}
        >
          <ProjectPage id={renderedOverlay} onClose={closeProject} />
        </div>
      )}
    </div>
  )
}