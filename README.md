# Personal Blog

Ivan Galaviz's blog built with Astro, MDX, and Tailwind CSS v4. Bilingual (English/Spanish) with custom Shiki themes, reading progress, and table of contents.

Live at [blog.ivanovishado.dev](https://blog.ivanovishado.dev)

## Prerequisites

- Node.js >= 24
- npm

## Setup

```bash
npm install
```

## Development

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build locally
```

## Project Structure

```
src/
  content/
    blog/
      en/          # English posts (.md, .mdx)
      es/          # Spanish posts (.md, .mdx)
  components/      # Astro components
  layouts/         # BaseLayout, BlogPost
  pages/
    [lang]/
      [...slug].astro    # Blog post pages
      index.astro        # Blog index
      tags/[tag].astro   # Tag pages
      rss.xml.ts         # RSS feed
  i18n/ui.ts       # Translation strings
  styles/          # Custom Shiki themes (orbital-dark, orbital-light)
  content.config.ts  # Collection schema (Zod validation)
```

## Deployment

Pushes to `main` trigger GitHub Actions (`.github/workflows/deploy.yml`) which builds and deploys to GitHub Pages. The `CNAME` file points to `blog.ivanovishado.dev`.

## Stack

- [Astro](https://astro.build) v6 (static site generation)
- [MDX](https://mdxjs.com) for blog content
- [Tailwind CSS](https://tailwindcss.com) v4
- [Shiki](https://shiki.style) with custom themes for syntax highlighting
- [reading-time](https://www.npmjs.com/package/reading-time) for estimated read times
- [sharp](https://sharp.pixelplumbing.com) for image optimization
