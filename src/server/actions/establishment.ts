"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import type { Result } from "@/types";

const onboardingSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  category: z.string().min(1, "Selecione uma categoria"),
  phone: z.string().min(10, "Telefone inválido").max(20),
  description: z.string().max(500).optional(),
  address_street: z.string().min(3, "Endereço obrigatório"),
  address_number: z.string().min(1, "Número obrigatório"),
  address_complement: z.string().max(100).optional(),
  address_neighborhood: z.string().min(2, "Bairro obrigatório"),
  address_city: z.string().min(2, "Cidade obrigatória"),
  address_state: z.string().length(2, "UF deve ter 2 letras"),
  address_zip: z.string().min(8, "CEP inválido").max(9),
});

type OnboardingError =
  | { type: "AUTH_ERROR"; message: string }
  | { type: "VALIDATION_ERROR"; message: string }
  | { type: "DB_ERROR"; message: string };

export async function createEstablishment(
  input: unknown
): Promise<Result<{ slug: string }, OnboardingError>> {
  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: {
        type: "VALIDATION_ERROR",
        message: parsed.error.issues[0]?.message ?? "Dados inválidos",
      },
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      error: { type: "AUTH_ERROR", message: "Você precisa estar autenticado" },
    };
  }

  // Ensure profile exists (may not if trigger failed on signup). Use admin client to bypass RLS.
  const displayName =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "Proprietário";

  const admin = createAdminClient();
  await admin
    .from("profiles")
    .upsert(
      { id: user.id, full_name: displayName, email: user.email ?? "" },
      { onConflict: "id", ignoreDuplicates: true }
    );

  const baseSlug = slugify(parsed.data.name);
  let slug = baseSlug;
  let attempt = 0;

  while (attempt < 10) {
    const { data: existing } = await supabase
      .from("establishments")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!existing) break;
    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }

  const { data: establishment, error: estError } = await supabase
    .from("establishments")
    .insert({
      name: parsed.data.name,
      slug,
      category: parsed.data.category,
      phone: parsed.data.phone,
      description: parsed.data.description ?? null,
      address_street: parsed.data.address_street,
      address_number: parsed.data.address_number,
      address_complement: parsed.data.address_complement ?? null,
      address_neighborhood: parsed.data.address_neighborhood,
      address_city: parsed.data.address_city,
      address_state: parsed.data.address_state.toUpperCase(),
      address_zip: parsed.data.address_zip.replace(/\D/g, ""),
      owner_id: user.id,
    })
    .select("id, slug")
    .single();

  if (estError || !establishment) {
    return {
      ok: false,
      error: {
        type: "DB_ERROR",
        message: estError?.message ?? "Erro ao criar estabelecimento. Tente novamente.",
      },
    };
  }

  const { error: memberError } = await supabase.from("establishment_members").insert({
    establishment_id: establishment.id,
    user_id: user.id,
    role: "owner",
    display_name: displayName,
  });

  if (memberError) {
    return {
      ok: false,
      error: { type: "DB_ERROR", message: memberError.message },
    };
  }

  return { ok: true, data: { slug: establishment.slug } };
}

export async function completeOnboarding(slug: string) {
  redirect(`/admin?onboarding=complete&slug=${slug}`);
}
