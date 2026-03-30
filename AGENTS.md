# Agents

Instructions for AI agents working on this codebase.

## Adding a Blog Post

Create a new `.mdx` file in the appropriate language directory:

- English: `src/content/blog/en/<slug>.mdx`
- Spanish: `src/content/blog/es/<slug>.mdx`

That's it. Astro's content collection picks up any `.md` or `.mdx` file under `src/content/blog/` automatically via the glob loader in `src/content.config.ts`.

## Frontmatter Schema

Every post requires this frontmatter (validated by Zod at build time):

```yaml
---
title: "Post Title"          # required, max 110 chars
description: "Summary"       # required
pubDate: 2026-03-10          # required, coerced to Date
authors: ["Ivan Galaviz"]    # min 1, defaults to ["Ivan Galaviz"]
tags: ["tag1", "tag2"]       # min 1, max 5
lang: en                     # "en" or "es"
draft: true                  # defaults to false
tldr: "One-liner summary"    # optional, max 200 chars
updatedDate: 2026-03-15      # optional
translationSlug: "slug-es"   # optional, links to translation
heroImage: "/images/hero.jpg" # optional
heroImageAlt: "Alt text"     # optional
ogImage: "/images/og.jpg"    # optional
---
```

Posts with `draft: true` are excluded from all routes (index, tag pages, RSS, individual pages). Set to `false` when ready to publish.

## Translations

To link an English post to its Spanish translation (or vice versa), set `translationSlug` to the other post's filename without extension. The language switcher uses this to navigate between versions.

## Routing

Posts are served at `/<lang>/<slug>/` where `<slug>` is the filename without extension. The `lang` field in frontmatter must match the directory (`en/` or `es/`).

## Writing Guidelines

Read `misc/tropes.md` before writing any prose. It lists AI writing patterns to avoid (negative parallelism, bold-first bullets, em-dash overuse, etc.). The Spanish version is at `misc/tropes-es.md`.

## Hero and OG Images

When adding images for a blog post, optimize them before committing:

1. Convert the hero image to webp at 1920px wide, quality 80: `cwebp -q 80 -resize 1920 0 source.jpg -o public/<slug>.webp`
2. Create the OG image as jpg at 1200x630, quality 60: `sips -s format jpeg -s formatOptions 60 -z 630 1200 source.jpg --out public/<slug>-og.jpg`
3. Delete the original source file after generating both variants.
4. Add `heroImage`, `heroImageAlt`, and `ogImage` to the post's frontmatter. The Spanish post shares the same image files but gets its own `heroImageAlt` in Spanish.

Target sizes: hero under 300KB, OG under 200KB. Both `sips` and `cwebp` are available on this machine.

## Build Verification

Run `npm run build` after adding a post. Frontmatter validation errors and MDX syntax issues surface at build time.
