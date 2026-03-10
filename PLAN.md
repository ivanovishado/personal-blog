# Plan: Add Blog at `blog.ivanovishado.dev`

## Context

The portfolio at `www.ivanovishado.dev` is a single-page vanilla HTML/CSS/JS site built with Vite 7, Tailwind CSS v4, GSAP, and Lenis. It deploys to GitHub Pages. There is no blog, no i18n, and no content pipeline. The goal is to add a beautiful, SEO-first blog at `blog.ivanovishado.dev` with EN/ES i18n, dark/light mode, and design continuity with the portfolio's space-themed aesthetic.

### Deliverable (this session)
1. Create `personal-blog` repo on GitHub
2. Clone it locally
3. Dump this plan as `PLAN.md` in the new repo
4. Apply cross-linking changes to this (portfolio) repo:
   - Add "Blog" link to `src/sections/navbar.html`
   - Add `@id` to Person JSON-LD in `index.html`
   - Add `"https://blog.ivanovishado.dev"` to `sameAs` array in `index.html`

---

## Architecture Decision: Separate Repo with Astro 5

**Separate repository.** Three reasons:

1. **GitHub Pages constraint** — GitHub Pages maps one custom domain per repo. The portfolio already claims `www.ivanovishado.dev`. The subdomain `blog.ivanovishado.dev` needs its own repo/deployment.
2. **Architectural fit** — The portfolio is intentionally frameworkless. Bolting a markdown pipeline, i18n routing, RSS generation, and content collections onto raw Vite would mean building a bespoke SSG. Astro already does all of this.
3. **Separation of concerns** — A portfolio changes when you switch jobs. A blog changes when you write a post. Different update cadences, different performance budgets.

**Why Astro 5** over Hugo, 11ty, Next.js:

| Framework | Verdict |
|-----------|---------|
| **Astro 5** | Content collections (Zod schemas), built-in i18n routing, Shiki syntax highlighting, static output, MDX, RSS + sitemap integrations. Purpose-built for this. |
| Hugo | Fast builds but Go templates are painful for custom components, weaker Tailwind integration. |
| 11ty | Flexible but needs manual wiring for everything Astro gives out of the box. |
| Next.js | Ships a JS runtime for a fully static site. No benefit here. |
| Extending Vite | Would mean building a framework. The mentorship page plan (`PLAN-mentorship-page.md`) already shows MPA complexity growing. |

---

## Typography: Three-Font Stack

| Role | Font | Source |
|------|------|--------|
| **Headings** | Cabinet Grotesk (variable) | Fontshare CDN (same as portfolio) |
| **Prose body** | Source Serif 4 (variable, 200-900) | Google Fonts |
| **Code blocks** | JetBrains Mono (300-700) | Google Fonts (same as portfolio) |

**Why Source Serif 4** for prose: Designed by Frank Griesshammer at Adobe specifically for screen reading. Moderate stroke contrast works well on dark backgrounds (unlike ultra-thin serifs like Garamond that disappear). The geometric sans (Cabinet Grotesk) + humanist serif (Source Serif) pairing is a classic contrast. Variable font keeps payload small.

```css
--font-prose: "Source Serif 4", "Source Serif Pro", Georgia, serif;
```

---

## Repository Structure

New repo: `ivanovishado/personal-blog`

```
blog.ivanovishado.dev/
  astro.config.mjs
  package.json
  tsconfig.json
  CNAME                              # blog.ivanovishado.dev
  .github/workflows/deploy.yml      # GitHub Pages (mirrors portfolio pattern)
  public/
    favicon.svg                      # Same as portfolio
    robots.txt                       # Allow all crawlers incl. AI bots
    og-default.png
  src/
    content/
      config.ts                      # Zod content collection schema
      blog/
        en/
          2026-03-15-building-event-driven-systems.mdx
        es/
          2026-03-15-construyendo-sistemas-event-driven.mdx
    layouts/
      BaseLayout.astro               # HTML shell, fonts, analytics, grain overlay
      BlogPost.astro                 # Article wrapper, prose styles, TOC, reading time
    pages/
      index.astro                    # Root → redirect to /en/
      en/
        index.astro                  # Blog home (EN)
        [...slug].astro              # Post pages (EN)
        tags/[tag].astro             # Tag archives
        rss.xml.ts                   # RSS feed (EN)
      es/
        index.astro                  # Blog home (ES)
        [...slug].astro              # Post pages (ES)
        tags/[tag].astro
        rss.xml.ts                   # RSS feed (ES)
    components/
      BlogCard.astro
      TableOfContents.astro          # Sticky sidebar (desktop), collapsible (mobile)
      LanguageSwitcher.astro
      BackToPortfolio.astro
      ThemeToggle.astro              # Dark/light mode toggle (sun/moon icons)
      Grain.astro                    # Same SVG feTurbulence grain as portfolio (dark only)
      SEOHead.astro                  # JSON-LD, OG, hreflang, canonical
    styles/
      tokens.css                     # Design tokens mirrored from portfolio
      prose.css                      # Blog typography + code block styling
    i18n/
      ui.ts                          # UI string translations
```

