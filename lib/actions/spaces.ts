"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") || "space"
  );
}

export async function createSpace(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const question = String(formData.get("question") ?? "").trim() || null;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const base = slugify(name);
  let slug = base;
  for (let i = 0; i < 20; i++) {
    const { data: existing } = await supabase
      .from("spaces")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!existing) break;
    slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const { data, error } = await supabase
    .from("spaces")
    .insert({ owner_id: user.id, name, slug, question })
    .select("id")
    .single();

  if (error || !data) {
    redirect(`/dashboard?error=${encodeURIComponent(error?.message ?? "Could not create space")}`);
  }

  redirect(`/dashboard/${data.id}`);
}

export async function updateSpace(spaceId: string, formData: FormData) {
  const supabase = await createClient();
  const headline = String(formData.get("headline") ?? "").trim() || null;
  const question = String(formData.get("question") ?? "").trim() || null;
  const brand_color = String(formData.get("brand_color") ?? "").trim() || null;

  await supabase.from("spaces").update({ headline, question, brand_color }).eq("id", spaceId);
  revalidatePath(`/dashboard/${spaceId}`);
}
