"use client";

import { CheckCircle2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WEEKDAYS } from "@/lib/constants";
import type { AvailabilityRule, TimeOff } from "@/lib/data/team";
import { createTimeOff, deleteTimeOff, saveAvailabilityRules } from "@/server/actions/team";

const DEFAULT_START = "09:00";
const DEFAULT_END = "18:00";

interface DayRule {
  weekday: number;
  is_active: boolean;
  start_time: string;
  end_time: string;
}

function buildInitialRules(existingRules: AvailabilityRule[]): DayRule[] {
  return WEEKDAYS.map(({ value }) => {
    const existing = existingRules.find((r) => r.weekday === value);
    if (existing) {
      return {
        weekday: value,
        is_active: existing.is_active,
        start_time: existing.start_time.slice(0, 5),
        end_time: existing.end_time.slice(0, 5),
      };
    }
    return { weekday: value, is_active: false, start_time: DEFAULT_START, end_time: DEFAULT_END };
  });
}

interface Props {
  memberId: string;
  memberName: string;
  initialRules: AvailabilityRule[];
  initialTimeOffs: TimeOff[];
}

export function AvailabilityManager({
  memberId,
  memberName,
  initialRules,
  initialTimeOffs,
}: Props) {
  const router = useRouter();

  // ── Schedule state ──────────────────────────────────────────────────────────
  const [rules, setRules] = useState<DayRule[]>(() => buildInitialRules(initialRules));
  const [savingRules, setSavingRules] = useState(false);
  const [rulesError, setRulesError] = useState<string | null>(null);
  const [rulesSaved, setRulesSaved] = useState(false);

  function toggleDay(weekday: number) {
    setRules((rs) =>
      rs.map((r) => (r.weekday === weekday ? { ...r, is_active: !r.is_active } : r))
    );
  }

  function setTime(weekday: number, field: "start_time" | "end_time", value: string) {
    setRules((rs) => rs.map((r) => (r.weekday === weekday ? { ...r, [field]: value } : r)));
  }

  async function handleSaveRules(e: React.FormEvent) {
    e.preventDefault();
    setRulesError(null);
    setRulesSaved(false);
    setSavingRules(true);
    try {
      const result = await saveAvailabilityRules(memberId, rules);
      if (!result.ok) {
        setRulesError(result.error);
        return;
      }
      setRulesSaved(true);
      router.refresh();
      setTimeout(() => setRulesSaved(false), 3000);
    } finally {
      setSavingRules(false);
    }
  }

  // ── Time off state ──────────────────────────────────────────────────────────
  const [showTimeOffForm, setShowTimeOffForm] = useState(false);
  const [timeOffForm, setTimeOffForm] = useState({ start: "", end: "", reason: "" });
  const [savingTimeOff, setSavingTimeOff] = useState(false);
  const [timeOffError, setTimeOffError] = useState<string | null>(null);
  const [deletingTimeOff, setDeletingTimeOff] = useState<string | null>(null);

  async function handleCreateTimeOff(e: React.FormEvent) {
    e.preventDefault();
    setTimeOffError(null);

    if (!timeOffForm.start || !timeOffForm.end) {
      setTimeOffError("Selecione as datas de início e fim.");
      return;
    }
    if (timeOffForm.start > timeOffForm.end) {
      setTimeOffError("A data de início deve ser anterior à data de fim.");
      return;
    }

    setSavingTimeOff(true);
    try {
      const result = await createTimeOff(memberId, {
        starts_at: `${timeOffForm.start}T00:00:00`,
        ends_at: `${timeOffForm.end}T23:59:59`,
        reason: timeOffForm.reason || undefined,
      });
      if (!result.ok) {
        setTimeOffError(result.error);
        return;
      }
      setTimeOffForm({ start: "", end: "", reason: "" });
      setShowTimeOffForm(false);
      router.refresh();
    } finally {
      setSavingTimeOff(false);
    }
  }

  async function handleDeleteTimeOff(id: string) {
    if (!confirm("Remover esta folga?")) return;
    setDeletingTimeOff(id);
    try {
      await deleteTimeOff(id, memberId);
      router.refresh();
    } finally {
      setDeletingTimeOff(null);
    }
  }

  return (
    <div className="space-y-10">
      {/* ── Weekly schedule ─────────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Horários de atendimento</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          Defina os dias e horários que <strong>{memberName}</strong> está disponível para
          atendimentos.
        </p>

        <form onSubmit={handleSaveRules}>
          <div className="space-y-2 mb-5">
            {WEEKDAYS.map(({ value, label, short }) => {
              const rule = rules.find((r) => r.weekday === value)!;
              return (
                <div
                  key={value}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                    rule.is_active ? "border-primary/20 bg-primary/5" : "border-white/5 bg-card"
                  }`}
                >
                  {/* Toggle */}
                  <button
                    type="button"
                    onClick={() => toggleDay(value)}
                    className={`w-10 h-5 rounded-full transition-colors shrink-0 relative ${
                      rule.is_active ? "bg-primary" : "bg-white/10"
                    }`}
                    aria-label={`${rule.is_active ? "Desativar" : "Ativar"} ${label}`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                        rule.is_active ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>

                  {/* Day name */}
                  <span
                    className={`w-24 text-sm font-medium shrink-0 ${
                      rule.is_active ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    <span className="hidden sm:inline">{label}</span>
                    <span className="sm:hidden">{short}</span>
                  </span>

                  {/* Time range */}
                  {rule.is_active ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="time"
                        value={rule.start_time}
                        onChange={(e) => setTime(value, "start_time", e.target.value)}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                      />
                      <span className="text-muted-foreground text-sm">até</span>
                      <input
                        type="time"
                        value={rule.end_time}
                        onChange={(e) => setTime(value, "end_time", e.target.value)}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                      />
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Indisponível</span>
                  )}
                </div>
              );
            })}
          </div>

          {rulesError && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2 mb-4">
              {rulesError}
            </p>
          )}

          {rulesSaved && (
            <div className="flex items-center gap-2 text-sm text-green-400 bg-green-500/10 rounded-lg px-3 py-2 mb-4">
              <CheckCircle2 className="h-4 w-4" />
              Horários salvos com sucesso.
            </div>
          )}

          <Button type="submit" loading={savingRules}>
            Salvar horários
          </Button>
        </form>
      </section>

      {/* ── Time off ────────────────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Folgas e férias</h2>
          {!showTimeOffForm && (
            <Button size="sm" variant="outline" onClick={() => setShowTimeOffForm(true)}>
              Adicionar folga
            </Button>
          )}
        </div>

        {showTimeOffForm && (
          <form
            onSubmit={handleCreateTimeOff}
            className="rounded-xl border border-primary/20 bg-primary/5 p-4 mb-4 space-y-4"
          >
            <h3 className="font-medium text-sm">Nova folga / férias</h3>

            {timeOffError && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                {timeOffError}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="to-start">Data de início *</Label>
                <input
                  id="to-start"
                  type="date"
                  required
                  value={timeOffForm.start}
                  onChange={(e) => setTimeOffForm((f) => ({ ...f, start: e.target.value }))}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="to-end">Data de fim *</Label>
                <input
                  id="to-end"
                  type="date"
                  required
                  value={timeOffForm.end}
                  onChange={(e) => setTimeOffForm((f) => ({ ...f, end: e.target.value }))}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="to-reason">Motivo (opcional)</Label>
              <Input
                id="to-reason"
                placeholder="Ex: Férias, evento, viagem..."
                value={timeOffForm.reason}
                onChange={(e) => setTimeOffForm((f) => ({ ...f, reason: e.target.value }))}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowTimeOffForm(false);
                  setTimeOffError(null);
                }}
                disabled={savingTimeOff}
              >
                Cancelar
              </Button>
              <Button type="submit" loading={savingTimeOff}>
                Salvar folga
              </Button>
            </div>
          </form>
        )}

        {initialTimeOffs.length === 0 ? (
          <div className="rounded-xl border border-white/5 bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">Nenhuma folga programada.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {initialTimeOffs.map((to) => {
              const start = new Date(to.starts_at);
              const end = new Date(to.ends_at);
              const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
              return (
                <div
                  key={to.id}
                  className="flex items-center gap-4 p-3 rounded-xl border border-white/5 bg-card"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {start.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                      {" → "}
                      {end.toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                      <span className="text-muted-foreground text-xs ml-2">
                        ({days} dia{days !== 1 ? "s" : ""})
                      </span>
                    </p>
                    {to.reason && (
                      <p className="text-xs text-muted-foreground mt-0.5">{to.reason}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={deletingTimeOff === to.id}
                    onClick={() => handleDeleteTimeOff(to.id)}
                    className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50 shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
