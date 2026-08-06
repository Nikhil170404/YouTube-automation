import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/server";
import type { PlanType } from "@/types/database";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

const PLAN_LIMITS: Record<string, { plan: string; limit: number }> = {
  [process.env.STRIPE_PRICE_STARTER_MONTHLY || ""]: { plan: "starter", limit: 300  },
  [process.env.STRIPE_PRICE_PRO_MONTHLY     || ""]: { plan: "pro",     limit: 1000 },
  [process.env.STRIPE_PRICE_AGENCY_MONTHLY  || ""]: { plan: "agency",  limit: 5000 },
};

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig  = req.headers.get("stripe-signature") || "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createServiceClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId  = session.metadata?.user_id;
    const plan    = session.metadata?.plan;
    if (!userId || !plan) return NextResponse.json({ ok: true });

    const limits: Record<string, number> = { starter: 300, pro: 1000, agency: 5000 };
    await supabase.from("profiles").update({
      plan: plan as PlanType,
      ai_replies_limit: limits[plan] ?? 30,
      stripe_customer_id: session.customer as string,
    }).eq("id", userId);
  }

  if (event.type === "customer.subscription.deleted") {
    const sub        = event.data.object as Stripe.Subscription;
    const customerId = sub.customer as string;
    await supabase.from("profiles").update({ plan: "free", ai_replies_limit: 30 }).eq("stripe_customer_id", customerId);
  }

  return NextResponse.json({ ok: true });
}
