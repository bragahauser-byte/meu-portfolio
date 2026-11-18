// Favorites shown on the About screens. Every entry credits its authors:
// albums → artist, films/series → director (and original author when it is
// an adaptation), books → author. Covers live in /public/about.

export type Category = "albums" | "films" | "books"

export type Favorite = {
  slug: string
  title: string
  credit: string // second line under the title: who made it (and year)
  cover: string
  edge: string // average color of the cover's left edge (book spine, sleeve edge)
  tone: string // average color of the whole cover
  track?: { title: string; src: string } // albums only
}

const base = import.meta.env.BASE_URL
const cover = (cat: Category, slug: string) => `${base}about/${cat}/${slug}.webp`
const song = (file: string) => `${base}about/songs/${file}`
const rgb = (c: number[]) => `rgb(${c[0]} ${c[1]} ${c[2]})`

function album(
  slug: string,
  title: string,
  artist: string,
  year: number,
  track: string,
  file: string | null, // null until the song file is in public/about/songs
  edge: number[],
  tone: number[],
): Favorite {
  return {
    slug,
    title,
    credit: `${artist}, ${year}`,
    cover: cover("albums", slug),
    edge: rgb(edge),
    tone: rgb(tone),
    track: file ? { title: track, src: song(file) } : undefined,
  }
}

export const albums: Favorite[] = [
  album("dark-side-of-the-moon", "The Dark Side of the Moon", "Pink Floyd", 1973, "Money", "money.mp3", [1, 1, 1], [7, 7, 6]),
  album("el-camino", "El Camino", "The Black Keys", 2011, "Gold on the Ceiling", "gold-on-the-ceiling.mp3", [42, 40, 36], [110, 104, 90]),
  album("led-zeppelin", "Led Zeppelin", "Led Zeppelin", 1969, "Good Times Bad Times", "good-times-bad-times.mp3", [210, 206, 192], [166, 161, 151]),
  album("aaa", "AAA", "HYUKOH & Sunset Rollercoaster", 2022, "Young Man", "young-man.mp3", [59, 83, 61], [74, 89, 68]),
  album("californication", "Californication", "Red Hot Chili Peppers", 1999, "Californication", "californication.m4a", [99, 82, 99], [108, 76, 89]),
  album("morning-glory", "(What's the Story) Morning Glory?", "Oasis", 1995, "Don't Look Back in Anger", "dont-look-back-in-anger.m4a", [62, 58, 54], [141, 132, 129]),
  album("revolver", "Revolver", "The Beatles", 1966, "Tomorrow Never Knows", "tomorrow-never-knows.mp3", [229, 229, 229], [184, 184, 184]),
  album("nurture", "Nurture", "Porter Robinson", 2021, "Lifelike", "lifelike.mp3", [106, 159, 97], [106, 164, 106]),
  album("rage-against-the-machine", "Rage Against the Machine", "Rage Against the Machine", 1992, "Killing in the Name", "killing-in-the-name.mp3", [138, 146, 150], [143, 154, 161]),
  album("random-access-memories", "Random Access Memories", "Daft Punk", 2013, "Instant Crush (feat. Julian Casablancas)", "instant-crush.mp3", [10, 12, 11], [36, 37, 37]),
  album("currents", "Currents", "Tame Impala", 2015, "New Person, Same Old Mistakes", "new-person-same-old-mistakes.mp3", [90, 73, 93], [91, 72, 93]),
  album("minecraft-volume-alpha", "Minecraft – Volume Alpha", "C418", 2011, "Sweden", "sweden.m4a", [101, 118, 53], [67, 79, 36]),
  album("the-new-abnormal", "The New Abnormal", "The Strokes", 2020, "Selfless", "selfless.m4a", [107, 145, 130], [114, 135, 118]),
  album("kid-a", "Kid A", "Radiohead", 2000, "Everything in Its Right Place", "everything-in-its-right-place.m4a", [38, 55, 72], [123, 124, 125]),
  album("morning-view", "Morning View", "Incubus", 2001, "Wish You Were Here", "wish-you-were-here.mp3", [118, 120, 123], [114, 129, 145]),
  album("hybrid-theory", "Hybrid Theory", "Linkin Park", 2000, "Crawling", "crawling.mp3", [116, 115, 106], [130, 121, 115]),
  // songs pending: set the file name once it's in public/about/songs
  album("roots", "Roots", "Sepultura", 1996, "Roots Bloody Roots", "roots-bloody-roots.mp3", [24, 5, 5], [81, 37, 23]),
  album("a-tabua-de-esmeralda", "A Tábua de Esmeralda", "Jorge Ben", 1974, "Os Alquimistas Estão Chegando", "os-alquimistas-estao-chegando.m4a", [176, 172, 169], [163, 152, 147]),
  album("dig-your-own-hole", "Dig Your Own Hole", "The Chemical Brothers", 1997, "Elektrobank", "elektrobank.mp3", [52, 52, 52], [34, 34, 34]),
  album("significant-other", "Significant Other", "Limp Bizkit", 1999, "Nookie", "nookie.mp3", [132, 110, 138], [139, 111, 129]),
]

