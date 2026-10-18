import { preview } from 'astro';

await preview({
  server: { host: '127.0.0.1', port: Number(process.env.SITE_TEST_PORT ?? 4328) },
});
