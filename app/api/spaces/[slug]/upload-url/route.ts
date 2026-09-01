import { NextResponse } from "next/server";
import { createStreamUploadUrl } from "@/lib/cloudflareStream";
import { createClient } from "@/lib/supabase/server";

export async function POST(_request: Request, ctx: RouteContext<"/api/spaces/[slug]/upload-url">) {
  const { slug } = await ctx.params;

  const supabase = await createClient();
  const { data: space } = await supabase
    .from("spaces")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (!space) {
    return NextResponse.json({ error: "Space not found" }, { status: 404 });
  }

  try {
    const { uploadURL, uid } = await createStreamUploadUrl({
      maxDurationSeconds: 300,
      meta: { spaceSlug: slug },
    });
    return NextResponse.json({ uploadURL, uid });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload URL request failed" },
      { status: 502 }
    );
  }
}
