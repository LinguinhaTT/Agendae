import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const now = new Date();

  // Fetch pending notifications due for processing
  const { data: queue, error } = await supabase
    .from("notification_queue")
    .select("*")
    .lte("scheduled_for", now.toISOString())
    .is("processed_at", null)
    .limit(50);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const results = await Promise.allSettled(
    (queue ?? []).map(async (item) => {
      try {
        // Process based on channel
        switch (item.channel) {
          case "email":
            await sendEmail(item.payload);
            break;
          case "whatsapp":
            await sendWhatsApp(item.payload);
            break;
          case "sms":
            await sendSms(item.payload);
            break;
          case "push":
            await sendPush(item.payload, supabase);
            break;
        }

        await supabase
          .from("notification_queue")
          .update({ processed_at: new Date().toISOString() })
          .eq("id", item.id);
      } catch (err) {
        await supabase
          .from("notification_queue")
          .update({ error: String(err) })
          .eq("id", item.id);
        throw err;
      }
    })
  );

  const processed = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return new Response(JSON.stringify({ processed, failed }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});

async function sendEmail(payload: Record<string, unknown>) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) throw new Error("RESEND_API_KEY not set");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`Resend error: ${await res.text()}`);
}

async function sendWhatsApp(payload: Record<string, unknown>) {
  const apiUrl = Deno.env.get("EVOLUTION_API_URL");
  const apiKey = Deno.env.get("EVOLUTION_API_KEY");
  if (!apiUrl || !apiKey) throw new Error("Evolution API not configured");

  const res = await fetch(`${apiUrl}/message/sendText/inkbook`, {
    method: "POST",
    headers: { apikey: apiKey, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`Evolution API error: ${await res.text()}`);
}

async function sendSms(payload: Record<string, unknown>) {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER");
  if (!accountSid || !authToken || !fromNumber) throw new Error("Twilio not configured");

  const body = new URLSearchParams({
    To: String(payload.to),
    From: fromNumber,
    Body: String(payload.body),
  });

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    }
  );

  if (!res.ok) throw new Error(`Twilio error: ${await res.text()}`);
}

async function sendPush(payload: Record<string, unknown>, supabase: ReturnType<typeof createClient>) {
  const userId = payload.user_id as string;
  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("*")
    .eq("user_id", userId);

  if (!subs?.length) return;

  const vapidPublicKey = Deno.env.get("NEXT_PUBLIC_VAPID_PUBLIC_KEY");
  const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
  const vapidSubject = Deno.env.get("VAPID_SUBJECT") ?? "mailto:contato@inkbook.app";

  if (!vapidPublicKey || !vapidPrivateKey) throw new Error("VAPID keys not configured");

  // Send to all subscriptions of this user
  await Promise.all(
    subs.map(async (sub) => {
      const res = await fetch(sub.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // In production use web-push library for proper VAPID signing
        },
        body: JSON.stringify({
          title: payload.title,
          body: payload.body,
          data: payload.data,
        }),
      });

      if (res.status === 410) {
        // Subscription expired — remove it
        await supabase.from("push_subscriptions").delete().eq("id", sub.id);
      }
    })
  );
}
