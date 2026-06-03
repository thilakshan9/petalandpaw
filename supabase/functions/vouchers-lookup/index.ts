import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  try {
    const url = new URL(req.url);
    const code = (url.searchParams.get("code") || "").trim().toUpperCase();
    if (!code) {
      return new Response(
        JSON.stringify({ error: "Voucher code required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let { data: voucher } = await supabase
      .from("vouchers")
      .select("*")
      .eq("code", code)
      .maybeSingle();

    if (!voucher) {
      return new Response(
        JSON.stringify({ error: "Voucher not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // If still pending, try to verify the Stripe session in case the success page hasn't run yet
    if (voucher.status === "pending" && voucher.stripe_session_id) {
      const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
      if (stripeKey) {
        try {
          const stripe = new Stripe(stripeKey, { apiVersion: "2024-10-28.acacia" });
          const session = await stripe.checkout.sessions.retrieve(voucher.stripe_session_id);
          if (session.payment_status === "paid") {
            const { data: updated } = await supabase
              .from("vouchers")
              .update({ status: "active" })
              .eq("id", voucher.id)
              .select()
              .maybeSingle();
            if (updated) voucher = updated;
          }
        } catch {
          // ignore
        }
      }
    }

    if (voucher.status === "pending") {
      return new Response(
        JSON.stringify({ error: "Voucher is not yet active" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (voucher.status === "redeemed" || Number(voucher.balance) <= 0) {
      return new Response(
        JSON.stringify({ error: "Voucher has already been redeemed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (voucher.status === "expired") {
      return new Response(
        JSON.stringify({ error: "Voucher has expired" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        code: voucher.code,
        balance: Number(voucher.balance),
        initial_amount: Number(voucher.initial_amount),
        status: voucher.status,
        recipient_name: voucher.recipient_name,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message || "Lookup failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
