import { useCallback, useEffect, useRef, useState } from "react"

// One track at a time, crossfaded. Changing `src` waits for the carousel to
// settle (so a fast scroll through ten albums doesn't start ten songs), fades
// the old one out and the new one in. Browsers only allow sound after a real
// user gesture: if play() is refused we wait for the next click / key press.
// Songs are streamed (preload "none") and released when they fade out, so
// only the album in focus ever downloads, and only as much as it plays.

const FADE_MS = 450
const SETTLE_MS = 380
const VOLUME = 0.8

function fade(audio: HTMLAudioElement, to: number, ms: number) {
  return new Promise<void>((resolve) => {
    const from = audio.volume
    const t0 = performance.now()
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / ms)
      audio.volume = from + (to - from) * (k * k * (3 - 2 * k))
      if (k < 1) requestAnimationFrame(step)
      else resolve()
    }
    requestAnimationFrame(step)
  })
}

// Stops a track and frees it: removing the src aborts any download still in
// flight, so scrolling past albums never leaves full songs loading behind.
function release(audio: HTMLAudioElement) {
  audio.pause()
  audio.removeAttribute("src")
  audio.load()
}

function fadeOutAndRelease(audio: HTMLAudioElement, ms = FADE_MS) {
  fade(audio, 0, ms).then(() => release(audio))
}

const MUTE_KEY = "portfolio:sound"

export function useTrack(src: string | null) {
  const [muted, setMuted] = useState(() => {
    try {
      return localStorage.getItem(MUTE_KEY) === "off"
    } catch {
      return false
    }
  })
  const [playing, setPlaying] = useState(false)
  const current = useRef<HTMLAudioElement | null>(null)
  const pendingGesture = useRef(false)

  const start = useCallback((audio: HTMLAudioElement) => {
    audio.volume = 0
    return audio
      .play()
      .then(() => {
        pendingGesture.current = false
        setPlaying(true)
        return fade(audio, VOLUME, FADE_MS)
      })
      .catch(() => {
        pendingGesture.current = true
        setPlaying(false)
      })
  }, [])

  // swap tracks when src changes (after the carousel settles)
  useEffect(() => {
    const old = current.current
    if (!src || muted) {
      if (old) {
        fadeOutAndRelease(old)
        current.current = null
      }
      setPlaying(false)
      return
    }
    const t = window.setTimeout(() => {
      if (old) fadeOutAndRelease(old)
      // streamed, not downloaded up front: play() fetches only what is needed
      const audio = new Audio()
      audio.preload = "none"
      audio.loop = true
      audio.src = src
      current.current = audio
      start(audio)
    }, old ? SETTLE_MS : 120)
    return () => window.clearTimeout(t)
  }, [src, muted, start])

  // retry after a gesture if autoplay was blocked
  useEffect(() => {
    const retry = () => {
      if (pendingGesture.current && current.current) start(current.current)
    }
    window.addEventListener("pointerdown", retry)
    window.addEventListener("keydown", retry)
    return () => {
      window.removeEventListener("pointerdown", retry)
      window.removeEventListener("keydown", retry)
    }
  }, [start])

  // stop everything on unmount
  useEffect(
    () => () => {
      const a = current.current
      if (a) fadeOutAndRelease(a, 300)
      current.current = null
    },
    [],
  )

  const toggle = useCallback(() => {
    setMuted((m) => {
      try {
        localStorage.setItem(MUTE_KEY, m ? "on" : "off")
      } catch {
        /* ignore */
      }
      return !m
    })
  }, [])

  return { playing: playing && !muted, muted, toggle }
}
