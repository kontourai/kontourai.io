# Early-Access Email Capture

The site collects early-access emails through a small same-origin endpoint backed
by Cloudflare KV. There is no third-party form service and no client-side secret.

## How it works

- `<Subscribe />` (`src/components/Subscribe.astro`) renders the form on the home
  CTA and the early-access hero. Its progressive-enhancement script ships as a
  static asset, `public/subscribe.js`, so it satisfies the strict
  `script-src 'self'` CSP without `unsafe-inline`.
- The form POSTs JSON to `/api/subscribe`, handled by the Pages advanced-mode
  worker in `public/_worker.js`.
- Valid submissions are written to a KV namespace bound as `SUBSCRIBERS`, keyed
  `sub:<lowercased-email>`.

### API contract

`POST /api/subscribe` with `{ "email": string, "source"?: string, "company"?: "" }`

| Response | Meaning |
| --- | --- |
| `200 {ok:true}` | Stored (or honeypot silently accepted) |
| `422 {error:"invalid-email"}` | Email failed validation |
| `405 {error:"method-not-allowed"}` | Non-POST request |
| `429 {error:"rate-limited"}` | >5 writes / 10 min from one IP |
| `503 {error:"not-configured"}` | `SUBSCRIBERS` KV binding is missing |

`company` is a honeypot: any non-empty value returns `200` without storing.

## One-time setup (Cloudflare)

```sh
npx wrangler login
npx wrangler kv namespace create SUBSCRIBERS
```

Then bind it to the Pages project so the worker can see it:

**Workers & Pages → kontourai-io → Settings → Bindings → Add → KV namespace**
- Variable name: `SUBSCRIBERS`
- Namespace: the one created above
- Add the binding for **Production** and **Preview**, then redeploy.

Until the binding exists, `/api/subscribe` returns `503` and the form shows a
"signup is warming up — email hello@kontourai.io" message instead of failing
silently.

## Reading subscribers

```sh
# list namespaces to get the id
npx wrangler kv namespace list

# list captured emails (keys are sub:<email>)
npx wrangler kv key list --namespace-id <id>

# read one record
npx wrangler kv key get "sub:jane@example.com" --namespace-id <id>
```

Each value is `{ email, source, ts, ua, ref }`.

## Local testing (no Cloudflare auth)

`wrangler pages dev` runs the worker against a local miniflare KV:

```sh
npm run build
npx wrangler pages dev dist --kv SUBSCRIBERS --port 8788

# in another shell
curl -s -X POST http://127.0.0.1:8788/api/subscribe \
  -H 'content-type: application/json' \
  -d '{"email":"jane@example.com","source":"local"}'
# → {"ok":true}
```
