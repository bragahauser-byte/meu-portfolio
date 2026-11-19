// Physical specs of each case and disc family, in millimetres.
//
// Cases follow the photographed references in "midia fisica box":
//  · PS2: opaque black Amaray DVD case, clear outer sleeve, memory-card
//    holder in the upper right, push hub low on the right half.
//  · PS4 / PS5: translucent blue Blu-ray "Elite" case, petal hub marked PUSH,
//    raised tray ring with two finger notches, booklet clips on the left.
//  · Xbox 360: translucent lime-green DVD case, button hub centred.
//
// Discs: the printed face comes from the photos in "cd"; the read side is
// modelled from how each format diffracts light. The grating pitch is the
// real track pitch of the format, so the rainbow appears where physics puts it:
// DVD (0.74 µm) shows bands at moderate angles, Blu-ray (0.32 µm) only
// near grazing light, which is why BD read sides look like a dull
// bronze-violet mirror rather than a rainbow.

export type PlatformId = "ps2" | "ps4" | "ps5" | "x360"

export type DiscSpec = {
  format: "dvd" | "dvd-dl" | "bd" | "uhd"
  pitch: number // track pitch, µm
  base: [number, number, number] // read-side base reflectance (linear-ish sRGB 0–1)
  mirror: number // how strongly the metal layer reflects the environment
  irid: number // diffraction strength
  hubTint: [number, number, number] // clear polycarbonate hub
  hubR: number // where the printed photo gives way to the clear hub (fraction of 60 mm)
  edge: [number, number, number]
  inkRough: number // printed face roughness
}

export type CaseSpec = {
  w: number
  h: number
  d: number
  plastic: [number, number, number] // shell colour (sRGB 0–1)
  opacity: number // shell opacity (1 = opaque)
  inner: [number, number, number] // inside face: paper seen through the plastic, or black plastic
  wall: number // wall thickness
  hub: "petal" | "button" | "ps2"
  discY: number // disc centre, mm from the case centre (+ up)
  memoryCard: boolean
  tray: "ring" | "dish" | "flat"
  label: string // human name for the platform
  short: string
  edge: EdgeSpec
}

// How each family of case is moulded at its edges (mm).
//  · Amaray DVD (PS2, Xbox 360): tighter corners, a flat spine with hinge
//    grooves, a raised welded frame around the clear sleeve, snap nubs on the
//    opening edge.
//  · Blu-ray Elite (PS4, PS5): rounder corners, softly rounded outer edges and
//    spine, a thin sleeve frame and a recessed thumb grip on the opening edge.
export type EdgeSpec = {
  corner: number // outer corner radius on the opening side
  hingeCorner: number // corner radius on the spine side
  bevel: number // rounding of the outer edges
  lipW: number // width of the raised frame around the sleeve
  lipH: number // its height above the face
  spineRadius: number // rounding of the spine's outer edges
  thumbNotch: boolean
  nubs: boolean
  seamGap: number // visible gap where the two halves meet when closed
}

export const DISC_R = 60
export const HOLE_R = 7.5

