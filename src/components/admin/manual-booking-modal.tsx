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
import {
  getAvailableDatesForMonth,
  getSlotsForDate,
  type SerializedSlot,
} from "@/server/actions/booking";

interface Props {
  establishmentId: string;
  bufferMinutes: number;
}

type Step = "professional" | "service" | "date" | "time" | "client";

const STEPS: Step[] = ["professional", "service", "date", "time", "client"];

const STEP_LABELS: Record<Step, string> = {
  professional: "Profissional",
  service: "Serviço",
  date: "Data",
  time: "Horário",
  client: "Cliente",
};

export function ManualBookingModal({ bufferMinutes }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("professional");
  const [isPending, startTransition] = useTransition();

  const [professionals, setProfessionals] = useState<AdminProfessional[]>([]);
  const [services, setServices] = useState<AdminServiceOption[]>([]);
  const [slots, setSlots] = useState<SerializedSlot[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  const [selectedPro, setSelectedPro] = useState<AdminProfessional | null>(null);
  const [selectedService, setSelectedService] = useState<AdminServiceOption | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<SerializedSlot | null>(null);

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
    setSelectedSlot(null);
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
    setSelectedDate("");
    setSelectedSlot(null);
    setStep("service");
    startTransition(async () => {
      const data = await getServicesForProfessional(pro.id);
      setServices(data);
    });
  }

  function selectService(svc: AdminServiceOption) {
    setSelectedService(svc);
    setSelectedDate("");
    setSelectedSlot(null);
    setStep("date");
    const now = new Date();
    startTransition(async () => {
      const dates = await getAvailableDatesForMonth(
        selectedPro!.id,
        svc.duration_minutes,
        now.getFullYear(),
        now.getMonth(),
        bufferMinutes,
        0
      );
      setAvailableDates(dates);
    });
  }

  function selectDate(date: string) {
    setSelectedDate(date);
    setSelectedSlot(null);
    setStep("time");
    startTransition(async () => {
      const data = await getSlotsForDate(
        selectedPro!.id,
        selectedService!.duration_minutes,
        date,
        bufferMinutes,
        0
      );
      setSlots(data);
    });
  }

  function selectSlot(slot: SerializedSlot) {
    setSelectedSlot(slot);
    setStep("client");
  }

  function handleDateInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    if (!val) return;
    selectDate(val);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPro || !selectedService || !selectedSlot) return;
    setError("");

    startTransition(async () => {
      const result = await createManualAppointment({
        professionalId: selectedPro.id,
        serviceId: selectedService.id,
        startsAt: selectedSlot.startsAt,
        endsAt: selectedSlot.endsAt,
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
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="fixed inset-x-4 top-[50%] -translate-y-1/2 z-50 mx-auto max-w-md rounded-2xl border border-white/10 bg-card shadow-2xl overflow-hidden"
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
              <div className="p-5 max-h-[60vh] overflow-y-auto">
                {success ? (
                  <div className="flex flex-col items-center gap-3 py-6 text-center">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center">
                      <Check className="h-7 w-7 text-emerald-400" />
                    </div>
                    <p className="font-bold">Agendamento criado!</p>
                    <p className="text-sm text-muted-foreground">
                      {clientName} — {selectedService?.name} —{" "}
                      {selectedSlot &&
                        new Date(selectedSlot.startsAt).toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          timeZone: "America/Sao_Paulo",
                        })}
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
                    <p className="text-sm text-muted-foreground mb-3">
                      Escolha o profissional responsável:
                    </p>
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
                ) : step === "date" ? (
                  <div>
                    <p className="text-sm text-muted-foreground mb-3">Escolha a data:</p>
                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      onChange={handleDateInput}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                    />
                    {availableDates.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {availableDates.length} dias disponíveis neste mês
                      </p>
                    )}
                  </div>
                ) : step === "time" ? (
                  <div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Escolha o horário —{" "}
                      {new Date(`${selectedDate}T12:00:00`).toLocaleDateString("pt-BR", {
                        weekday: "long",
                        day: "2-digit",
                        month: "long",
                      })}
                      :
                    </p>
                    {slots.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">
                        Nenhum horário disponível nesta data.
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {slots.map((slot) => (
                          <button
                            key={slot.startsAt}
                            type="button"
                            onClick={() => selectSlot(slot)}
                            className="rounded-xl border border-white/8 bg-white/[0.03] py-2.5 text-sm font-medium hover:border-primary/40 hover:bg-primary/[0.06] transition-all"
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    )}
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
                          {selectedSlot?.time} ·{" "}
                          {selectedDate &&
                            new Date(`${selectedDate}T12:00:00`).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                            })}
                        </span>
                      </div>
                      <button
                        type="submit"
                        disabled={isPending}
                        className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
