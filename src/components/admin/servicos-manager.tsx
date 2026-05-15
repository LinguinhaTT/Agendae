"use client";

import { Pencil, Plus, Power, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { AdminService } from "@/lib/data/admin";
import { formatDuration, formatPrice } from "@/lib/utils";
import { createService, deleteService, toggleService, updateService } from "@/server/actions/admin";

const DURATIONS = [15, 30, 45, 60, 75, 90, 120, 150, 180, 240, 300];

interface ServiceSuggestion {
  name: string;
  category: string;
  duration_minutes: number;
  price_cents: number;
}

const SERVICE_SUGGESTIONS: Record<string, ServiceSuggestion[]> = {
  tattoo: [
    { name: "Tatuagem P&B Pequena", category: "Tatuagem", duration_minutes: 120, price_cents: 0 },
    { name: "Tatuagem Colorida", category: "Tatuagem", duration_minutes: 240, price_cents: 0 },
    { name: "Flash Tattoo", category: "Tatuagem", duration_minutes: 60, price_cents: 15000 },
    { name: "Retoque", category: "Tatuagem", duration_minutes: 60, price_cents: 0 },
    { name: "Cover-up", category: "Tatuagem", duration_minutes: 240, price_cents: 0 },
    { name: "Piercing", category: "Piercing", duration_minutes: 30, price_cents: 8000 },
    {
      name: "Micropigmentação",
      category: "Micropigmentação",
      duration_minutes: 120,
      price_cents: 0,
    },
  ],
  barber: [
    { name: "Corte Social", category: "Corte", duration_minutes: 30, price_cents: 4000 },
    { name: "Corte + Barba", category: "Combo", duration_minutes: 60, price_cents: 6000 },
    { name: "Barba", category: "Barba", duration_minutes: 30, price_cents: 3500 },
    { name: "Pigmentação Capilar", category: "Coloração", duration_minutes: 60, price_cents: 8000 },
    { name: "Hidratação Capilar", category: "Tratamento", duration_minutes: 30, price_cents: 5000 },
    {
      name: "Sobrancelha Masculina",
      category: "Estética",
      duration_minutes: 15,
      price_cents: 2500,
    },
  ],
  salon: [
    { name: "Corte Feminino", category: "Corte", duration_minutes: 60, price_cents: 8000 },
    { name: "Escova", category: "Escova", duration_minutes: 60, price_cents: 6000 },
    { name: "Progressiva", category: "Química", duration_minutes: 120, price_cents: 20000 },
    { name: "Coloração", category: "Química", duration_minutes: 120, price_cents: 15000 },
    { name: "Mechas / Luzes", category: "Química", duration_minutes: 150, price_cents: 18000 },
    { name: "Hidratação Capilar", category: "Tratamento", duration_minutes: 60, price_cents: 8000 },
  ],
  nail: [
    { name: "Manicure", category: "Manicure", duration_minutes: 60, price_cents: 4000 },
    { name: "Pedicure", category: "Pedicure", duration_minutes: 60, price_cents: 5000 },
    { name: "Manicure + Pedicure", category: "Combo", duration_minutes: 90, price_cents: 8000 },
    { name: "Esmaltação em Gel", category: "Gel", duration_minutes: 90, price_cents: 8000 },
    {
      name: "Alongamento de Unhas",
      category: "Alongamento",
      duration_minutes: 120,
      price_cents: 15000,
    },
    { name: "Nail Art", category: "Decoração", duration_minutes: 30, price_cents: 3000 },
  ],
  eyebrow: [
    { name: "Design de Sobrancelha", category: "Design", duration_minutes: 30, price_cents: 4000 },
    { name: "Henna de Sobrancelha", category: "Henna", duration_minutes: 45, price_cents: 6000 },
    {
      name: "Laminação de Sobrancelha",
      category: "Tratamento",
      duration_minutes: 60,
      price_cents: 12000,
    },
    { name: "Extensão de Cílios", category: "Cílios", duration_minutes: 90, price_cents: 15000 },
    { name: "Remoção a Cera", category: "Depilação", duration_minutes: 15, price_cents: 3000 },
  ],
  aesthetics: [
    { name: "Limpeza de Pele", category: "Pele", duration_minutes: 60, price_cents: 10000 },
    { name: "Peeling Químico", category: "Pele", duration_minutes: 45, price_cents: 12000 },
    { name: "Microagulhamento", category: "Pele", duration_minutes: 60, price_cents: 20000 },
    {
      name: "Depilação a Cera (pernas)",
      category: "Depilação",
      duration_minutes: 60,
      price_cents: 8000,
    },
    {
      name: "Depilação a Cera (axilas)",
      category: "Depilação",
      duration_minutes: 30,
      price_cents: 4000,
    },
    { name: "Radiofrequência", category: "Tratamento", duration_minutes: 60, price_cents: 15000 },
  ],
  massage: [
    { name: "Massagem Relaxante", category: "Massagem", duration_minutes: 60, price_cents: 12000 },
    {
      name: "Massagem Terapêutica",
      category: "Massagem",
      duration_minutes: 60,
      price_cents: 13000,
    },
    { name: "Drenagem Linfática", category: "Massagem", duration_minutes: 60, price_cents: 12000 },
    { name: "Pedras Quentes", category: "Massagem", duration_minutes: 75, price_cents: 16000 },
    { name: "Reflexologia", category: "Massagem", duration_minutes: 45, price_cents: 9000 },
  ],
  podology: [
    { name: "Podologia Completa", category: "Podologia", duration_minutes: 60, price_cents: 8000 },
    { name: "Tratamento de Calos", category: "Podologia", duration_minutes: 45, price_cents: 6000 },
    { name: "Onicomicose", category: "Podologia", duration_minutes: 45, price_cents: 7000 },
  ],
  psychology: [
    {
      name: "Consulta Psicológica",
      category: "Consulta",
      duration_minutes: 50,
      price_cents: 15000,
    },
    {
      name: "Avaliação Psicológica",
      category: "Avaliação",
      duration_minutes: 60,
      price_cents: 18000,
    },
    { name: "Terapia Infantil", category: "Infantil", duration_minutes: 45, price_cents: 15000 },
  ],
  nutrition: [
    {
      name: "Consulta Nutricional",
      category: "Consulta",
      duration_minutes: 60,
      price_cents: 15000,
    },
    { name: "Retorno Nutricional", category: "Retorno", duration_minutes: 30, price_cents: 8000 },
    { name: "Avaliação Corporal", category: "Avaliação", duration_minutes: 45, price_cents: 12000 },
  ],
  vet: [
    { name: "Banho", category: "Banho & Tosa", duration_minutes: 60, price_cents: 4000 },
    { name: "Tosa", category: "Banho & Tosa", duration_minutes: 60, price_cents: 5000 },
    { name: "Banho + Tosa", category: "Banho & Tosa", duration_minutes: 90, price_cents: 8000 },
    {
      name: "Hidratação de Pelagem",
      category: "Tratamento",
      duration_minutes: 30,
      price_cents: 3000,
    },
  ],
  carwash: [
    { name: "Lavagem Simples", category: "Lavagem", duration_minutes: 30, price_cents: 4000 },
    { name: "Lavagem Completa", category: "Lavagem", duration_minutes: 60, price_cents: 7000 },
    { name: "Polimento", category: "Polimento", duration_minutes: 120, price_cents: 20000 },
    { name: "Higienização Interna", category: "Limpeza", duration_minutes: 90, price_cents: 15000 },
  ],
};

interface FormState {
  name: string;
  category: string;
  description: string;
  duration_minutes: string;
  price_brl: string;
  price_on_quote: boolean;
}

const emptyForm: FormState = {
  name: "",
  category: "",
  description: "",
  duration_minutes: "60",
  price_brl: "",
  price_on_quote: false,
};

function serviceToForm(s: AdminService): FormState {
  return {
    name: s.name,
    category: s.category ?? "",
    description: s.description ?? "",
    duration_minutes: String(s.duration_minutes),
    price_brl: s.price_cents === 0 ? "" : (s.price_cents / 100).toFixed(2),
    price_on_quote: s.price_cents === 0,
  };
}

interface Props {
  initialServices: AdminService[];
  establishmentCategory?: string | null;
}

export function ServicosManager({ initialServices, establishmentCategory }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<"idle" | "add" | { edit: AdminService }>("idle");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  function openAdd() {
    setForm(emptyForm);
    setError(null);
    setMode("add");
  }

  function openEdit(svc: AdminService) {
    setForm(serviceToForm(svc));
    setError(null);
    setMode({ edit: svc });
  }

  function closeForm() {
    setMode("idle");
    setError(null);
  }

  function field(key: keyof Omit<FormState, "price_on_quote">) {
    return {
      value: form[key],
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
      ) => setForm((f) => ({ ...f, [key]: e.target.value })),
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const input = {
      name: form.name.trim(),
      category: form.category.trim() || undefined,
      description: form.description.trim() || undefined,
      duration_minutes: Number(form.duration_minutes),
      price_cents: form.price_on_quote
        ? 0
        : Math.round(Number(form.price_brl.replace(",", ".")) * 100),
    };

    try {
      const result =
        typeof mode === "object"
          ? await updateService(mode.edit.id, input)
          : await createService(input);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.refresh();
      closeForm();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este serviço?")) return;
    setDeleting(id);
    try {
      await deleteService(id);
      router.refresh();
    } finally {
      setDeleting(null);
    }
  }

  async function handleToggle(id: string, current: boolean) {
    setToggling(id);
    try {
      await toggleService(id, !current);
      router.refresh();
    } finally {
      setToggling(null);
    }
  }

  function applySuggestion(s: ServiceSuggestion) {
    setForm({
      name: s.name,
      category: s.category,
      description: "",
      duration_minutes: String(s.duration_minutes),
      price_brl: s.price_cents === 0 ? "" : (s.price_cents / 100).toFixed(2),
      price_on_quote: s.price_cents === 0,
    });
    setError(null);
    setMode("add");
  }

  const suggestions = establishmentCategory
    ? (SERVICE_SUGGESTIONS[establishmentCategory] ?? [])
    : [];

  const showForm = mode !== "idle";
  const isEdit = typeof mode === "object";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black">Serviços</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {initialServices.length} serviço{initialServices.length !== 1 ? "s" : ""}
          </p>
        </div>
        {!showForm && (
          <Button onClick={openAdd} size="sm">
            <Plus className="h-4 w-4" />
            Novo serviço
          </Button>
        )}
      </div>

      {/* Add / Edit form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-primary/20 bg-primary/5 p-5 mb-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{isEdit ? "Editar serviço" : "Novo serviço"}</h2>
            <button
              type="button"
              onClick={closeForm}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="svc-name">Nome *</Label>
              <Input id="svc-name" required placeholder="Ex: Tatuagem P&B" {...field("name")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="svc-category">Categoria</Label>
              <Input
                id="svc-category"
                placeholder="Ex: Tatuagem, Corte, Manicure"
                {...field("category")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="svc-duration">Duração *</Label>
              <Select id="svc-duration" required {...field("duration_minutes")}>
                {DURATIONS.map((d) => (
                  <option key={d} value={d}>
                    {formatDuration(d)}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="svc-price">Preço (R$)</Label>
              <div className="flex items-center gap-2 mb-1.5">
                <input
                  id="svc-quote"
                  type="checkbox"
                  checked={form.price_on_quote}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price_on_quote: e.target.checked, price_brl: "" }))
                  }
                  className="h-4 w-4 rounded accent-primary"
                />
                <label htmlFor="svc-quote" className="text-sm cursor-pointer text-muted-foreground">
                  Preço a combinar (orçamento)
                </label>
              </div>
              {!form.price_on_quote && (
                <Input
                  id="svc-price"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  placeholder="0,00"
                  {...field("price_brl")}
                />
              )}
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="svc-desc">Descrição</Label>
              <Textarea
                id="svc-desc"
                placeholder="Descreva o serviço..."
                {...field("description")}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" onClick={closeForm} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {isEdit ? "Salvar alterações" : "Criar serviço"}
            </Button>
          </div>
        </form>
      )}

      {/* Suggestions */}
      {!showForm && suggestions.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Sugestões para adicionar
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions
              .filter((s) => !initialServices.some((svc) => svc.name === s.name))
              .map((s) => (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => applySuggestion(s)}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-white/10 hover:border-primary/40 hover:bg-primary/5 hover:text-primary text-muted-foreground transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  {s.name}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Services list */}
      {initialServices.length === 0 && !showForm ? (
        <div className="rounded-xl border border-white/5 bg-card p-12 text-center">
          <p className="text-muted-foreground text-sm mb-4">Nenhum serviço cadastrado ainda.</p>
          <Button onClick={openAdd} size="sm">
            <Plus className="h-4 w-4" />
            Criar primeiro serviço
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {initialServices.map((svc) => (
            <div
              key={svc.id}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                svc.is_active
                  ? "border-white/5 bg-card hover:border-white/10"
                  : "border-white/5 bg-card opacity-50"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm truncate">{svc.name}</p>
                  {!svc.is_active && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-muted-foreground">
                      Inativo
                    </span>
                  )}
                </div>
                {svc.category && <p className="text-xs text-muted-foreground">{svc.category}</p>}
                {svc.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{svc.description}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDuration(svc.duration_minutes)}
                </p>
              </div>

              <div className="shrink-0 text-right mr-2">
                <p className="font-bold text-sm text-primary">{formatPrice(svc.price_cents)}</p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  title={svc.is_active ? "Desativar" : "Ativar"}
                  disabled={toggling === svc.id}
                  onClick={() => handleToggle(svc.id, svc.is_active)}
                  className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                >
                  <Power className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title="Editar"
                  onClick={() => openEdit(svc)}
                  className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title="Excluir"
                  disabled={deleting === svc.id}
                  onClick={() => handleDelete(svc.id)}
                  className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
