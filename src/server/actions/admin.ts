"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { sendAppointmentEmail } from "@/lib/notifications/send";
import { createClient } from "@/lib/supabase/server";
import type { Result } from "@/types";

async function getAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: est } = await supabase
    .from("establishments")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!est) redirect("/cadastro/estabelecimento");

  return { supabase, establishmentId: est.id };
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/entrar");
}

// ─── Appointments ─────────────────────────────────────────────────────────────

export async function updateAppointmentStatus(
  appointmentId: string,
  status: "confirmed" | "cancelled" | "completed" | "no_show"
): Promise<Result<void, string>> {
  const { supabase, establishmentId } = await getAuth();

  const { error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", appointmentId)
    .eq("establishment_id", establishmentId);

  if (error) return { ok: false, error: error.message };

  if (status === "confirmed" || status === "cancelled") {
    void (async () => {
      try {
        const [apptResult, estResult] = await Promise.all([
          supabase
            .from("appointments")
            .select(
              "client_name, client_email, client_phone, service_name_snapshot, price_cents_snapshot, starts_at, ends_at, professional_id"
            )
            .eq("id", appointmentId)
            .maybeSingle(),
          supabase
            .from("establishments")
            .select("name, slug")
            .eq("id", establishmentId)
            .maybeSingle(),
        ]);

        if (!apptResult.data || !estResult.data) return;
        const appt = apptResult.data;
        const est = estResult.data;

        let professionalName: string | null = null;
        if (appt.professional_id) {
          const { data: prof } = await supabase
            .from("establishment_members")
            .select("display_name")
            .eq("id", appt.professional_id)
            .maybeSingle();
          professionalName = prof?.display_name ?? null;
        }

        await sendAppointmentEmail(appt.client_email, {
          type: status === "confirmed" ? "booking_confirmed" : "booking_cancelled",
          clientName: appt.client_name,
          clientEmail: appt.client_email,
          clientPhone: appt.client_phone ?? null,
          serviceName: appt.service_name_snapshot,
          professionalName,
          establishmentName: est.name,
          establishmentSlug: est.slug,
          startsAt: new Date(appt.starts_at),
          endsAt: new Date(appt.ends_at),
          priceCents: appt.price_cents_snapshot,
        });
      } catch (err) {
        console.error("[Email] Status notification error:", err);
      }
    })();
  }

  revalidatePath("/admin/agenda");
  revalidatePath("/admin");
  return { ok: true, data: undefined };
}

// ─── Services ─────────────────────────────────────────────────────────────────

const serviceSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  category: z.string().optional(),
  duration_minutes: z.number().int().positive("Duração inválida"),
  price_cents: z.number().int().nonnegative("Preço inválido"),
});

