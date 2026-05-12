"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateAppointmentStatus } from "@/server/actions/admin";

interface Props {
  id: string;
  status: string;
}

export function AppointmentActions({ id, status }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handle(newStatus: "confirmed" | "cancelled" | "completed" | "no_show") {
    setLoading(newStatus);
    try {
      await updateAppointmentStatus(id, newStatus);
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  if (status === "cancelled" || status === "completed" || status === "no_show") {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {status === "pending" && (
        <Button
          size="sm"
          loading={loading === "confirmed"}
          disabled={!!loading}
          onClick={() => handle("confirmed")}
        >
          Confirmar
        </Button>
      )}
      {(status === "pending" || status === "confirmed") && (
        <Button
          size="sm"
          variant="outline"
          loading={loading === "completed"}
          disabled={!!loading}
          onClick={() => handle("completed")}
        >
          Concluído
        </Button>
      )}
      <Button
        size="sm"
        variant="destructive"
        loading={loading === "cancelled"}
        disabled={!!loading}
        onClick={() => handle("cancelled")}
      >
        Cancelar
      </Button>
    </div>
  );
}
