import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { spaceId } = await request.json();
  if (!spaceId) {
    return NextResponse.json({ error: "spaceId is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: space } = await supabase
    .from("spaces")
    .select("id, owner_id")
    .eq("id", spaceId)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!space) {
    return NextResponse.json({ error: "Space not found" }, { status: 404 });
  }

  const priceId = process.env.STRIPE_PRICE_ID_PRO;
  if (!priceId) {
    return NextResponse.json({ error: "Billing is not configured" }, { status: 500 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.headers.get("origin") ?? "";

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer_email: user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${siteUrl}/dashboard/${spaceId}?upgraded=1`,
    cancel_url: `${siteUrl}/dashboard/${spaceId}`,
    metadata: { spaceId },
    subscription_data: { metadata: { spaceId } },
  });

  return NextResponse.json({ url: session.url });
}
