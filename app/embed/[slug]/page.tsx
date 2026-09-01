import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { streamPlaybackIframeSrc } from "@/lib/cloudflareStream";
import type { Testimonial } from "@/lib/types";

export default async function EmbedPage(props: PageProps<"/embed/[slug]">) {
  const { slug } = await props.params;
  const supabase = await createClient();

  const { data: space } = await supabase.from("spaces").select("*").eq("slug", slug).single();
  if (!space) notFound();

  const limit = space.plan === "pro" ? 1000 : space.testimonial_limit;
  const { data: testimonials } = await supabase
    .from("testimonials")
    .select("*")
    .eq("space_id", space.id)
    .eq("approved", true)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  const accent = space.brand_color || "#4f46e5";

  return (
    <div className="p-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(testimonials ?? []).map((row) => {
          const t = row as Testimonial;
          const streamUid = t.type === "video" && t.media_url?.startsWith("stream:")
            ? t.media_url.slice("stream:".length)
            : null;
          const iframeSrc = streamUid ? streamPlaybackIframeSrc(streamUid) : null;

          return (
            <div
              key={t.id}
              className="rounded-xl border p-4 shadow-sm"
              style={{ borderColor: accent + "33" }}
            >
              {t.type === "video" && iframeSrc && (
                <div className="mb-3 aspect-video overflow-hidden rounded-lg bg-black">
                  <iframe
                    src={iframeSrc}
                    className="h-full w-full"
                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                    allowFullScreen
                  />
                </div>
              )}
              {t.type === "text" && t.content_text && (
                <p className="text-sm text-slate-700">&ldquo;{t.content_text}&rdquo;</p>
              )}
              <p className="mt-3 text-sm font-medium" style={{ color: accent }}>
                {t.customer_name}
              </p>
              {(t.customer_title || t.customer_company) && (
                <p className="text-xs text-slate-500">
                  {[t.customer_title, t.customer_company].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
          );
        })}
        {(testimonials ?? []).length === 0 && (
          <p className="text-sm text-slate-400">No approved testimonials yet.</p>
        )}
      </div>
    </div>
  );
}
