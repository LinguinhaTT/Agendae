"use client";

import { CalendarDays, Pencil, Plus, Power, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { TeamMember } from "@/lib/data/team";
import {
  createMember,
  deleteMember,
  toggleMemberActive,
  updateMember,
} from "@/server/actions/team";

const ROLE_LABELS: Record<string, string> = {
  owner: "Proprietário",
  professional: "Profissional",
  staff: "Equipe",
};

interface FormState {
  display_name: string;
  bio: string;
  specialties: string;
  role: "professional" | "staff";
  is_visible_public: boolean;
}

const emptyForm: FormState = {
  display_name: "",
  bio: "",
  specialties: "",
  role: "professional",
  is_visible_public: true,
};

function memberToForm(m: TeamMember): FormState {
  return {
    display_name: m.display_name,
    bio: m.bio ?? "",
    specialties: m.specialties?.join(", ") ?? "",
    role: m.role === "owner" ? "professional" : m.role,
    is_visible_public: m.is_visible_public,
  };
}

interface Props {
  initialMembers: TeamMember[];
}

export function EquipeManager({ initialMembers }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<"idle" | "add" | { edit: TeamMember }>("idle");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const showForm = mode !== "idle";
  const isEdit = typeof mode === "object";

  function openAdd() {
    setForm(emptyForm);
    setError(null);
    setMode("add");
  }

  function openEdit(m: TeamMember) {
    setForm(memberToForm(m));
    setError(null);
    setMode({ edit: m });
  }

  function closeForm() {
    setMode("idle");
    setError(null);
  }

  function field(key: keyof Omit<FormState, "role" | "is_visible_public">) {
    return {
      value: form[key] as string,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value })),
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const specialties = form.specialties
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const input = {
      display_name: form.display_name.trim(),
      bio: form.bio.trim() || undefined,
      specialties: specialties.length > 0 ? specialties : undefined,
      role: form.role,
      is_visible_public: form.is_visible_public,
    };

    try {
      const result = isEdit
        ? await updateMember((mode as { edit: TeamMember }).edit.id, input)
        : await createMember(input);

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

  async function handleToggle(id: string, current: boolean) {
    setToggling(id);
    try {
      await toggleMemberActive(id, !current);
      router.refresh();
    } finally {
      setToggling(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover este membro da equipe?")) return;
    setDeleting(id);
    try {
      const result = await deleteMember(id);
      if (!result.ok) {
        alert(result.error);
        return;
      }
      router.refresh();
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black">Equipe</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {initialMembers.length} membro{initialMembers.length !== 1 ? "s" : ""}
          </p>
        </div>
        {!showForm && (
          <Button onClick={openAdd} size="sm">
            <Plus className="h-4 w-4" />
            Novo membro
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
            <h2 className="font-semibold">{isEdit ? "Editar membro" : "Novo membro"}</h2>
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
              <Label htmlFor="m-name">Nome *</Label>
              <Input
                id="m-name"
                required
                placeholder="Nome do profissional"
                {...field("display_name")}
              />
            </div>

            {!isEdit && (
              <div className="space-y-1.5">
                <Label htmlFor="m-role">Função</Label>
                <Select
                  id="m-role"
                  value={form.role}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      role: e.target.value as "professional" | "staff",
                    }))
                  }
                >
                  <option value="professional">Profissional</option>
                  <option value="staff">Equipe / Atendente</option>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="m-spec">Especialidades</Label>
              <Input
                id="m-spec"
                placeholder="Ex: Tatuagem, Piercing (separe por vírgula)"
                {...field("specialties")}
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="m-bio">Bio</Label>
              <Textarea id="m-bio" placeholder="Fale sobre o profissional..." {...field("bio")} />
            </div>

            <div className="flex items-center gap-3">
              <input
                id="m-visible"
                type="checkbox"
                checked={form.is_visible_public}
                onChange={(e) => setForm((f) => ({ ...f, is_visible_public: e.target.checked }))}
                className="h-4 w-4 rounded accent-primary"
              />
              <Label htmlFor="m-visible" className="cursor-pointer">
                Visível na página pública
              </Label>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" onClick={closeForm} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {isEdit ? "Salvar" : "Adicionar membro"}
            </Button>
          </div>
        </form>
      )}

      {/* Members list */}
      {initialMembers.length === 0 && !showForm ? (
        <div className="rounded-xl border border-white/5 bg-card p-12 text-center">
          <p className="text-muted-foreground text-sm mb-4">Nenhum membro cadastrado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {initialMembers.map((m) => (
            <div
              key={m.id}
              className={`rounded-xl border border-white/5 bg-card p-4 transition-colors ${
                m.is_active ? "hover:border-white/10" : "opacity-50"
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">
                    {m.display_name.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm">{m.display_name}</p>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-muted-foreground">
                      {ROLE_LABELS[m.role] ?? m.role}
                    </span>
                    {!m.is_active && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-muted-foreground">
                        Inativo
                      </span>
                    )}
                    {!m.is_visible_public && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-muted-foreground">
                        Oculto
                      </span>
                    )}
                  </div>
                  {m.specialties && m.specialties.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {m.specialties.join(", ")}
                    </p>
                  )}
                  {m.bio && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{m.bio}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <Link
                    href={`/admin/equipe/${m.id}`}
                    title="Gerenciar disponibilidade"
                    className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <CalendarDays className="h-4 w-4" />
                  </Link>
                  {m.role !== "owner" && (
                    <button
                      type="button"
                      title={m.is_active ? "Desativar" : "Ativar"}
                      disabled={toggling === m.id}
                      onClick={() => handleToggle(m.id, m.is_active)}
                      className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    >
                      <Power className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    title="Editar"
                    onClick={() => openEdit(m)}
                    className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  {m.role !== "owner" && (
                    <button
                      type="button"
                      title="Remover"
                      disabled={deleting === m.id}
                      onClick={() => handleDelete(m.id)}
                      className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
