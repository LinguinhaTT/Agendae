"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { AdminService } from "@/lib/data/admin";
import { formatDuration, formatPrice } from "@/lib/utils";
import { setProfessionalServices } from "@/server/actions/admin";

interface Props {
  professionalId: string;
  allServices: AdminService[];
  initialLinkedIds: string[];
}

export function ProfessionalServicesManager({
  professionalId,
  allServices,
  initialLinkedIds,
}: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set(initialLinkedIds));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const result = await setProfessionalServices(professionalId, Array.from(selected));
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSaved(true);
    router.refresh();
  }

  if (allServices.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum serviço cadastrado. Crie serviços em{" "}
        <a href="/admin/servicos" className="text-primary underline">
          Serviços
        </a>{" "}
        primeiro.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {allServices.map((svc) => {
        const isChecked = selected.has(svc.id);
        return (
          <label
            key={svc.id}
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              isChecked
                ? "border-primary/40 bg-primary/5"
                : "border-white/5 bg-card hover:border-white/10"
            }`}
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => toggle(svc.id)}
              className="h-4 w-4 rounded accent-primary shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{svc.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatDuration(svc.duration_minutes)} · {formatPrice(svc.price_cents)}
              </p>
            </div>
          </label>
        );
      })}

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <Button onClick={handleSave} loading={saving} size="sm">
          Salvar serviços
        </Button>
        {saved && <span className="text-sm text-green-400">Salvo!</span>}
      </div>
    </div>
  );
}
