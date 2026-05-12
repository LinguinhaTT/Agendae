"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { Result } from "@/types";

const signInSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

const signUpSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
});

const resetPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

type AuthError =
  | { type: "AUTH_ERROR"; message: string }
  | { type: "VALIDATION_ERROR"; message: string };

export async function signIn(input: unknown): Promise<Result<{ redirectTo: string }, AuthError>> {
  const parsed = signInSchema.safeParse(input);
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
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    const message =
      error.message === "Invalid login credentials"
        ? "Email ou senha incorretos"
        : "Erro ao fazer login. Tente novamente.";
    return { ok: false, error: { type: "AUTH_ERROR", message } };
  }

  revalidatePath("/", "layout");
  return { ok: true, data: { redirectTo: "/admin" } };
}

export async function signUp(input: unknown): Promise<Result<{ message: string }, AuthError>> {
  const parsed = signUpSchema.safeParse(input);
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
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.name },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    const message = error.message.includes("already registered")
      ? "Este email já está cadastrado"
      : "Erro ao criar conta. Tente novamente.";
    return { ok: false, error: { type: "AUTH_ERROR", message } };
  }

  return {
    ok: true,
    data: { message: "Conta criada! Verifique seu email para confirmar o cadastro." },
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/entrar");
}

export async function resetPassword(
  input: unknown
): Promise<Result<{ message: string }, AuthError>> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: { type: "VALIDATION_ERROR", message: "Email inválido" },
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/conta/perfil`,
  });

  if (error) {
    return {
      ok: false,
      error: { type: "AUTH_ERROR", message: "Erro ao enviar email. Tente novamente." },
    };
  }

  return {
    ok: true,
    data: { message: "Email de recuperação enviado! Verifique sua caixa de entrada." },
  };
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      queryParams: { access_type: "offline", prompt: "consent" },
    },
  });

  if (error || !data.url) {
    redirect("/entrar?error=oauth");
  }

  redirect(data.url);
}
