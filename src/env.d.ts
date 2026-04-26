/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_UMAMI_WEBSITE_ID?: string;
  readonly PUBLIC_UMAMI_SCRIPT_URL?: string;
  readonly PUBLIC_UMAMI_DOMAINS?: string;
  readonly PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN?: string;
  readonly PUBLIC_CLOUDFLARE_WEB_ANALYTICS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