function film(slug: string, title: string, credit: string, edge: number[], tone: number[]): Favorite {
  return { slug, title, credit, cover: cover("films", slug), edge: rgb(edge), tone: rgb(tone) }
}

// "Screen": films, series and anime, mixed on purpose (genre, format and
// color all change from one disc to the next).
export const films: Favorite[] = [
  film("perfect-days", "Perfect Days", "Directed by Wim Wenders, 2023", [43, 31, 14], [79, 67, 57]),
  film("frieren", "Frieren: Beyond Journey's End", "Directed by Keiichirō Saitō, from the manga by Kanehito Yamada & Tsukasa Abe, 2023", [107, 120, 106], [143, 174, 155]),
  film("breaking-bad", "Breaking Bad", "Created by Vince Gilligan, 2008", [137, 112, 85], [143, 127, 99]),
  film("parasite", "Parasite", "Directed by Bong Joon Ho, 2019", [41, 66, 58], [59, 84, 73]),
  film("akira", "Akira", "Directed by Katsuhiro Otomo, from his manga, 1988", [29, 27, 27], [73, 50, 46]),
  film("the-bear", "The Bear", "Created by Christopher Storer, 2022", [203, 210, 228], [194, 198, 212]),
  film("whiplash", "Whiplash", "Directed by Damien Chazelle, 2014", [0, 0, 0], [26, 25, 29]),
  film("evangelion", "Neon Genesis Evangelion", "Directed by Hideaki Anno, 1995", [46, 65, 102], [51, 64, 90]),
  film("ainda-estou-aqui", "Ainda Estou Aqui", "Directed by Walter Salles, 2024", [129, 146, 156], [114, 118, 121]),
  film("into-the-spider-verse", "Spider-Man: Into the Spider-Verse", "Directed by Bob Persichetti, Peter Ramsey & Rodney Rothman, 2018", [0, 0, 0], [44, 31, 41]),
  film("the-office", "The Office", "Developed by Greg Daniels, from the series by Ricky Gervais & Stephen Merchant, 2005", [148, 144, 144], [137, 133, 134]),
  film("the-batman", "The Batman", "Directed by Matt Reeves, 2022", [203, 16, 16], [162, 17, 18]),
  film("shawshank-redemption", "The Shawshank Redemption", "Directed by Frank Darabont, from the novella by Stephen King, 1994", [64, 45, 38], [95, 80, 66]),
  film("spirited-away", "Spirited Away", "Written and directed by Hayao Miyazaki, 2001", [59, 53, 48], [88, 70, 62]),
  film("attack-on-titan", "Attack on Titan", "Directed by Tetsurō Araki, from the manga by Hajime Isayama, 2013", [75, 39, 13], [115, 84, 59]),
  film("empire-strikes-back", "Star Wars: The Empire Strikes Back", "Directed by Irvin Kershner, 1980", [22, 22, 22], [26, 23, 23]),
]