export const discs: Record<PlatformId, DiscSpec> = {
  // PS2 DVD-ROMs were pressed in black-dyed polycarbonate: the read side is
  // almost black, with a deep blue-violet sheen and faint, dark rainbows.
  ps2: {
    format: "dvd",
    pitch: 0.74,
    base: [0.035, 0.03, 0.06],
    mirror: 0.32,
    irid: 0.55,
    hubTint: [0.2, 0.2, 0.24],
    hubR: 0.3,
    edge: [0.08, 0.08, 0.1],
    inkRough: 0.62,
  },
  // Blu-ray (BD-50): bronze / violet-grey mirror; rainbow only at grazing light.
  ps4: {
    format: "bd",
    pitch: 0.32,
    base: [0.66, 0.58, 0.62],
    mirror: 0.95,
    irid: 0.9,
    hubTint: [0.86, 0.88, 0.9],
    hubR: 0.29,
    edge: [0.72, 0.72, 0.74],
    inkRough: 0.42,
  },
  // Ultra HD Blu-ray (BD-66/100): a cooler, darker grey-brown mirror.
  ps5: {
    format: "uhd",
    pitch: 0.32,
    base: [0.55, 0.52, 0.5],
    mirror: 0.92,
    irid: 0.8,
    hubTint: [0.86, 0.88, 0.9],
    hubR: 0.29,
    edge: [0.66, 0.66, 0.68],
    inkRough: 0.38,
  },
  // Xbox 360 dual-layer DVD: semi-reflective gold layer 0 over silver,
  // warm silver-gold mirror with clear rainbow bands. The hologram ring
  // around the hub is part of the photographed label, so the clear hub
  // starts further in.
  x360: {
    format: "dvd-dl",
    pitch: 0.74,
    base: [0.86, 0.77, 0.56],
    mirror: 0.95,
    irid: 1.0,
    hubTint: [0.9, 0.9, 0.9],
    hubR: 0.205,
    edge: [0.78, 0.76, 0.7],
    inkRough: 0.5,
  },
}

export const cases: Record<PlatformId, CaseSpec> = {
  ps2: {
    w: 135,
    h: 190,
    d: 14,
    plastic: [0.05, 0.05, 0.055],
    opacity: 1,
    inner: [0.12, 0.124, 0.135],
    wall: 1.6,
    hub: "ps2",
    discY: -19,
    memoryCard: true,
    tray: "flat",
    label: "PlayStation 2",
    short: "PS2",
    edge: { corner: 2.2, hingeCorner: 0.8, bevel: 0.35, lipW: 1.7, lipH: 0.55, spineRadius: 0.7, thumbNotch: false, nubs: true, seamGap: 0.5 },
  },
  ps4: {
    w: 135,
    h: 170,
    d: 14,
    plastic: [0.05, 0.33, 0.95],
    opacity: 0.5,
    inner: [0.16, 0.42, 0.96],
    wall: 1.4,
    hub: "petal",
    discY: 0,
    memoryCard: false,
    tray: "ring",
    label: "PlayStation 4",
    short: "PS4",
    edge: { corner: 5, hingeCorner: 1.2, bevel: 0.9, lipW: 1.1, lipH: 0.32, spineRadius: 2.6, thumbNotch: true, nubs: false, seamGap: 0.35 },
  },
  ps5: {
    w: 135,
    h: 170,
    d: 14,
    plastic: [0.03, 0.29, 0.9],
    opacity: 0.5,
    inner: [0.16, 0.42, 0.96],
    wall: 1.4,
    hub: "petal",
    discY: 0,
    memoryCard: false,
    tray: "ring",
    label: "PlayStation 5",
    short: "PS5",
    edge: { corner: 5, hingeCorner: 1.2, bevel: 0.9, lipW: 1.1, lipH: 0.32, spineRadius: 2.6, thumbNotch: true, nubs: false, seamGap: 0.35 },
  },
  x360: {
    w: 135,
    h: 190,
    d: 14,
    plastic: [0.55, 0.86, 0.1],
    opacity: 0.55,
    inner: [0.62, 0.88, 0.16],
    wall: 1.5,
    hub: "button",
    discY: 2,
    memoryCard: false,
    tray: "dish",
    label: "Xbox 360",
    short: "Xbox 360",
    edge: { corner: 3.4, hingeCorner: 1, bevel: 0.6, lipW: 2.1, lipH: 0.6, spineRadius: 1.5, thumbNotch: false, nubs: true, seamGap: 0.6 },
  },
}

// Cover wraps are scans of the whole insert: back | spine | front. The spine
// is 14 mm of a 284 mm wide sheet (135 + 14 + 135).
export const SPINE_U0 = 135 / 284
export const SPINE_U1 = 149 / 284
