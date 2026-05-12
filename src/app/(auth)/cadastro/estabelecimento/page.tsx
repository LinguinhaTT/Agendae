"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, CheckCircle2, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ESTABLISHMENT_CATEGORIES } from "@/lib/constants";
import { createEstablishment } from "@/server/actions/establishment";

const step1Schema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  category: z.string().min(1, "Selecione uma categoria"),
  phone: z.string().min(10, "Telefone inválido").max(20),
  description: z.string().max(500).optional(),
});

const step2Schema = z.object({
  address_street: z.string().min(3, "Endereço obrigatório"),
  address_number: z.string().min(1, "Número obrigatório"),
  address_complement: z.string().max(100).optional(),
  address_neighborhood: z.string().min(2, "Bairro obrigatório"),
  address_city: z.string().min(2, "Cidade obrigatória"),
  address_state: z.string().length(2, "UF deve ter 2 letras"),
  address_zip: z.string().min(8, "CEP inválido").max(9),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type AllData = Step1Data & Step2Data;

const STEPS = [
  { id: 1, label: "Negócio", icon: Building2 },
  { id: 2, label: "Endereço", icon: MapPin },
  { id: 3, label: "Pronto!", icon: CheckCircle2 },
];

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
  }
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
}

function formatZip(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 8)
    .replace(/(\d{5})(\d{0,3})/, "$1-$2")
    .replace(/-$/, "");
}

export default function CadastroEstabelecimentoPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [serverError, setServerError] = useState<string | null>(null);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);

  const form1 = useForm<Step1Data>({ resolver: zodResolver(step1Schema) });
  const form2 = useForm<Step2Data>({ resolver: zodResolver(step2Schema) });

  async function handleStep1(data: Step1Data) {
    setStep1Data(data);
    setStep(2);
  }

  async function handleStep2(data: Step2Data) {
    if (!step1Data) return;
    setServerError(null);

    const allData: AllData = { ...step1Data, ...data };
    const result = await createEstablishment(allData);

    if (!result.ok) {
      setServerError(result.error.message);
      return;
    }

    setCreatedSlug(result.data.slug);
    setStep(3);
  }

  return (
    <div className="w-full max-w-lg space-y-6">
      {/* Stepper */}
      <div className="flex items-center justify-center gap-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = s.id === step;
          const isDone = s.id < step;
          return (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isDone
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {s.label}
              </div>
              {i < STEPS.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </div>
          );
        })}
      </div>

      {/* Step 1: Business Info */}
      {step === 1 && (
        <Card className="glass-card border-white/10">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Seu negócio</CardTitle>
            <CardDescription>Conte-nos sobre seu estabelecimento</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form1.handleSubmit(handleStep1)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do estabelecimento *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Studio Ink Tattoo"
                  error={!!form1.formState.errors.name}
                  {...form1.register("name")}
                />
                {form1.formState.errors.name && (
                  <p className="text-xs text-destructive">{form1.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <select
                  id="category"
                  className={`w-full h-9 rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring ${
                    form1.formState.errors.category ? "border-destructive" : "border-input"
                  }`}
                  {...form1.register("category")}
                >
                  <option value="">Selecione uma categoria</option>
                  {ESTABLISHMENT_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                {form1.formState.errors.category && (
                  <p className="text-xs text-destructive">
                    {form1.formState.errors.category.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone / WhatsApp *</Label>
                <Input
                  id="phone"
                  placeholder="(11) 99999-9999"
                  error={!!form1.formState.errors.phone}
                  {...form1.register("phone", {
                    onChange: (e) => {
                      e.target.value = formatPhone(e.target.value);
                    },
                  })}
                />
                {form1.formState.errors.phone && (
                  <p className="text-xs text-destructive">{form1.formState.errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <textarea
                  id="description"
                  placeholder="Fale um pouco sobre seu trabalho..."
                  rows={3}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                  {...form1.register("description")}
                />
              </div>

              <Button type="submit" className="w-full" size="lg">
                Próximo
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Address */}
      {step === 2 && (
        <Card className="glass-card border-white/10">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Endereço</CardTitle>
            <CardDescription>Onde seu estabelecimento está localizado?</CardDescription>
          </CardHeader>
          <CardContent>
            {serverError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={form2.handleSubmit(handleStep2)} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="address_street">Rua / Avenida *</Label>
                  <Input
                    id="address_street"
                    placeholder="Rua das Flores"
                    error={!!form2.formState.errors.address_street}
                    {...form2.register("address_street")}
                  />
                  {form2.formState.errors.address_street && (
                    <p className="text-xs text-destructive">
                      {form2.formState.errors.address_street.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address_number">Número *</Label>
                  <Input
                    id="address_number"
                    placeholder="123"
                    error={!!form2.formState.errors.address_number}
                    {...form2.register("address_number")}
                  />
                  {form2.formState.errors.address_number && (
                    <p className="text-xs text-destructive">
                      {form2.formState.errors.address_number.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address_complement">Complemento (opcional)</Label>
                <Input
                  id="address_complement"
                  placeholder="Sala 2, Bloco B"
                  {...form2.register("address_complement")}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="address_neighborhood">Bairro *</Label>
                  <Input
                    id="address_neighborhood"
                    placeholder="Centro"
                    error={!!form2.formState.errors.address_neighborhood}
                    {...form2.register("address_neighborhood")}
                  />
                  {form2.formState.errors.address_neighborhood && (
                    <p className="text-xs text-destructive">
                      {form2.formState.errors.address_neighborhood.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address_zip">CEP *</Label>
                  <Input
                    id="address_zip"
                    placeholder="00000-000"
                    error={!!form2.formState.errors.address_zip}
                    {...form2.register("address_zip", {
                      onChange: (e) => {
                        e.target.value = formatZip(e.target.value);
                      },
                    })}
                  />
                  {form2.formState.errors.address_zip && (
                    <p className="text-xs text-destructive">
                      {form2.formState.errors.address_zip.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="address_city">Cidade *</Label>
                  <Input
                    id="address_city"
                    placeholder="São Paulo"
                    error={!!form2.formState.errors.address_city}
                    {...form2.register("address_city")}
                  />
                  {form2.formState.errors.address_city && (
                    <p className="text-xs text-destructive">
                      {form2.formState.errors.address_city.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address_state">UF *</Label>
                  <Input
                    id="address_state"
                    placeholder="SP"
                    maxLength={2}
                    error={!!form2.formState.errors.address_state}
                    {...form2.register("address_state", {
                      onChange: (e) => {
                        e.target.value = e.target.value.toUpperCase();
                      },
                    })}
                  />
                  {form2.formState.errors.address_state && (
                    <p className="text-xs text-destructive">
                      {form2.formState.errors.address_state.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(1)}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  size="lg"
                  loading={form2.formState.isSubmitting}
                >
                  Criar estabelecimento
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Success */}
      {step === 3 && (
        <Card className="glass-card border-white/10 text-center">
          <CardContent className="pt-8 pb-6 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto" />
            <div className="space-y-1">
              <h2 className="text-xl font-bold">Estabelecimento criado!</h2>
              <p className="text-muted-foreground text-sm">
                Tudo pronto. Vamos configurar seu painel agora.
              </p>
            </div>
            {createdSlug && (
              <div className="bg-muted/40 rounded-lg px-4 py-2 text-sm">
                <span className="text-muted-foreground">Seu link: </span>
                <span className="font-mono font-medium text-primary">
                  Agendaê.app/e/{createdSlug}
                </span>
              </div>
            )}
            <Button
              className="w-full"
              size="lg"
              onClick={() => router.push(`/admin?onboarding=complete`)}
            >
              Ir para o painel
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
