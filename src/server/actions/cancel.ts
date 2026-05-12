"use server";

import { verifyCancelToken } from "@/lib/booking/cancel-token";
import { sendAppointmentEmail } from "@/lib/notifications/send";
import { createClient } from "@/lib/supabase/server";
import type { Result } from "@/types";

export async function cancelByClient(token: string): Promise<Result<void, string>> {
  const parsed = verifyCancelToken(token);
  if (!parsed) return { ok: false, error: "Link inválido." };

  const supabase = await createClient();

  const { data: appt } = await supabase
    .from("appointments")
    .select(
      "id, status, starts_at, ends_at, establishment_id, client_name, client_email, service_name_snapshot, price_cents_snapshot, professional_id"
    )
    .eq("id", parsed.appointmentId)
    .eq("client_email", parsed.clientEmail)
    .maybeSingle();

  if (!appt) return { ok: false, error: "Agendamento não encontrado." };
  if (appt.status === "cancelled")
    return { ok: false, error: "Este agendamento já foi cancelado." };
  if (appt.status === "completed" || appt.status === "no_show")
    return { ok: false, error: "Este agendamento já foi concluído." };
  if (new Date(appt.starts_at) < new Date())
    return { ok: false, error: "Não é possível cancelar agendamentos já realizados." };

  const { error } = await supabase
    .from("appointments")
    .update({ status: "cancelled", cancelled_by: "client" })
    .eq("id", appt.id);

  if (error) return { ok: false, error: "Erro ao cancelar. Tente novamente." };

  void (async () => {
    try {
      const [estResult, profResult] = await Promise.all([
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

      if (!estResult.data) return;

      await sendAppointmentEmail(appt.client_email, {
        type: "booking_cancelled",
        clientName: appt.client_name,
        clientEmail: appt.client_email,
        serviceName: appt.service_name_snapshot,
        professionalName: profResult.data?.display_name ?? null,
        establishmentName: estResult.data.name,
        establishmentSlug: estResult.data.slug,
        startsAt: new Date(appt.starts_at),
        endsAt: new Date(appt.ends_at),
        priceCents: appt.price_cents_snapshot,
      });
    } catch (err) {
      console.error("[Email] Cancel notification error:", err);
    }
  })();

  return { ok: true, data: undefined };
}
