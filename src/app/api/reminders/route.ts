import { NextResponse } from "next/server";
import { generateCancelToken } from "@/lib/booking/cancel-token";
import { sendAppointmentEmail } from "@/lib/notifications/send";
import { createAdminClient } from "@/lib/supabase/admin";

// Called by an external cron (e.g. cron-job.org) every hour
// Requires header: x-cron-secret matching CRON_SECRET env var
export async function POST(request: Request) {
  const secret = request.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://agendae.app";

  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000);
  const in2h = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const in3h = new Date(now.getTime() + 3 * 60 * 60 * 1000);

  // Find appointments needing 24h reminder
  const { data: remind24 } = await supabase
    .from("appointments")
    .select(
      "id, client_name, client_email, client_phone, service_name_snapshot, price_cents_snapshot, starts_at, ends_at, professional_id, establishment_id"
    )
    .in("status", ["confirmed", "pending"])
    .eq("reminded_24h", false)
    .gte("starts_at", in24h.toISOString())
    .lte("starts_at", in25h.toISOString());

  // Find appointments needing 2h reminder
  const { data: remind2 } = await supabase
    .from("appointments")
    .select(
      "id, client_name, client_email, client_phone, service_name_snapshot, price_cents_snapshot, starts_at, ends_at, professional_id, establishment_id"
    )
    .in("status", ["confirmed", "pending"])
    .eq("reminded_2h", false)
    .gte("starts_at", in2h.toISOString())
    .lte("starts_at", in3h.toISOString());

  let sent = 0;

  async function sendReminder(appt: NonNullable<typeof remind24>[number], type: "24h" | "2h") {
    const [estRes, profRes] = await Promise.all([
      supabase
        .from("establishments")
        .select("name, slug")
        .eq("id", appt.establishment_id)
        .maybeSingle(),
      appt.professional_id
        ? supabase
            .from("establishment_members")
            .select("display_name")
            .eq("id", appt.professional_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    if (!estRes.data) return;

    const cancelToken = generateCancelToken(appt.id, appt.client_email);
    const cancelUrl = `${APP_URL}/agendamento/${cancelToken}/cancelar`;

    await sendAppointmentEmail(appt.client_email, {
      type: "booking_confirmed",
      clientName: appt.client_name,
      clientEmail: appt.client_email,
      clientPhone: appt.client_phone,
      serviceName: appt.service_name_snapshot,
      professionalName: profRes.data?.display_name ?? null,
      establishmentName: estRes.data.name,
      establishmentSlug: estRes.data.slug,
      startsAt: new Date(appt.starts_at),
      endsAt: new Date(appt.ends_at),
      priceCents: appt.price_cents_snapshot,
      cancelUrl,
    });

    // Mark as reminded
    await supabase
      .from("appointments")
      .update(type === "24h" ? { reminded_24h: true } : { reminded_2h: true })
      .eq("id", appt.id);

    sent++;
  }

  for (const appt of remind24 ?? []) {
    try {
      await sendReminder(appt, "24h");
    } catch (e) {
      console.error("[Reminder 24h]", e);
    }
  }

  for (const appt of remind2 ?? []) {
    try {
      await sendReminder(appt, "2h");
    } catch (e) {
      console.error("[Reminder 2h]", e);
    }
  }

  return NextResponse.json({ ok: true, sent });
}