export async function createService(input: unknown): Promise<Result<void, string>> {
  const { supabase, establishmentId } = await getAuth();

  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Erro de validação" };

  const { error } = await supabase.from("services").insert({
    establishment_id: establishmentId,
    name: parsed.data.name,
    description: parsed.data.description ?? null,
    category: parsed.data.category ?? null,
    duration_minutes: parsed.data.duration_minutes,
    price_cents: parsed.data.price_cents,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/servicos");
  return { ok: true, data: undefined };
}

export async function updateService(
  serviceId: string,
  input: unknown
): Promise<Result<void, string>> {
  const { supabase, establishmentId } = await getAuth();

  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Erro de validação" };

  const { error } = await supabase
    .from("services")
    .update({
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      category: parsed.data.category ?? null,
      duration_minutes: parsed.data.duration_minutes,
      price_cents: parsed.data.price_cents,
    })
    .eq("id", serviceId)
    .eq("establishment_id", establishmentId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/servicos");
  return { ok: true, data: undefined };
}

export async function toggleService(serviceId: string, isActive: boolean): Promise<void> {
  const { supabase, establishmentId } = await getAuth();

  await supabase
    .from("services")
    .update({ is_active: isActive })
    .eq("id", serviceId)
    .eq("establishment_id", establishmentId);

  revalidatePath("/admin/servicos");
}

export async function deleteService(serviceId: string): Promise<Result<void, string>> {
  const { supabase, establishmentId } = await getAuth();

  const { error } = await supabase
    .from("services")
    .delete()
    .eq("id", serviceId)
    .eq("establishment_id", establishmentId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/servicos");
  return { ok: true, data: undefined };
}

// ─── Professional services ────────────────────────────────────────────────────

export async function setProfessionalServices(
  professionalId: string,
  serviceIds: string[]
): Promise<Result<void, string>> {
  const { supabase, establishmentId } = await getAuth();

  // Verify professional belongs to this establishment
  const { data: member } = await supabase
    .from("establishment_members")
    .select("id")
    .eq("id", professionalId)
    .eq("establishment_id", establishmentId)
    .maybeSingle();

  if (!member) return { ok: false, error: "Profissional não encontrado." };

  // Delete all current links and re-insert selected ones
  await supabase.from("professional_services").delete().eq("professional_id", professionalId);

  if (serviceIds.length > 0) {
    const { error } = await supabase
      .from("professional_services")
      .insert(serviceIds.map((sid) => ({ professional_id: professionalId, service_id: sid })));
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath(`/admin/equipe/${professionalId}`);
  return { ok: true, data: undefined };
}

// ─── Portfolio ────────────────────────────────────────────────────────────────

export async function addPortfolioItem(
  imageUrl: string,
  title?: string
): Promise<Result<{ id: string }, string>> {
  const { supabase, establishmentId } = await getAuth();

  const { data, error } = await supabase
    .from("portfolio_items")
    .insert({ establishment_id: establishmentId, image_url: imageUrl, title: title ?? null })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/portfolio");
  revalidatePath(`/e`);
  return { ok: true, data: { id: data.id } };
}

export async function deletePortfolioItem(itemId: string): Promise<void> {
  const { supabase, establishmentId } = await getAuth();

  await supabase
    .from("portfolio_items")
    .delete()
    .eq("id", itemId)
    .eq("establishment_id", establishmentId);

  revalidatePath("/admin/portfolio");
}

export async function toggleFeaturedPortfolio(itemId: string, isFeatured: boolean): Promise<void> {
  const { supabase, establishmentId } = await getAuth();

  await supabase
    .from("portfolio_items")
    .update({ is_featured: isFeatured })
    .eq("id", itemId)
    .eq("establishment_id", establishmentId);

  revalidatePath("/admin/portfolio");
}

// ─── Establishment logo/cover ──────────────────────────────────────────────────

export async function updateEstablishmentImages(
  logoUrl: string | null,
  coverUrl: string | null
): Promise<Result<void, string>> {
  const { supabase, establishmentId } = await getAuth();

  const { error } = await supabase
    .from("establishments")
    .update({ logo_url: logoUrl, cover_url: coverUrl })
    .eq("id", establishmentId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/configuracoes");
  return { ok: true, data: undefined };
}

// ─── Manual booking ───────────────────────────────────────────────────────────

export interface AdminProfessional {
  id: string;
  display_name: string;
}

export interface AdminServiceOption {
  id: string;
  name: string;
  duration_minutes: number;
  price_cents: number;
}

export async function getAdminProfessionals(): Promise<AdminProfessional[]> {
  const { supabase, establishmentId } = await getAuth();
  const { data } = await supabase
    .from("establishment_members")
    .select("id, display_name")
    .eq("establishment_id", establishmentId)
    .eq("is_active", true)
    .order("position");
  return (data ?? []) as AdminProfessional[];
}

export async function getServicesForProfessional(
  professionalId: string
): Promise<AdminServiceOption[]> {
  const { supabase, establishmentId } = await getAuth();

  const { data: linked } = await supabase
    .from("professional_services")
    .select("service_id")
    .eq("professional_id", professionalId);

  let q = supabase
    .from("services")
    .select("id, name, duration_minutes, price_cents")
    .eq("establishment_id", establishmentId)
    .eq("is_active", true)
    .order("name");

  if (linked && linked.length > 0) {
    q = q.in(
      "id",
      linked.map((r) => r.service_id)
    );
  }

  const { data } = await q;
  return (data ?? []) as AdminServiceOption[];
}

const manualBookingSchema = z.object({
  professionalId: z.string().uuid(),
  serviceId: z.string().uuid(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  serviceNameSnapshot: z.string(),
  priceCentsSnapshot: z.number().int().nonnegative(),
  durationMinutesSnapshot: z.number().int().positive(),
  clientName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  clientPhone: z.string().min(8, "Telefone inválido"),
  clientEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  clientNotes: z.string().max(500).optional(),
});

export async function createManualAppointment(input: unknown): Promise<Result<void, string>> {
  const { supabase, establishmentId } = await getAuth();

  const parsed = manualBookingSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };

  const d = parsed.data;

  const { error } = await supabase.from("appointments").insert({
    establishment_id: establishmentId,
    professional_id: d.professionalId,
    service_id: d.serviceId,
    client_name: d.clientName,
    client_phone: d.clientPhone,
    client_email: d.clientEmail ?? "",
    client_notes: d.clientNotes ?? null,
    starts_at: d.startsAt,
    ends_at: d.endsAt,
    service_name_snapshot: d.serviceNameSnapshot,
    price_cents_snapshot: d.priceCentsSnapshot,
    duration_minutes_snapshot: d.durationMinutesSnapshot,
    status: "confirmed",
    source: "manual",
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/agenda");
  revalidatePath("/admin");
  return { ok: true, data: undefined };
}

// ─── Establishment settings ───────────────────────────────────────────────────

const settingsSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  description: z.string().max(500).optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  instagram: z.string().optional(),
  website: z.string().optional(),
  auto_confirm: z.boolean(),
  buffer_minutes: z.number().int().nonnegative(),
  booking_advance_min_hours: z.number().int().nonnegative(),
  booking_advance_max_days: z.number().int().positive(),
});

export async function updateEstablishment(input: unknown): Promise<Result<void, string>> {
  const { supabase, establishmentId } = await getAuth();

  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Erro de validação" };

  const { website, ...rest } = parsed.data;

  const { error } = await supabase
    .from("establishments")
    .update({ ...rest, website: website || null })
    .eq("id", establishmentId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/configuracoes");
  return { ok: true, data: undefined };
}