### Frontmatter Schema

```typescript
// src/content/config.ts
const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().max(110),
    description: z.string().min(140).max(160),  // Meta description length
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.literal('Ivan Galaviz').default('Ivan Galaviz'),
    tags: z.array(z.string()).min(1).max(5),
    lang: z.enum(['en', 'es']),
    translationSlug: z.string().optional(),      // Links EN<->ES versions
    heroImage: z.string().optional(),
    heroImageAlt: z.string().optional(),
    ogImage: z.string().optional(),
    draft: z.boolean().default(false),
    tldr: z.string().max(200).optional(),        // AI-optimized summary box
  }),
});
```

---

## i18n Implementation

- **Routing**: `/en/` and `/es/` prefixes. Both prefixed (no ambiguity, clean hreflang).
- **Root redirect**: `/` → `/en/` via 302 (Accept-Language detection optional, default EN).
- **Content linking**: `translationSlug` in frontmatter links EN↔ES versions bidirectionally.
- **UI strings**: `src/i18n/ui.ts` with typed keys (`nav.home`, `post.readMore`, etc.).
- **hreflang tags**: Every page emits `<link rel="alternate" hreflang="en|es|x-default">`.

```javascript
// astro.config.mjs
i18n: {
  defaultLocale: 'en',
  locales: ['en', 'es'],
  routing: { prefixDefaultLocale: true },
}
```

---

## SEO Implementation

### Per-Page Meta (in `SEOHead.astro`)
- `<title>`: `{post.title} | Ivan Galaviz Blog`
- `<meta name="description">`: from frontmatter
- `<link rel="canonical">`: full URL
- OG tags: title, description, image, type:article, locale
- Twitter card: summary_large_image
- hreflang tags (EN, ES, x-default)

### JSON-LD Schema (per post)
- **BlogPosting**: headline, datePublished, dateModified, author, wordCount, keywords
- **BreadcrumbList**: Blog → Post Title
- **Person**: Consistent `@id` with portfolio (`https://www.ivanovishado.dev/#person`)

> **Important**: The portfolio's Person schema currently lacks `@id`. We should add `"@id": "https://www.ivanovishado.dev/#person"` to the portfolio's JSON-LD so the blog can reference the same entity. This strengthens E-E-A-T signals.

### Sitewide SEO
- `@astrojs/sitemap` — auto-generates sitemap from routes
- `@astrojs/rss` — two feeds: `/en/rss.xml`, `/es/rss.xml` (full content, not excerpts)
- `robots.txt` — allow all crawlers including GPTBot, ClaudeBot, PerplexityBot

