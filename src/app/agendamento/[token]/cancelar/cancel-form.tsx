"use client";

import Link from "next/link";
import { useState } from "react";
import { cancelByClient } from "@/server/actions/cancel";

interface Props {
  token: string;
  establishmentSlug?: string | null;
}

export function CancelForm({ token, establishmentSlug }: Props) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    setLoading(true);
    setError(null);
    try {
      const result = await cancelByClient(token);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          Agendamento cancelado com sucesso. Você receberá uma confirmação por e-mail.
        </p>
        {establishmentSlug && (
          <Link
            href={`/e/${establishmentSlug}`}
            className="inline-block text-sm text-primary hover:underline"
          >
            Fazer novo agendamento →
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
      )}
      <button
        type="button"
        disabled={loading}
        onClick={handleCancel}
        className="w-full rounded-lg bg-destructive text-white py-2.5 text-sm font-semibold hover:bg-destructive/90 transition-colors disabled:opacity-50"
      >
        {loading ? "Cancelando..." : "Confirmar cancelamento"}
      </button>
      {establishmentSlug && (
        <Link
          href={`/e/${establishmentSlug}`}
          className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Voltar ao estabelecimento
        </Link>
      )}
    </div>
  );
}
