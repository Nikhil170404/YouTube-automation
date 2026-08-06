import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-01-27.acacia" });

const PRICE_IDS: Record<string, string | undefined> = {
  starter:    process.env.STRIPE_PRICE_STARTER_MONTHLY,
  pro:        process.env.STRIPE_PRICE_PRO_MONTHLY,
  agency:     process.env.STRIPE_PRICE_AGENCY_MONTHLY,
};

export async function GET(req: NextRequest) {
  const plan = req.nextUrl.searchParams.get("plan") || "";
  const priceId = PRICE_IDS[plan];
  if (!priceId) return NextResponse.json({ error: "invalid plan" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url));

  const { data: profile } = await supabase.from("profiles").select("stripe_customer_id, email").eq("id", user.id).single();

  let customerId = profile?.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email || user.email || "",
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?upgraded=1`,
    cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
    metadata: { user_id: user.id, plan },
  });

  return NextResponse.redirect(session.url!);
}
