// Post-build step for GitHub Pages (static hosting, client-side router).
// Every route needs its own real index.html, and because crawlers and link
// previews read the *raw* HTML, each copy also gets its own <title>,
// description, canonical and og:* tags (single source of truth: src/seo.json).
import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const seo = JSON.parse(readFileSync(join('src', 'seo.json'), 'utf8'))
const siteUrl = seo.siteUrl
const distIndex = join('dist', 'index.html')
const baseHtml = readFileSync(distIndex, 'utf8')

const escText = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const escAttr = s => escText(s).replace(/"/g, '&quot;')

function swap(html, re, replacement, what) {
  if (!re.test(html)) throw new Error(`copy-routes: "${what}" not found in dist/index.html`)
  return html.replace(re, replacement)
}

function withMeta(html, { title, description, url }) {
  let out = html
  out = swap(out, /<title>[\s\S]*?<\/title>/, () => `<title>${escText(title)}</title>`, 'title')
  out = swap(out, /(<meta name="description" content=")[^"]*(")/, (_, a, b) => a + escAttr(description) + b, 'meta description')
  out = swap(out, /(<meta property="og:title" content=")[^"]*(")/, (_, a, b) => a + escAttr(title) + b, 'og:title')
  out = swap(out, /(<meta property="og:description" content=")[^"]*(")/, (_, a, b) => a + escAttr(description) + b, 'og:description')
  out = swap(out, /(<meta\s+property="og:url"\s+content=")[^"]*(")/, (_, a, b) => a + url + b, 'og:url')
  out = swap(out, /(<link\s+rel="canonical"\s+href=")[^"]*(")/, (_, a, b) => a + url + b, 'canonical')
  // Link previews (LinkedIn, WhatsApp, X, Slack…) need absolute image URLs.
  out = out.replace(/(<meta (?:property="og:image"|name="twitter:image") content=")(\/[^"]*)(")/g, (_, a, path, b) => a + siteUrl + path + b)
  return out
}

// Structured data for a case-study page: what it is, who made it, where it sits.
function routeJsonLd(route, url) {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CreativeWork',
        '@id': `${url}#case-study`,
        url,
        name: route.name,
        headline: route.title,
        description: route.description,
        genre: 'UX/UI case study',
        inLanguage: 'en',
        author: { '@id': `${siteUrl}/#gabriel-braga` },
        creator: { '@id': `${siteUrl}/#gabriel-braga` },
        isPartOf: { '@id': `${siteUrl}/#website` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Gabriel Braga', item: `${siteUrl}/` },
          { '@type': 'ListItem', position: 2, name: route.name, item: url },
        ],
      },
    ],
  }
  return `<script type="application/ld+json">${JSON.stringify(graph)}</script>`
}

// Home
writeFileSync(distIndex, withMeta(baseHtml, { ...seo.home, url: `${siteUrl}/` }))

// Project routes
const written = []
for (const route of Object.values(seo.routes)) {
  const dir = route.path.replace(/^\/|\/$/g, '')
  mkdirSync(join('dist', dir), { recursive: true })
  const url = `${siteUrl}${route.path}`
  const page = withMeta(baseHtml, { ...route, url }).replace('</head>', () => `  ${routeJsonLd(route, url)}\n  </head>`)
  writeFileSync(join('dist', dir, 'index.html'), page)
  written.push(dir)
}

console.log('index.html + rotas com SEO próprio:', written.join(', '))