### AI Search Optimization
- `tldr` frontmatter renders as a highlighted summary box (answer-first formatting)
- Every H2 opens with a 40-60 word stat-rich paragraph ("citation capsule")
- Schema in HTML source, not injected via JS (AI crawlers don't execute JS)

---

## Code Block Design

### Custom Shiki Theme (`orbital-dark.json`)

Map to the portfolio's palette:

| Syntax Element | Color | Token |
|---------------|-------|-------|
| Background | `#0C0F14` | dark-900 |
| Text | `#e2e8f0` | starlight |
| Keywords | `#2563EB` | event-horizon |
| Strings | `#F5F0E8` | active-signal |
| Comments | `#64748B` | text-tertiary |
| Functions | `#60A5FA` | lighter event-horizon |
| Types/Classes | `#93C5FD` | lightest event-horizon |
| Operators | `#94A3B8` | text-secondary |
| Errors | `#EF4444` | alert |

### UI Features
- Language label pill (top-right)
- Copy button (appears on hover, Phosphor clipboard icon)
- Optional filename tab (via ````lang title="file.ts"`)
- Line highlighting (via `{3-5,8}` syntax)
- JetBrains Mono at `0.875rem`
- Border: `1px solid rgba(255,255,255,0.08)` + `border-radius: 0.75rem`
- No line numbers by default (available via attribute)

---

## Design Token Sharing

**Manual mirroring** — The token set is ~40 lines of CSS. Building infrastructure (npm package, git submodule) to sync is overengineering for a one-person project. The blog's `src/styles/tokens.css` includes a "Source of truth" comment with a URL and sync date.

The blog adds two new tokens: `--font-prose` for Source Serif 4, and the light-mode color mappings.

---

## Dark/Light Mode

### Strategy
- **Class-based** toggle via `dark` class on `<html>` — allows manual override of OS preference
- **Default**: Respect `prefers-color-scheme` on first visit
- **Persistence**: Store preference in `localStorage`
- **No flash**: Inline `<script>` in `<head>` reads localStorage before first paint
- **Grain overlay**: Visible in dark mode (0.03 opacity), hidden in light mode

### Color Mapping

Accent colors (event-horizon blue) stay the same in both modes — blue has sufficient contrast on both backgrounds. Surface and text colors invert:

| Token | Dark Mode | Light Mode |
|-------|-----------|------------|
| `--color-void` (bg) | `#06080C` | `#FAFAF9` (warm white) |
| `--color-starlight` (text) | `#e2e8f0` | `#1A1F2A` (near-black) |
| `--color-event-horizon` | `#2563EB` | `#2563EB` (unchanged) |
| `--color-event-horizon-deep` | `#1E40AF` | `#1E40AF` (unchanged) |
| `--color-active-signal` | `#F5F0E8` | `#92400E` (warm brown — visible on light bg) |
| `--color-dark-900` (surfaces) | `#0C0F14` | `#FFFFFF` |
| `--color-dark-800` | `#12161E` | `#F8FAFC` |
| `--color-dark-700` | `#1A1F2A` | `#F1F5F9` |
| `--color-dark-600` | `#242B38` | `#E2E8F0` |
| `--color-text-secondary` | `#94A3B8` | `#64748B` |
| `--color-text-tertiary` | `#64748B` | `#94A3B8` |
| `--color-border` | `rgba(255,255,255,0.08)` | `rgba(0,0,0,0.08)` |

### Implementation in CSS

```css
/* Light mode (default when no .dark class) */
:root {
  --color-void: #FAFAF9;
  --color-starlight: #1A1F2A;
  /* ... all light values ... */
}

/* Dark mode */
:root.dark {
  --color-void: #06080C;
  --color-starlight: #e2e8f0;
  /* ... all dark values (matching portfolio) ... */
}
```

### Flash Prevention Script (inline in `<head>`)

```html
<script>
  const theme = localStorage.getItem('theme');
  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
</script>
```

### Toggle Component

- Sun/Moon icons from Phosphor Icons (`ph-sun` / `ph-moon`)
- Placed in header next to the language switcher
- Smooth transition on toggle (CSS `transition` on background/color properties)
- Three states cycle: System → Light → Dark → System

### Dual Shiki Themes for Code Blocks

Astro/Shiki supports multi-theme via CSS custom properties:

```javascript
// astro.config.mjs
markdown: {
  shikiConfig: {
    themes: {
      light: './src/styles/orbital-light.json',
      dark: './src/styles/orbital-dark.json',
    },
  },
}
```

Light code block palette:

| Syntax Element | Dark | Light |
|---------------|------|-------|
| Background | `#0C0F14` | `#F8FAFC` |
| Text | `#e2e8f0` | `#1E293B` |
| Keywords | `#2563EB` | `#1D4ED8` |
| Strings | `#F5F0E8` | `#B45309` (amber) |
| Comments | `#64748B` | `#94A3B8` |
| Functions | `#60A5FA` | `#2563EB` |
| Types | `#93C5FD` | `#1E40AF` |
| Errors | `#EF4444` | `#DC2626` |

### Gradient Text in Light Mode

The portfolio's `gradient-text-orbital` (cream → blue) won't be readable on a light background. In light mode, flip to a darker gradient:

```css
:root .gradient-text-orbital {
  background: linear-gradient(135deg, #92400E 0%, #1D4ED8 100%);
}
:root.dark .gradient-text-orbital {
  background: linear-gradient(135deg, #F5F0E8 0%, #2563EB 100%);
}
```

---

## Deployment

1. **DNS**: CNAME record `blog` → `ivanovishado.github.io`
2. **Repo**: CNAME file containing `blog.ivanovishado.dev`
3. **CI/CD**: GitHub Actions workflow (same pattern as portfolio: `npm ci` → `npm run build` → upload `./dist` → deploy-pages)
4. **Analytics**: Same Umami instance with a new website ID for the blog

### Publishing Workflow
1. Write `.mdx` file in `src/content/blog/en/` (and optionally `es/`)
2. Set `draft: false` in frontmatter
3. Push to `main`
4. GitHub Actions builds and deploys (~1-2 min)

---

## Features: Day One vs Deferred

### Day One
- Dark/light mode toggle (System → Light → Dark cycle, persisted in localStorage)
- Tags + tag archive pages
- Table of Contents (sticky sidebar desktop, collapsible mobile)
- Reading time (build-time word count)
- RSS feeds (per language)
- Language switcher (links to translated version via `translationSlug`)
- Back to portfolio link
- TL;DR summary box (from `tldr` frontmatter)
- Umami analytics
- Grain overlay (dark mode only, visual continuity with portfolio)

### Deferred
- **Search** → Add when 20+ posts exist (use Pagefind — static, no server)
- **Comments** → Use Giscus (GitHub Discussions-based) when ready
- **Newsletter** → Buttondown or Resend when regular readership exists
- **Related posts** → After 10+ posts, tag-overlap scoring
- **Auto OG images** → Satori + Sharp when manual OG images become tedious

---

## Cross-Linking with Portfolio

Changes to the portfolio repo:
1. Add "Blog" link to navbar pointing to `https://blog.ivanovishado.dev`
2. Add `@id` to the Person JSON-LD schema: `"@id": "https://www.ivanovishado.dev/#person"`
3. Add `"https://blog.ivanovishado.dev"` to `sameAs` array in Person schema

---

## Key Dependencies (Astro Project)

```json
{
  "astro": "^5.x",
  "@astrojs/mdx": "^4.x",
  "@astrojs/sitemap": "^3.x",
  "@astrojs/rss": "^4.x",
  "@astrojs/tailwind": "^6.x",
  "tailwindcss": "^4.x",
  "reading-time": "^1.x",
  "sharp": "^0.33.x"
}
```

---

## Implementation Sequence

1. Create `personal-blog` repo on GitHub, clone locally, add this plan as `PLAN.md`
2. Init Astro 5 + Tailwind v4, configure `astro.config.mjs`
3. Mirror design tokens into `src/styles/tokens.css` with dark/light mode variants, add `--font-prose`
4. Create dual Shiki themes (`orbital-dark.json` + `orbital-light.json`)
5. Build `BaseLayout.astro` (HTML shell, fonts, analytics, grain, theme script) + `BlogPost.astro` (prose styles, TOC, reading time)
6. Build `ThemeToggle.astro` (sun/moon, localStorage persistence, system-aware)
7. Configure content collections (Zod schema in `src/content/config.ts`)
8. Set up i18n (routing, UI strings, `LanguageSwitcher`)
9. Build pages (blog index, `[...slug].astro`, tag pages)
10. Add RSS + sitemap integrations
11. Configure deployment (CNAME, GitHub Actions, DNS)
12. Write first post in EN + ES to validate the full pipeline
13. Cross-link: add "Blog" nav link + `@id` to portfolio's Person schema

## Verification

1. `npm run dev` — preview locally, verify all routes render
2. Click through EN/ES language switcher, verify hreflang tags in source
3. Validate JSON-LD at https://validator.schema.org/
4. Validate RSS feeds render valid XML
5. Push to GitHub, verify Actions workflow succeeds and Pages deploy works
6. Visit `blog.ivanovishado.dev` — verify DNS resolution and HTTPS
7. Test OG tags via https://www.opengraph.xyz/
8. Lighthouse audit: target 95+ on Performance, 100 on Accessibility, SEO, Best Practices

---

## Critical Files (Portfolio Repo — for reference/modification)

| File | Purpose |
|------|---------|
| `styles/globals.css` | Source of truth for design tokens to mirror |
| `styles/base.css:29-40` | Grain overlay CSS to replicate |
| `index.html:46-84` | Person + WebSite JSON-LD to add `@id` and blog `sameAs` |
| `.github/workflows/deploy.yml` | Deployment workflow pattern to follow |
| `src/sections/navbar.html` | Add "Blog" link here |
