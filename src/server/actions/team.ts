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
  return { supabase, userId: user.id, establishmentId: est.id };
}

// ─── Team members ─────────────────────────────────────────────────────────────

const memberSchema = z.object({
  display_name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  bio: z.string().max(500).optional(),
  specialties: z.array(z.string()).optional(),
  role: z.enum(["professional", "staff"]),
  is_visible_public: z.boolean(),
});

export async function createMember(input: unknown): Promise<Result<{ id: string }, string>> {
  const { supabase, establishmentId } = await getAuth();

  const parsed = memberSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Erro de validação" };

  const { data, error } = await supabase
    .from("establishment_members")
    .insert({
      establishment_id: establishmentId,
      user_id: crypto.randomUUID(),
      role: parsed.data.role,
      display_name: parsed.data.display_name,
      bio: parsed.data.bio ?? null,
      specialties: parsed.data.specialties?.filter(Boolean) ?? null,
      is_visible_public: parsed.data.is_visible_public,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23503")
      return {
        ok: false,
        error:
          "Para adicionar um profissional, peça que ele se cadastre no Agendaê e use o e-mail para vinculá-lo.",
      };
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/equipe");
  return { ok: true, data: { id: data.id } };
}

const updateMemberSchema = z.object({
  display_name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  bio: z.string().max(500).optional(),
  specialties: z.array(z.string()).optional(),
  is_visible_public: z.boolean(),
});

export async function updateMember(id: string, input: unknown): Promise<Result<void, string>> {
  const { supabase, establishmentId } = await getAuth();

  const parsed = updateMemberSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Erro de validação" };

  const { error } = await supabase
    .from("establishment_members")
    .update({
      display_name: parsed.data.display_name,
      bio: parsed.data.bio ?? null,
      specialties: parsed.data.specialties?.filter(Boolean) ?? null,
      is_visible_public: parsed.data.is_visible_public,
    })
    .eq("id", id)
    .eq("establishment_id", establishmentId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/equipe");
  return { ok: true, data: undefined };
}

export async function toggleMemberActive(id: string, isActive: boolean): Promise<void> {
  const { supabase, establishmentId } = await getAuth();
  await supabase
    .from("establishment_members")
    .update({ is_active: isActive })
    .eq("id", id)
    .eq("establishment_id", establishmentId);
  revalidatePath("/admin/equipe");
}

export async function deleteMember(id: string): Promise<Result<void, string>> {
  const { supabase, establishmentId } = await getAuth();

  const { data: member } = await supabase
    .from("establishment_members")
    .select("role")
    .eq("id", id)
    .eq("establishment_id", establishmentId)
    .maybeSingle();

  if (member?.role === "owner")
    return { ok: false, error: "Não é possível remover o proprietário." };

  const { error } = await supabase
    .from("establishment_members")
    .delete()
    .eq("id", id)
    .eq("establishment_id", establishmentId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/equipe");
  return { ok: true, data: undefined };
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

export async function updateMemberAvatar(
  memberId: string,
  avatarUrl: string | null
): Promise<Result<void, string>> {
  const { supabase, establishmentId } = await getAuth();

  const { error } = await supabase
    .from("establishment_members")
    .update({ avatar_url: avatarUrl })
    .eq("id", memberId)
    .eq("establishment_id", establishmentId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/equipe");
  return { ok: true, data: undefined };
}

// ─── Availability rules ───────────────────────────────────────────────────────

const ruleItemSchema = z.object({
  weekday: z.number().int().min(0).max(6),
  start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  is_active: z.boolean(),
});

export async function saveAvailabilityRules(
  professionalId: string,
  rules: unknown[]
): Promise<Result<void, string>> {
  const { supabase, establishmentId } = await getAuth();

  const { data: member } = await supabase
    .from("establishment_members")
    .select("id")
    .eq("id", professionalId)
    .eq("establishment_id", establishmentId)
    .maybeSingle();

  if (!member) return { ok: false, error: "Membro não encontrado." };

  const parsed = z.array(ruleItemSchema).safeParse(rules);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Erro de validação" };

  const normalize = (t: string) => (t.length === 5 ? `${t}:00` : t);

  // Replace all rules: delete then insert active ones
  await supabase.from("availability_rules").delete().eq("professional_id", professionalId);

  const activeRules = parsed.data
    .filter((r) => r.is_active)
    .map((r) => ({
      professional_id: professionalId,
      weekday: r.weekday,
      start_time: normalize(r.start_time),
      end_time: normalize(r.end_time),
      is_active: true,
    }));

  if (activeRules.length > 0) {
    const { error } = await supabase.from("availability_rules").insert(activeRules);
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath(`/admin/equipe/${professionalId}`);
  return { ok: true, data: undefined };
}

// ─── Time off ─────────────────────────────────────────────────────────────────

export async function createTimeOff(
  professionalId: string,
  input: { starts_at: string; ends_at: string; reason?: string }
): Promise<Result<void, string>> {
  const { supabase, establishmentId } = await getAuth();

  const { data: member } = await supabase
    .from("establishment_members")
    .select("id")
    .eq("id", professionalId)
    .eq("establishment_id", establishmentId)
    .maybeSingle();

  if (!member) return { ok: false, error: "Membro não encontrado." };

  const { error } = await supabase.from("time_off").insert({
    professional_id: professionalId,
    starts_at: input.starts_at,
    ends_at: input.ends_at,
    reason: input.reason || null,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/equipe/${professionalId}`);
  return { ok: true, data: undefined };
}

export async function deleteTimeOff(id: string, professionalId: string): Promise<void> {
  const { supabase, establishmentId } = await getAuth();

  const { data: member } = await supabase
    .from("establishment_members")
    .select("id")
    .eq("id", professionalId)
    .eq("establishment_id", establishmentId)
    .maybeSingle();

  if (!member) return;

  await supabase.from("time_off").delete().eq("id", id).eq("professional_id", professionalId);

  revalidatePath(`/admin/equipe/${professionalId}`);
}
