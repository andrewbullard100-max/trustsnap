import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateSpace } from "@/lib/actions/spaces";
import { setApproved, setFeatured, deleteTestimonial } from "@/lib/actions/testimonials";
import { streamPlaybackIframeSrc } from "@/lib/cloudflareStream";
import type { Testimonial } from "@/lib/types";
import UpgradeButton from "./UpgradeButton";

function TestimonialCard({
  t,
  spaceId,
}: {
  t: Testimonial;
  spaceId: string;
}) {
  const streamUid = t.type === "video" && t.media_url?.startsWith("stream:")
    ? t.media_url.slice("stream:".length)
    : null;
  const iframeSrc = streamUid ? streamPlaybackIframeSrc(streamUid) : null;

  return (
    <li className="rounded-xl border border-slate-200 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium">{t.customer_name || "Anonymous"}</p>
          {(t.customer_title || t.customer_company) && (
            <p className="text-xs text-slate-500">
              {[t.customer_title, t.customer_company].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
        <div className="flex gap-1 text-xs">
          {t.approved && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-700">approved</span>
          )}
          {t.featured && (
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-indigo-700">
              featured
            </span>
          )}
        </div>
      </div>

      {t.type === "text" && t.content_text && (
        <p className="mt-3 text-sm text-slate-700">&ldquo;{t.content_text}&rdquo;</p>
      )}

      {t.type === "video" && (
        <div className="mt-3 aspect-video overflow-hidden rounded-lg bg-slate-100">
          {iframeSrc ? (
            <iframe
              src={iframeSrc}
              className="h-full w-full"
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
              allowFullScreen
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-slate-400">
              Video processing or Cloudflare Stream not configured
            </div>
          )}
        </div>
      )}

      <div className="mt-4 flex gap-2 text-sm">
        <form action={setApproved.bind(null, spaceId, t.id, !t.approved)}>
          <button className="rounded-full border border-slate-300 px-3 py-1 hover:border-slate-400">
            {t.approved ? "Unapprove" : "Approve"}
          </button>
        </form>
        <form action={setFeatured.bind(null, spaceId, t.id, !t.featured)}>
          <button className="rounded-full border border-slate-300 px-3 py-1 hover:border-slate-400">
            {t.featured ? "Unfeature" : "Feature"}
          </button>
        </form>
        <form action={deleteTestimonial.bind(null, spaceId, t.id)}>
          <button className="rounded-full border border-red-200 px-3 py-1 text-red-600 hover:border-red-300">
            Delete
          </button>
        </form>
      </div>
    </li>
  );
}

export default async function SpacePage(props: PageProps<"/dashboard/[spaceId]">) {
  const { spaceId } = await props.params;
  const supabase = await createClient();

  const { data: space } = await supabase.from("spaces").select("*").eq("id", spaceId).single();
  if (!space) notFound();

  const { data: testimonials } = await supabase
    .from("testimonials")
    .select("*")
    .eq("space_id", spaceId)
    .order("created_at", { ascending: false });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const submitUrl = `${siteUrl}/s/${space.slug}`;
  const embedSnippet = `<iframe src="${siteUrl}/embed/${space.slug}" style="width:100%;border:0;min-height:480px" loading="lazy"></iframe>`;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <a href="/dashboard" className="text-sm text-slate-500 hover:text-slate-800">
        ← All spaces
      </a>
      <div className="mt-2 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{space.name}</h1>
        {space.plan === "free" ? (
          <UpgradeButton spaceId={spaceId} />
        ) : (
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
            Pro plan
          </span>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 p-5">
        <h2 className="font-semibold">Share your link</h2>
        <p className="mt-1 text-sm text-slate-500">
          Send this to customers — no account required on their end.
        </p>
        <code className="mt-3 block break-all rounded-lg bg-slate-100 px-3 py-2 text-sm">
          {submitUrl}
        </code>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 p-5">
        <h2 className="font-semibold">Embed snippet</h2>
        <p className="mt-1 text-sm text-slate-500">Paste this on your site to show the wall.</p>
        <code className="mt-3 block break-all rounded-lg bg-slate-100 px-3 py-2 text-sm">
          {embedSnippet}
        </code>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 p-5">
        <h2 className="font-semibold">Settings</h2>
        <form action={updateSpace.bind(null, spaceId)} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Headline</label>
            <input
              name="headline"
              defaultValue={space.headline ?? ""}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Question</label>
            <input
              name="question"
              defaultValue={space.question ?? ""}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Brand color</label>
            <input
              name="brand_color"
              type="color"
              defaultValue={space.brand_color ?? "#4f46e5"}
              className="mt-1 h-10 w-16 rounded-lg border border-slate-300"
            />
          </div>
          <button
            type="submit"
            className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Save
          </button>
        </form>
      </div>

      <h2 className="mt-10 text-lg font-semibold">
        Testimonials ({(testimonials ?? []).length})
      </h2>
      <ul className="mt-4 space-y-4">
        {(testimonials ?? []).map((t) => (
          <TestimonialCard key={t.id} t={t as Testimonial} spaceId={spaceId} />
        ))}
        {(testimonials ?? []).length === 0 && (
          <p className="text-sm text-slate-500">
            No submissions yet — share your link to start collecting.
          </p>
        )}
      </ul>
    </div>
  );
}
