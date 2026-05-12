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
import { formatCurrency, formatDuration } from "@/lib/utils";
import { createService, deleteService, toggleService, updateService } from "@/server/actions/admin";

const DURATIONS = [15, 30, 45, 60, 75, 90, 120, 150, 180, 240, 300];

interface FormState {
  name: string;
  category: string;
  description: string;
  duration_minutes: string;
  price_brl: string;
}

const emptyForm: FormState = {
  name: "",
  category: "",
  description: "",
  duration_minutes: "60",
  price_brl: "",
};

function serviceToForm(s: AdminService): FormState {
  return {
    name: s.name,
    category: s.category ?? "",
    description: s.description ?? "",
    duration_minutes: String(s.duration_minutes),
    price_brl: (s.price_cents / 100).toFixed(2),
  };
}

interface Props {
  initialServices: AdminService[];
}

export function ServicosManager({ initialServices }: Props) {
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

  function field(key: keyof FormState) {
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
      price_cents: Math.round(Number(form.price_brl.replace(",", ".")) * 100),
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
              <Label htmlFor="svc-price">Preço (R$) *</Label>
              <Input
                id="svc-price"
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="0,00"
                {...field("price_brl")}
              />
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
                <p className="font-bold text-sm text-primary">{formatCurrency(svc.price_cents)}</p>
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
