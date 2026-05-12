"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
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
