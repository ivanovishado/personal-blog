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

## Build Verification

Run `npm run build` after adding a post. Frontmatter validation errors and MDX syntax issues surface at build time.