function book(slug: string, title: string, author: string, edge: number[], tone: number[]): Favorite {
  return { slug, title, credit: author, cover: cover("books", slug), edge: rgb(edge), tone: rgb(tone) }
}

export const books: Favorite[] = [
  book("design-of-everyday-things", "The Design of Everyday Things", "Don Norman", [217, 180, 49], [209, 169, 47]),
  book("thoughts-on-design", "Thoughts on Design", "Paul Rand", [128, 128, 128], [134, 134, 134]),
  book("mamba-mentality", "The Mamba Mentality: How I Play", "Kobe Bryant, photographs by Andrew D. Bernstein", [21, 21, 21], [82, 80, 75]),
  book("vignelli-canon", "The Vignelli Canon", "Massimo Vignelli", [254, 57, 22], [254, 60, 25]),
  book("paul-rand-conversations", "Paul Rand: Conversations with Students", "Michael Kroeger", [253, 228, 52], [246, 192, 55]),
  book("ayrton-senna", "Ayrton Senna: Memories and Mementoes from a Life Lived at Full Speed", "Christopher Hilton", [53, 48, 35], [96, 79, 37]),
  book("thinking-with-type", "Thinking with Type", "Ellen Lupton", [214, 152, 49], [222, 153, 36]),
  book("steve-jobs", "Steve Jobs", "Walter Isaacson", [254, 254, 254], [165, 165, 165]),
  book("politics-of-design", "The Politics of Design", "Ruben Pater", [18, 13, 13], [49, 38, 34]),
  book("distinction", "Distinction: A Social Critique of the Judgement of Taste", "Pierre Bourdieu", [134, 108, 81], [181, 122, 67]),
]

export const favorites: Record<Category, Favorite[]> = { albums, films, books }

export const categoryLabel: Record<Category, string> = {
  albums: "Albums",
  films: "Screen",
  books: "Books",
}

// About text: one array per paragraph; links are { text, href }.
export type Segment = string | { text: string; href: string }
const g = (q: string) => `https://www.google.com/search?q=${encodeURIComponent(q).replace(/%20/g, "+")}`

export const aboutParagraphs: Segment[][] = [
  [
    "I've been drawn to creating things for as long as I can remember. Born and raised in São Paulo, with family roots in ",
    { text: "Tocos do Moji", href: g("tocos do moji mg") },
    ", a small town in ",
    { text: "Minas Gerais", href: g("Minas Gerais") },
    ", I've always been curious about the world around me and the possibilities of making things from scratch.",
  ],
  [
    "As a kid, I spent hours recreating scenes from cartoons with paper and cardboard, building little worlds for my toys. Years later, that same urge to create found a new playground: the internet. During my teenage years, I began experimenting with 3D animations, video intros, thumbnails, banners, and logos for gaming channels. What started as a hobby gradually turned into something more — my first steps into the world of design.",
  ],
  [
    "Over time, I became increasingly interested not just in how things look, but in how they work, how they communicate, and how they shape people's experiences. That's what draws me to design: the opportunity to turn complex ideas into clear, thoughtful, and useful experiences.",
  ],
  [
    "I'm particularly inspired by the work and thinking of ",
    { text: "Massimo Vignelli", href: g("Massimo Vignelli") },
    ", ",
    { text: "Dieter Rams", href: g("Dieter Rams") },
    ", and ",
    { text: "Paul Rand", href: g("Paul Rand") },
    ". Their approaches reinforce something I believe in: good design comes from intention. It's about understanding the problem, making deliberate decisions, finding the right relationships between elements, and knowing what to leave out.",
  ],
  [
    "I'm naturally curious and enjoy learning by doing — exploring new tools, experimenting with different approaches, exchanging ideas, and constantly refining my work. I value critical thinking, meaningful collaboration, and decisions grounded in purpose rather than convention.",
  ],
  [
    "Ultimately, the best design is the kind that gets out of the way, allowing the experience to speak for itself. If it doesn't make someone's life a little easier, what's the point?",
  ],
]
