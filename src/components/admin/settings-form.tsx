"use client";

import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { AdminEstablishment } from "@/lib/data/admin";
import { updateEstablishment } from "@/server/actions/admin";

interface Props {
  establishment: AdminEstablishment;
}

export function SettingsForm({ establishment: est }: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    name: est.name,
    description: est.description ?? "",
    phone: est.phone ?? "",
    whatsapp: est.whatsapp ?? "",
    instagram: est.instagram ?? "",
    website: est.website ?? "",
    auto_confirm: est.auto_confirm,
    buffer_minutes: est.buffer_minutes,
    booking_advance_min_hours: est.booking_advance_min_hours,
    booking_advance_max_days: est.booking_advance_max_days,
  });

  function text(key: keyof typeof form) {
    return {
      value: form[key] as string,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value })),
    };
  }

  function num(key: keyof typeof form) {
    return {
      value: String(form[key]),
      onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
        setForm((f) => ({ ...f, [key]: Number(e.target.value) })),
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSaving(true);

    try {
      const result = await updateEstablishment(form);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-3">{error}</p>
      )}

      {saved && (
        <div className="flex items-center gap-2 text-sm text-green-400 bg-green-500/10 rounded-lg px-4 py-3">
          <CheckCircle2 className="h-4 w-4" />
          Configurações salvas com sucesso.
        </div>
      )}

      {/* Business info */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Informações do negócio
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="cfg-name">Nome *</Label>
            <Input id="cfg-name" required {...text("name")} />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="cfg-desc">Descrição</Label>
            <Textarea
              id="cfg-desc"
              placeholder="Conte sobre seu negócio..."
              {...text("description")}
            />
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Contato
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="cfg-phone">Telefone</Label>
            <Input id="cfg-phone" type="tel" placeholder="(11) 99999-9999" {...text("phone")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cfg-wa">WhatsApp</Label>
            <Input id="cfg-wa" type="tel" placeholder="(11) 99999-9999" {...text("whatsapp")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cfg-ig">Instagram</Label>
            <Input id="cfg-ig" placeholder="@seuinstagram" {...text("instagram")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cfg-web">Site</Label>
            <Input id="cfg-web" type="url" placeholder="https://..." {...text("website")} />
          </div>
        </div>
      </section>

      {/* Booking settings */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Configurações de agendamento
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Auto-confirm toggle */}
          <div className="md:col-span-2 flex items-center gap-3 p-4 rounded-lg border border-white/5 bg-card">
            <input
              id="cfg-auto"
              type="checkbox"
              checked={form.auto_confirm}
              onChange={(e) => setForm((f) => ({ ...f, auto_confirm: e.target.checked }))}
              className="h-4 w-4 rounded accent-primary"
            />
            <div>
              <Label htmlFor="cfg-auto" className="cursor-pointer">
                Confirmar agendamentos automaticamente
              </Label>
              <p className="text-xs text-muted-foreground">
                Quando ativo, novos agendamentos são confirmados sem necessidade de aprovação
                manual.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cfg-buffer">Intervalo entre atendimentos</Label>
            <Select id="cfg-buffer" {...num("buffer_minutes")}>
              {[0, 5, 10, 15, 20, 30, 45, 60].map((m) => (
                <option key={m} value={m}>
                  {m === 0 ? "Sem intervalo" : `${m} min`}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cfg-minh">Antecedência mínima para agendar</Label>
            <Select id="cfg-minh" {...num("booking_advance_min_hours")}>
              {[0, 1, 2, 3, 6, 12, 24, 48].map((h) => (
                <option key={h} value={h}>
                  {h === 0 ? "Sem antecedência" : h === 1 ? "1 hora" : `${h} horas`}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cfg-maxd">Limite de agendamento futuro</Label>
            <Select id="cfg-maxd" {...num("booking_advance_max_days")}>
              {[7, 14, 30, 60, 90, 120].map((d) => (
                <option key={d} value={d}>
                  {d} dias
                </option>
              ))}
            </Select>
          </div>
        </div>
      </section>

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={saving}>
          Salvar configurações
        </Button>
      </div>
    </form>
  );
}
