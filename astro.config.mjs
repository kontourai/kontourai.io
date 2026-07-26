import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://kontourai.io',
  // /memory/ was a position paper that argued the Knowledge Kit's case without
  // mentioning it, and made one claim the product does not back. Its useful
  // half (keep your own memory layer, this doesn't replace it) now lives at
  // /knowledge-kit/#bring-your-own.
  redirects: {
    '/memory/': '/knowledge-kit/#bring-your-own',
  },
  build: {
    inlineStylesheets: 'never',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
