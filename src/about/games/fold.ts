// Foldables (iPhone Duo open, or any device that reports two horizontal
// viewport segments): the hinge splits the screen. Interactive 3D content and
// its controls live in the right segment, never across the fold.
// `?fold=1` / the "duo-fold" iframe simulate it (see main.tsx).

type Viewport = { segments?: DOMRect[] }

export function isFolded() {
  const segs = (window as unknown as { viewport?: Viewport }).viewport?.segments
  if (segs && segs.length === 2 && segs[0].width < window.innerWidth) return true
  return document.documentElement.dataset.fold === "1"
}

// The usable area for the 3D scene, in CSS px.
export function foldRegion(): { x: number; w: number } {
  const W = window.innerWidth
  const segs = (window as unknown as { viewport?: Viewport }).viewport?.segments
  if (segs && segs.length === 2 && segs[1].left > segs[0].left) return { x: segs[1].left, w: W - segs[1].left }
  if (document.documentElement.dataset.fold === "1") {
    const left = W / 2 + 9
    return { x: left, w: W - left }
  }
  return { x: 0, w: W }
}
