import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const seg = (n: number) =>
    Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `PAW-${seg(4)}-${seg(4)}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      return new Response(
        JSON.stringify({ error: "Stripe is not configured. Please add STRIPE_SECRET_KEY." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json();
    const amount = Number(body.amount);
    const purchaserName = (body.purchaser_name || "").toString().trim();
    const purchaserEmail = (body.purchaser_email || "").toString().trim();
    const recipientName = (body.recipient_name || "").toString().trim();
    const recipientEmail = (body.recipient_email || "").toString().trim();
    const message = (body.message || "").toString().slice(0, 500);
    const originUrl = (body.origin_url || "").toString();

    if (!Number.isFinite(amount) || amount < 5 || amount > 250) {
      return new Response(
        JSON.stringify({ error: "Voucher amount must be between £5 and £250." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!purchaserEmail.includes("@")) {
      return new Response(
        JSON.stringify({ error: "A valid email is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    let code = generateCode();
    for (let i = 0; i < 5; i++) {
      const { data: existing } = await supabase
        .from("vouchers")
        .select("id")
        .eq("code", code)
        .maybeSingle();
      if (!existing) break;
      code = generateCode();
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2024-10-28.acacia" });
    const successUrl = `${originUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&voucher_purchase=1`;
    const cancelUrl = `${originUrl}/vouchers`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "gbp",
            unit_amount: Math.round(amount * 100),
            product_data: {
              name: `Petal & Paw Gift Voucher (£${amount.toFixed(2)})`,
              description: recipientName ? `Gift voucher for ${recipientName}` : "Gift voucher",
            },
          },
          quantity: 1,
        },
      ],
      customer_email: purchaserEmail,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        type: "voucher_purchase",
        code,
        amount: amount.toFixed(2),
        purchaser_name: purchaserName,
        recipient_name: recipientName,
        recipient_email: recipientEmail,
      },
      payment_intent_data: {
        receipt_email: purchaserEmail,
        metadata: { type: "voucher_purchase", code },
      },
    });

    const { error: insertErr } = await supabase.from("vouchers").insert({
      code,
      initial_amount: amount,
      balance: amount,
      purchaser_name: purchaserName,
      purchaser_email: purchaserEmail,
      recipient_name: recipientName,
      recipient_email: recipientEmail,
      message,
      status: "pending",
      stripe_session_id: session.id,
    });

    if (insertErr) {
      return new Response(
        JSON.stringify({ error: insertErr.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ url: session.url, session_id: session.id, code }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message || "Voucher purchase failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
