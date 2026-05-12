import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in2h = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const window = 5 * 60 * 1000; // 5 min window

  // 24h reminders
  const { data: remind24 } = await supabase
    .from("appointments")
    .select("*, establishment:establishments(name, whatsapp), professional:establishment_members(display_name)")
    .eq("status", "confirmed")
    .eq("reminded_24h", false)
    .gte("starts_at", new Date(in24h.getTime() - window).toISOString())
    .lte("starts_at", new Date(in24h.getTime() + window).toISOString());

  for (const appt of remind24 ?? []) {
    await enqueueReminder(supabase, appt, "24h");
    await supabase
      .from("appointments")
      .update({ reminded_24h: true })
      .eq("id", appt.id);
  }

  // 2h reminders
  const { data: remind2 } = await supabase
    .from("appointments")
    .select("*, establishment:establishments(name, whatsapp), professional:establishment_members(display_name)")
    .eq("status", "confirmed")
    .eq("reminded_2h", false)
    .gte("starts_at", new Date(in2h.getTime() - window).toISOString())
    .lte("starts_at", new Date(in2h.getTime() + window).toISOString());

  for (const appt of remind2 ?? []) {
    await enqueueReminder(supabase, appt, "2h");
    await supabase
      .from("appointments")
      .update({ reminded_2h: true })
      .eq("id", appt.id);
  }

  // Review requests (2h after completed appointments)
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const { data: completed } = await supabase
    .from("appointments")
    .select("*")
    .eq("status", "completed")
    .gte("ends_at", new Date(twoHoursAgo.getTime() - window).toISOString())
    .lte("ends_at", new Date(twoHoursAgo.getTime() + window).toISOString());

  for (const appt of completed ?? []) {
    // Check no review exists yet
    const { data: review } = await supabase
      .from("reviews")
      .select("id")
      .eq("appointment_id", appt.id)
      .single();

    if (!review) {
      await supabase.from("notification_queue").upsert({
        appointment_id: appt.id,
        channel: "email",
        type: "review_request",
        payload: {
          to: appt.client_email,
          subject: "Como foi seu atendimento? Deixe uma avaliação 🌟",
          template: "review_request",
          data: { appointment_id: appt.id, client_name: appt.client_name },
        },
        scheduled_for: new Date().toISOString(),
      }, { onConflict: "appointment_id,channel,type", ignoreDuplicates: true });
    }
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
});

async function enqueueReminder(
  supabase: ReturnType<typeof createClient>,
  appt: Record<string, unknown>,
  timing: "24h" | "2h"
) {
  const channels = ["email", "whatsapp"] as const;
  const inserts = channels.map((channel) => ({
    appointment_id: appt.id as string,
    channel,
    type: `reminder_${timing}`,
    payload: {
      to: appt.client_phone,
      client_name: appt.client_name,
      service: appt.service_name_snapshot,
      starts_at: appt.starts_at,
      template: `reminder_${timing}`,
    },
    scheduled_for: new Date().toISOString(),
  }));

  await supabase
    .from("notification_queue")
    .upsert(inserts, { onConflict: "appointment_id,channel,type", ignoreDuplicates: true });
}
