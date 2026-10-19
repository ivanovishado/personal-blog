import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'node:fs';

// Load custom Shiki themes
const orbitalDark = JSON.parse(
  readFileSync(new URL('./src/styles/orbital-dark.json', import.meta.url), 'utf-8')
);
const orbitalLight = JSON.parse(
  readFileSync(new URL('./src/styles/orbital-light.json', import.meta.url), 'utf-8')
);

export default defineConfig({
  site: 'https://blog.ivanovishado.dev',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    routing: {
      prefixDefaultLocale: true,
    },
  },
  integrations: [
    mdx(),
    sitemap({
      // Only list posts and the language indexes. The root redirects to /en/
      // and tag pages are noindex.
      filter: (page) =>
        page !== 'https://blog.ivanovishado.dev/' && !page.includes('/tags/'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      themes: {
        light: orbitalLight,
        dark: orbitalDark,
      },
    },
  },
});
