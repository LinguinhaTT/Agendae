"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CalendarPlus, Check, ChevronLeft, Loader2, X } from "lucide-react";
import { useState, useTransition } from "react";
import { formatPrice } from "@/lib/utils";
import {
  type AdminProfessional,
  type AdminServiceOption,
  createManualAppointment,
  getAdminProfessionals,
  getServicesForProfessional,
} from "@/server/actions/admin";

interface Props {
  establishmentId: string;
  bufferMinutes: number;
}

type Step = "professional" | "service" | "datetime" | "client";

const STEPS: Step[] = ["professional", "service", "datetime", "client"];

const STEP_LABELS: Record<Step, string> = {
  professional: "Profissional",
  service: "Serviço",
  datetime: "Data e Horário",
  client: "Cliente",
};

export function ManualBookingModal({ bufferMinutes: _bufferMinutes }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("professional");
  const [isPending, startTransition] = useTransition();

  const [professionals, setProfessionals] = useState<AdminProfessional[]>([]);
  const [services, setServices] = useState<AdminServiceOption[]>([]);

  const [selectedPro, setSelectedPro] = useState<AdminProfessional | null>(null);
  const [selectedService, setSelectedService] = useState<AdminServiceOption | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientNotes, setClientNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function openModal() {
    setOpen(true);
    setStep("professional");
    setSelectedPro(null);
    setSelectedService(null);
    setSelectedDate("");
    setSelectedTime("");
    setClientName("");
    setClientPhone("");
    setClientEmail("");
    setClientNotes("");
    setError("");
    setSuccess(false);
    startTransition(async () => {
      const data = await getAdminProfessionals();
      setProfessionals(data);
    });
  }

  function closeModal() {
    setOpen(false);
  }

  function goBack() {
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1] as Step);
  }

  function selectProfessional(pro: AdminProfessional) {
    setSelectedPro(pro);
    setSelectedService(null);
    setStep("service");
    startTransition(async () => {
      const data = await getServicesForProfessional(pro.id);
      setServices(data);
    });
  }

  function selectService(svc: AdminServiceOption) {
    setSelectedService(svc);
    setStep("datetime");
  }

  function computeSlot(): { startsAt: string; endsAt: string } | null {
    if (!selectedDate || !selectedTime || !selectedService) return null;
    const starts = new Date(`${selectedDate}T${selectedTime}:00`);
    if (Number.isNaN(starts.getTime())) return null;
    const ends = new Date(starts.getTime() + selectedService.duration_minutes * 60 * 1000);
    return { startsAt: starts.toISOString(), endsAt: ends.toISOString() };
  }

  function handleDatetimeNext() {
    if (!selectedDate || !selectedTime) {
      setError("Selecione a data e o horário.");
      return;
    }
    if (!computeSlot()) {
      setError("Data ou horário inválido.");
      return;
    }
    setError("");
    setStep("client");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPro || !selectedService) return;
    const slot = computeSlot();
    if (!slot) return;
    setError("");

    startTransition(async () => {
      const result = await createManualAppointment({
        professionalId: selectedPro.id,
        serviceId: selectedService.id,
        startsAt: slot.startsAt,
        endsAt: slot.endsAt,
        serviceNameSnapshot: selectedService.name,
        priceCentsSnapshot: selectedService.price_cents,
        durationMinutesSnapshot: selectedService.duration_minutes,
        clientName,
        clientPhone,
        clientEmail,
        clientNotes,
      });

      if (!result.ok) {
        setError(result.error ?? "Erro ao criar agendamento");
        return;
      }
      setSuccess(true);
    });
  }

  const stepIndex = STEPS.indexOf(step);

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
      >
        <CalendarPlus className="h-4 w-4" />
        Novo agendamento
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 mx-auto max-w-md rounded-2xl border border-white/10 bg-card shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  {stepIndex > 0 && !success && (
                    <button
                      type="button"
                      onClick={goBack}
                      className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                  )}
                  <div>
                    <p className="font-bold text-sm">Agendamento manual</p>
                    {!success && (
                      <p className="text-xs text-muted-foreground">
                        Passo {stepIndex + 1} de {STEPS.length} — {STEP_LABELS[step]}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Progress bar */}
              {!success && (
                <div className="h-0.5 bg-white/5">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
                  />
                </div>
              )}

              {/* Body */}
              <div className="p-5 max-h-[65vh] overflow-y-auto">
                {success ? (
                  <div className="flex flex-col items-center gap-3 py-6 text-center">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center">
                      <Check className="h-7 w-7 text-emerald-400" />
                    </div>
                    <p className="font-bold">Agendamento criado!</p>
                    <p className="text-sm text-muted-foreground">
                      {clientName} — {selectedService?.name} —{" "}
                      {selectedDate &&
                        selectedTime &&
                        `${new Date(`${selectedDate}T${selectedTime}:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} às ${selectedTime}`}
                    </p>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="mt-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110 transition-all"
                    >
                      Fechar
                    </button>
                  </div>
                ) : isPending ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : step === "professional" ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground mb-3">Escolha o profissional:</p>
                    {professionals.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhum profissional ativo.
                      </p>
                    )}
                    {professionals.map((pro) => (
                      <button
                        key={pro.id}
                        type="button"
                        onClick={() => selectProfessional(pro)}
                        className="w-full text-left rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm font-medium hover:border-primary/40 hover:bg-primary/[0.06] transition-all"
                      >
                        {pro.display_name}
                      </button>
                    ))}
                  </div>
                ) : step === "service" ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground mb-3">Escolha o serviço:</p>
                    {services.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhum serviço disponível.
                      </p>
                    )}
                    {services.map((svc) => (
                      <button
                        key={svc.id}
                        type="button"
                        onClick={() => selectService(svc)}
                        className="w-full text-left rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 hover:border-primary/40 hover:bg-primary/[0.06] transition-all"
                      >
                        <p className="text-sm font-medium">{svc.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {svc.duration_minutes} min · {formatPrice(svc.price_cents)}
                        </p>
                      </button>
                    ))}
                  </div>
                ) : step === "datetime" ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Escolha a data e o horário:</p>

                    <div>
                      <label
                        htmlFor="mb-date"
                        className="text-xs text-muted-foreground mb-1.5 block"
                      >
                        Data
                      </label>
                      <input
                        id="mb-date"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="mb-time"
                        className="text-xs text-muted-foreground mb-1.5 block"
                      >
                        Horário de início
                      </label>
                      <input
                        id="mb-time"
                        type="time"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>

                    {selectedService && selectedDate && selectedTime && (
                      <div className="rounded-xl bg-primary/[0.06] border border-primary/15 px-4 py-3 text-xs text-muted-foreground">
                        Término previsto:{" "}
                        <span className="text-foreground font-medium">
                          {new Date(
                            new Date(`${selectedDate}T${selectedTime}:00`).getTime() +
                              selectedService.duration_minutes * 60 * 1000
                          ).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </span>{" "}
                        ({selectedService.duration_minutes} min)
                      </div>
                    )}

                    {error && (
                      <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                        {error}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={handleDatetimeNext}
                      className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-110 transition-all"
                    >
                      Continuar
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <p className="text-sm text-muted-foreground mb-1">Dados do cliente:</p>

                    <div>
                      <label htmlFor="mb-name" className="text-xs text-muted-foreground mb-1 block">
                        Nome *
                      </label>
                      <input
                        id="mb-name"
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Nome completo"
                        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="mb-phone"
                        className="text-xs text-muted-foreground mb-1 block"
                      >
                        Telefone *
                      </label>
                      <input
                        id="mb-phone"
                        required
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="(15) 99999-9999"
                        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="mb-email"
                        className="text-xs text-muted-foreground mb-1 block"
                      >
                        Email (opcional)
                      </label>
                      <input
                        id="mb-email"
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="email@exemplo.com"
                        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="mb-notes"
                        className="text-xs text-muted-foreground mb-1 block"
                      >
                        Observações (opcional)
                      </label>
                      <textarea
                        id="mb-notes"
                        value={clientNotes}
                        onChange={(e) => setClientNotes(e.target.value)}
                        placeholder="Referência, observações..."
                        rows={2}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none"
                      />
                    </div>

                    {error && (
                      <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                        {error}
                      </p>
                    )}

                    <div className="pt-1 border-t border-white/5 mt-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <span>{selectedService?.name}</span>
                        <span>
                          {selectedDate &&
                            selectedTime &&
                            `${new Date(`${selectedDate}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} às ${selectedTime}`}
                        </span>
                      </div>
                      <button
                        type="submit"
                        disabled={isPending}
                        className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                      >
                        {isPending ? "Criando..." : "Confirmar agendamento"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
