# Portfólio — Gabriel Braga

Portfólio de Gabriel Braga, designer (Product, UX/UI e Interaction Design) em São Paulo.

**Site:** https://bragahouser.com.br

Home com carrossel de projetos e páginas de estudo de caso: **PlayStation Connect**, **Decolar** e **Soundroom**.

## Tecnologias

React 19, TypeScript, Vite, Tailwind CSS 4 e React Router. Tipografia **PP Neue Montreal**.

> As fontes PP Neue Montreal são da Pangram Pangram e têm licença própria; confira os termos antes de reutilizá-las em outros projetos.

## Rodando localmente

```bash
npm install
npm run dev       # servidor de desenvolvimento
npm run build     # build de produção + páginas por rota
npm run preview   # serve o build localmente
npm run format    # formatação (oxfmt)
```

## Como o site é publicado

O site é estático e roda no **GitHub Pages**, a partir da branch `gh-pages`, com o domínio próprio definido em `public/CNAME`.

```bash
npm run deploy    # publica a pasta dist na branch gh-pages
```

Como o GitHub Pages não tem roteamento no servidor, o passo `scripts/copy-routes.mjs` (executado no `npm run build`) gera um `index.html` para cada rota (`/decolar/`, `/sound-room/`, `/playstation-connect/`).

## SEO

Título, descrição, URL canônica e tags `og:*` de cada página vêm de `src/seo.json` e são gravados no HTML final pelo `copy-routes.mjs`, para que buscadores e prévias de link leiam o conteúdo correto sem executar JavaScript. Os dados estruturados (JSON-LD) ficam em `index.html`, e `public/sitemap.xml` e `public/robots.txt` completam a indexação.

## Estrutura

```
src/App.tsx          páginas (Home, cases) e entrada animada
src/seo.json         título/descrição/URL de cada rota
src/assets/fonts/    fontes PP Neue Montreal
src/imports/         imagens dos projetos
scripts/             copy-routes.mjs (HTML por rota + metadados)
public/              CNAME, sitemap, robots, favicons
```
