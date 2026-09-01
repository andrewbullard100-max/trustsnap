"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function setApproved(spaceId: string, testimonialId: string, approved: boolean) {
  const supabase = await createClient();
  await supabase.from("testimonials").update({ approved }).eq("id", testimonialId);
  revalidatePath(`/dashboard/${spaceId}`);
}

export async function setFeatured(spaceId: string, testimonialId: string, featured: boolean) {
  const supabase = await createClient();
  await supabase.from("testimonials").update({ featured }).eq("id", testimonialId);
  revalidatePath(`/dashboard/${spaceId}`);
}

export async function deleteTestimonial(spaceId: string, testimonialId: string) {
  const supabase = await createClient();
  await supabase.from("testimonials").delete().eq("id", testimonialId);
  revalidatePath(`/dashboard/${spaceId}`);
}
