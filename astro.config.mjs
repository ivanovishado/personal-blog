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
  integrations: [mdx(), sitemap()],
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
