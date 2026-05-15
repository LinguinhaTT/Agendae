import { NextResponse } from "next/server";
import { generateCancelToken } from "@/lib/booking/cancel-token";
import { sendAppointmentEmail } from "@/lib/notifications/send";
import {
  buildClientReminderMessage,
  buildProfessionalReminderMessage,
  sendWhatsAppText,
} from "@/lib/notifications/whatsapp";
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
  const in1h = new Date(now.getTime() + 1 * 60 * 60 * 1000);
  const in2h = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  const apptFields =
    "id, client_name, client_email, client_phone, service_name_snapshot, price_cents_snapshot, starts_at, ends_at, professional_id, establishment_id";

  const [{ data: remind24 }, { data: remind1h }] = await Promise.all([
    supabase
      .from("appointments")
      .select(apptFields)
      .in("status", ["confirmed", "pending"])
      .eq("reminded_24h", false)
      .gte("starts_at", in24h.toISOString())
      .lte("starts_at", in25h.toISOString()),

    supabase
      .from("appointments")
      .select(apptFields)
      .in("status", ["confirmed", "pending"])
      .eq("reminded_2h", false)
      .gte("starts_at", in1h.toISOString())
      .lte("starts_at", in2h.toISOString()),
  ]);

  let sent = 0;

  async function sendReminder(appt: NonNullable<typeof remind24>[number], window: "24h" | "1h") {
    const [estRes, profRes] = await Promise.all([
      supabase
        .from("establishments")
        .select("name, slug")
        .eq("id", appt.establishment_id)
        .maybeSingle(),
      appt.professional_id
        ? supabase
            .from("establishment_members")
            .select("display_name, whatsapp")
            .eq("id", appt.professional_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    if (!estRes.data) return;

    const cancelToken = generateCancelToken(appt.id, appt.client_email);
    const cancelUrl = `${APP_URL}/agendamento/${cancelToken}/cancelar`;
    const professionalName = profRes.data?.display_name ?? null;
    const professionalWhatsapp = profRes.data?.whatsapp ?? null;

    const reminderParams = {
      establishmentName: estRes.data.name,
      clientName: appt.client_name,
      clientPhone: appt.client_phone ?? "",
      serviceName: appt.service_name_snapshot,
      professionalName,
      startsAt: new Date(appt.starts_at),
      window,
    };

    await Promise.allSettled([
      // E-mail para o cliente
      sendAppointmentEmail(appt.client_email, {
        type: "booking_confirmed",
        clientName: appt.client_name,
        clientEmail: appt.client_email,
        clientPhone: appt.client_phone,
        serviceName: appt.service_name_snapshot,
        professionalName,
        establishmentName: estRes.data.name,
        establishmentSlug: estRes.data.slug,
        startsAt: new Date(appt.starts_at),
        endsAt: new Date(appt.ends_at),
        priceCents: appt.price_cents_snapshot,
        cancelUrl,
      }),

      // WhatsApp para o cliente
      appt.client_phone
        ? sendWhatsAppText(appt.client_phone, buildClientReminderMessage(reminderParams))
        : Promise.resolve(),

      // WhatsApp para o profissional
      professionalWhatsapp
        ? sendWhatsAppText(professionalWhatsapp, buildProfessionalReminderMessage(reminderParams))
        : Promise.resolve(),
    ]);

    // Marca como lembrado
    await supabase
      .from("appointments")
      .update(window === "24h" ? { reminded_24h: true } : { reminded_2h: true })
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

  for (const appt of remind1h ?? []) {
    try {
      await sendReminder(appt, "1h");
    } catch (e) {
      console.error("[Reminder 1h]", e);
    }
  }

  return NextResponse.json({ ok: true, sent });
}
