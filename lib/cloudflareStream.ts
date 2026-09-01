const CF_API = "https://api.cloudflare.com/client/v4";

/**
 * Requests a one-time direct-upload URL from Cloudflare Stream. The browser
 * PUTs the raw recording straight to Cloudflare (whatever container/codec the
 * device produced — mp4 from Safari, webm from Chrome/Firefox/Android) and
 * Cloudflare transcodes it server-side into one adaptive format that plays
 * back on every device. This is what removes the need to make every browser
 * record the same format.
 */
export async function createStreamUploadUrl(opts: {
  maxDurationSeconds?: number;
  meta?: Record<string, string>;
}) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_STREAM_API_TOKEN;
  if (!accountId || !token) {
    throw new Error("Cloudflare Stream is not configured (missing account id or API token)");
  }

  const res = await fetch(`${CF_API}/accounts/${accountId}/stream/direct_upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      maxDurationSeconds: opts.maxDurationSeconds ?? 300,
      meta: opts.meta,
    }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.errors?.[0]?.message ?? "Cloudflare Stream request failed");
  }

  return json.result as { uploadURL: string; uid: string };
}

export function streamPlaybackIframeSrc(uid: string) {
  const customerCode = process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE;
  if (!customerCode) return null;
  return `https://customer-${customerCode}.cloudflarestream.com/${uid}/iframe`;
}
