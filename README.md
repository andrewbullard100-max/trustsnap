# TrustSnap

Collect text or video customer testimonials with zero friction, embed a wall of love.

Rebuilt from scratch after the original deployment was found to have no linked Git repo and
no recoverable source — see the `harden_media_storage_policies` Supabase migration for the
security history this project inherited (the `spaces` / `testimonials` / `subscriptions`
schema and RLS policies already existed and were reused as-is).

## Cross-device video, explained

Safari (especially iOS) cannot record `video/webm` at all, and cannot play it back either.
Rather than force every browser to produce one recording format, `SubmitForm.tsx` records
whatever format the device actually supports (`MediaRecorder.isTypeSupported` picks the best
of mp4/h264 or webm/vp8/vp9) and uploads the raw file straight to **Cloudflare Stream**, which
transcodes it server-side into one format that plays back on every device regardless of what
recorded it. See `lib/cloudflareStream.ts`.

## Local setup

```bash
npm install
cp .env.local.example .env.local   # fill in the blanks, see below
npm run dev
```

### Required services

- **Supabase** — already provisioned (project `cerqkfqdzzgqfewnuyad`), URL/anon key are
  pre-filled in `.env.local.example`. You still need `SUPABASE_SERVICE_ROLE_KEY` (Supabase
  dashboard → Project Settings → API → service_role) for the Stripe webhook to write
  subscription rows — never expose this key to the browser.
- **Cloudflare Stream** — create an account, enable Stream, create an API token (Stream:Edit
  permission), and fill in `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_STREAM_API_TOKEN`, and
  `NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE` (visible in any Stream video's embed code as
  the `customer-xxxx` subdomain). Without this, video submissions will fail with a clear error
  and text submissions still work.
- **Stripe** — create a $29/mo recurring Price, then fill in `STRIPE_SECRET_KEY`,
  `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_PRICE_ID_PRO`, and `STRIPE_WEBHOOK_SECRET`
  (from `stripe listen --forward-to localhost:3000/api/webhooks/stripe` while developing).

## Deploying

This is meant to replace the untracked `trustsnap` Vercel project
(`prj_GEgwddXZzaCxVCVfNR1kgHcWvQj5`, domains `trustsnap.co` / `www.trustsnap.co`). Connect this
repo to that Vercel project and set the same environment variables there (with
`NEXT_PUBLIC_SITE_URL=https://trustsnap.co`), so the deployment is finally reproducible from
source control instead of a one-off manual upload.
