"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useReducer, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, formatCurrency, formatDuration } from "@/lib/utils";
import {
  createAppointment,
  getAvailableDatesForMonth,
  getProfessionalsForService,
  getSlotsForDate,
  type ProfessionalOption,
  type SerializedSlot,
} from "@/server/actions/booking";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ServiceOption {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  duration_minutes: number;
  price_cents: number;
  image_url: string | null;
}

interface EstablishmentInfo {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  auto_confirm: boolean;
  buffer_minutes: number;
  booking_advance_min_hours: number;
  booking_advance_max_days: number;
}

interface WizardProps {
  establishment: EstablishmentInfo;
  services: ServiceOption[];
  allMembers: ProfessionalOption[];
  preSelectedServiceId?: string;
}

type Step = 1 | 2 | 3 | 4 | 5;

interface WizardState {
  step: Step;
  service: ServiceOption | null;
  professionals: ProfessionalOption[];
  professional: ProfessionalOption | null;
  calYear: number;
  calMonth: number;
  availableDates: string[];
  datesLoading: boolean;
  selectedDate: string | null;
  slots: SerializedSlot[];
  slotsLoading: boolean;
  selectedSlot: SerializedSlot | null;
  submitting: boolean;
  submitError: string | null;
  appointmentId: string | null;
  appointmentStatus: string | null;
}

type Action =
  | { type: "SELECT_SERVICE"; service: ServiceOption }
  | { type: "SET_PROFESSIONALS"; professionals: ProfessionalOption[] }
  | { type: "SELECT_PROFESSIONAL"; professional: ProfessionalOption }
  | { type: "SET_CAL"; year: number; month: number }
  | { type: "SET_DATES"; dates: string[]; loading: false }
  | { type: "DATES_LOADING" }
  | { type: "SELECT_DATE"; date: string }
  | { type: "SET_SLOTS"; slots: SerializedSlot[]; loading: false }
  | { type: "SLOTS_LOADING" }
  | { type: "SELECT_SLOT"; slot: SerializedSlot }
  | { type: "GO_STEP"; step: Step }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_SUCCESS"; appointmentId: string; status: string }
  | { type: "SUBMIT_ERROR"; message: string };

function now() {
  const d = new Date();
  return { year: d.getFullYear(), month: d.getMonth() };
}

function reducer(state: WizardState, action: Action): WizardState {
  switch (action.type) {
    case "SELECT_SERVICE":
      return {
        ...state,
        service: action.service,
        professional: null,
        professionals: [],
        selectedDate: null,
        slots: [],
        selectedSlot: null,
        availableDates: [],
      };
    case "SET_PROFESSIONALS":
      return { ...state, professionals: action.professionals };
    case "SELECT_PROFESSIONAL":
      return {
        ...state,
        professional: action.professional,
        selectedDate: null,
        slots: [],
        selectedSlot: null,
        availableDates: [],
        ...now(),
      };
    case "SET_CAL":
      return {
        ...state,
        calYear: action.year,
        calMonth: action.month,
        availableDates: [],
        selectedDate: null,
        slots: [],
        selectedSlot: null,
      };
    case "DATES_LOADING":
      return { ...state, datesLoading: true };
    case "SET_DATES":
      return { ...state, availableDates: action.dates, datesLoading: false };
    case "SELECT_DATE":
      return { ...state, selectedDate: action.date, slots: [], selectedSlot: null };
    case "SLOTS_LOADING":
      return { ...state, slotsLoading: true };
    case "SET_SLOTS":
      return { ...state, slots: action.slots, slotsLoading: false };
    case "SELECT_SLOT":
      return { ...state, selectedSlot: action.slot };
    case "GO_STEP":
      return { ...state, step: action.step };
    case "SUBMIT_START":
      return { ...state, submitting: true, submitError: null };
    case "SUBMIT_SUCCESS":
      return {
        ...state,
        submitting: false,
        step: 5,
        appointmentId: action.appointmentId,
        appointmentStatus: action.status,
      };
    case "SUBMIT_ERROR":
      return { ...state, submitting: false, submitError: action.message };
    default:
      return state;
  }
}

// ─── Calendar helpers ─────────────────────────────────────────────────────────

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];
const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function buildCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: { key: string; day: number | null }[] = [];
  for (let i = 0; i < firstDay; i++) cells.push({ key: `pad-${i}`, day: null });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ key: `day-${d}`, day: d });
  return cells;
}

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// ─── Client info form ─────────────────────────────────────────────────────────

const clientSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  notes: z.string().max(500).optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10)
    return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-1 mb-6">
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
        <div
          key={n}
          className={cn(
            "h-1 flex-1 rounded-full transition-colors",
            n < step ? "bg-primary" : n === step ? "bg-primary/60" : "bg-white/10"
          )}
        />
      ))}
    </div>
  );
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────

export function BookingWizard({
  establishment,
  services,
  allMembers,
  preSelectedServiceId,
}: WizardProps) {
  const todayObj = new Date();
  const initial: WizardState = {
    step: 1,
    service: null,
    professionals: [],
    professional: null,
    calYear: todayObj.getFullYear(),
    calMonth: todayObj.getMonth(),
    availableDates: [],
    datesLoading: false,
    selectedDate: null,
    slots: [],
    slotsLoading: false,
    selectedSlot: null,
    submitting: false,
    submitError: null,
    appointmentId: null,
    appointmentStatus: null,
  };

  const [state, dispatch] = useReducer(reducer, initial);
  const mountedRef = useRef(true);
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Pre-select service from URL param (run once)
  const didPreSelectRef = useRef(false);
  useEffect(() => {
    if (didPreSelectRef.current || !preSelectedServiceId) return;
    const svc = services.find((s) => s.id === preSelectedServiceId);
    if (!svc) return;
    didPreSelectRef.current = true;
    dispatch({ type: "SELECT_SERVICE", service: svc });
    getProfessionalsForService(establishment.id, svc.id).then((profs) => {
      if (!mountedRef.current) return;
      dispatch({ type: "SET_PROFESSIONALS", professionals: profs });
      if (profs.length === 1) {
        dispatch({ type: "SELECT_PROFESSIONAL", professional: profs[0]! });
        dispatch({ type: "GO_STEP", step: 3 });
      } else if (profs.length === 0) {
        dispatch({ type: "SET_PROFESSIONALS", professionals: allMembers });
        if (allMembers.length === 1) {
          dispatch({ type: "SELECT_PROFESSIONAL", professional: allMembers[0]! });
          dispatch({ type: "GO_STEP", step: 3 });
        } else {
          dispatch({ type: "GO_STEP", step: 2 });
        }
      } else {
        dispatch({ type: "GO_STEP", step: 2 });
      }
    });
  }, [preSelectedServiceId, services, establishment.id, allMembers]);

  // Fetch available dates when cal month changes or professional selected
  useEffect(() => {
    if (!state.professional || !state.service) return;

    let cancelled = false;
    dispatch({ type: "DATES_LOADING" });

    getAvailableDatesForMonth(
      state.professional.id,
      state.service.duration_minutes,
      state.calYear,
      state.calMonth,
      establishment.buffer_minutes,
      establishment.booking_advance_min_hours
    ).then((dates) => {
      if (!cancelled) dispatch({ type: "SET_DATES", dates, loading: false });
    });

    return () => {
      cancelled = true;
    };
  }, [state.professional, state.service, state.calYear, state.calMonth, establishment]);

  // Fetch slots when date selected
  useEffect(() => {
    if (!state.professional || !state.service || !state.selectedDate) return;

    let cancelled = false;
    dispatch({ type: "SLOTS_LOADING" });

    getSlotsForDate(
      state.professional.id,
      state.service.duration_minutes,
      state.selectedDate,
      establishment.buffer_minutes,
      establishment.booking_advance_min_hours
    ).then((slots) => {
      if (!cancelled) dispatch({ type: "SET_SLOTS", slots, loading: false });
    });

    return () => {
      cancelled = true;
    };
  }, [state.professional, state.service, state.selectedDate, establishment]);

  async function handleSelectService(svc: ServiceOption) {
    dispatch({ type: "SELECT_SERVICE", service: svc });

    const profs = await getProfessionalsForService(establishment.id, svc.id);
    if (!mountedRef.current) return;

    dispatch({ type: "SET_PROFESSIONALS", professionals: profs });

    if (profs.length === 1) {
      // Auto-select the only professional and skip step 2
      dispatch({ type: "SELECT_PROFESSIONAL", professional: profs[0]! });
      dispatch({ type: "GO_STEP", step: 3 });
    } else if (profs.length === 0) {
      // No professional configured — use all members
      const fallback = allMembers;
      dispatch({ type: "SET_PROFESSIONALS", professionals: fallback });
      if (fallback.length === 1) {
        dispatch({ type: "SELECT_PROFESSIONAL", professional: fallback[0]! });
        dispatch({ type: "GO_STEP", step: 3 });
      } else {
        dispatch({ type: "GO_STEP", step: 2 });
      }
    } else {
      dispatch({ type: "GO_STEP", step: 2 });
    }
  }

  function handleSelectProfessional(prof: ProfessionalOption) {
    dispatch({ type: "SELECT_PROFESSIONAL", professional: prof });
    dispatch({ type: "GO_STEP", step: 3 });
  }

  function handleSelectDate(dateStr: string) {
    if (!state.availableDates.includes(dateStr)) return;
    dispatch({ type: "SELECT_DATE", date: dateStr });
  }

  function handleSelectSlot(slot: SerializedSlot) {
    dispatch({ type: "SELECT_SLOT", slot });
  }

  const handleDateTimeNext = useCallback(() => {
    if (!state.selectedDate || !state.selectedSlot) return;
    dispatch({ type: "GO_STEP", step: 4 });
  }, [state.selectedDate, state.selectedSlot]);

  const clientForm = useForm<ClientFormData>({ resolver: zodResolver(clientSchema) });

  async function handleSubmit(clientData: ClientFormData) {
    if (!state.service || !state.professional || !state.selectedSlot) return;
    dispatch({ type: "SUBMIT_START" });

    const result = await createAppointment({
      establishmentId: establishment.id,
      professionalId: state.professional.id,
      serviceId: state.service.id,
      startsAt: state.selectedSlot.startsAt,
      endsAt: state.selectedSlot.endsAt,
      serviceNameSnapshot: state.service.name,
      priceCentsSnapshot: state.service.price_cents,
      durationMinutesSnapshot: state.service.duration_minutes,
      clientName: clientData.name,
      clientEmail: clientData.email,
      clientPhone: clientData.phone,
      clientNotes: clientData.notes,
    });

    if (!result.ok) {
      const msg =
        result.error.type === "SLOT_TAKEN"
          ? "Este horário foi reservado por outra pessoa. Escolha outro."
          : result.error.type === "PAYMENT_REQUIRED"
            ? "Este estabelecimento atingiu o limite do plano gratuito."
            : "Erro ao criar agendamento. Tente novamente.";
      dispatch({ type: "SUBMIT_ERROR", message: msg });
    } else {
      dispatch({
        type: "SUBMIT_SUCCESS",
        appointmentId: result.data.appointmentId,
        status: result.data.status,
      });
    }
  }

  const totalSteps = state.professionals.length !== 1 ? 4 : 3;
  const stepForBar = state.professionals.length !== 1 ? state.step : Math.max(1, state.step - 1);

  // ── Step 5: Success ────────────────────────────────────────────────────────
  if (state.step === 5) {
    const slot = state.selectedSlot!;
    const startDate = new Date(slot.startsAt);
    const confirmed = state.appointmentStatus === "confirmed";

    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center space-y-5">
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black mb-1">
              {confirmed ? "Agendamento confirmado!" : "Solicitação enviada!"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {confirmed
                ? "Seu horário está reservado."
                : "O estabelecimento irá confirmar em breve."}
            </p>
          </div>

          <div className="glass-card p-5 text-left space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                {establishment.logo_url ? (
                  <Image
                    src={establishment.logo_url}
                    alt={establishment.name}
                    width={32}
                    height={32}
                    className="rounded-lg object-cover"
                  />
                ) : (
                  <span className="text-xs font-black text-primary">
                    {establishment.name.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <p className="font-semibold">{establishment.name}</p>
                <p className="text-muted-foreground text-xs">{state.service?.name}</p>
              </div>
            </div>
            <div className="border-t border-white/5 pt-3 space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="h-4 w-4 shrink-0" />
                <span>
                  {startDate.toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4 shrink-0" />
                <span>
                  {slot.time} — {formatDuration(state.service?.duration_minutes ?? 0)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4 shrink-0" />
                <span>{state.professional?.display_name}</span>
              </div>
            </div>
            <div className="border-t border-white/5 pt-3 flex items-center justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-bold text-primary">
                {formatCurrency(state.service?.price_cents ?? 0)}
              </span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">Enviamos os detalhes para o seu email.</p>

          <Button asChild className="w-full" size="lg">
            <Link href={`/e/${establishment.slug}`}>Voltar ao perfil</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-white/5 bg-background/90 backdrop-blur-sm">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          {state.step > 1 ? (
            <button
              type="button"
              onClick={() => dispatch({ type: "GO_STEP", step: (state.step - 1) as Step })}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : (
            <Link
              href={`/e/${establishment.slug}`}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
          )}
          <div className="flex items-center gap-2 flex-1">
            {establishment.logo_url && (
              <div className="relative w-7 h-7 rounded-md overflow-hidden">
                <Image
                  src={establishment.logo_url}
                  alt={establishment.name}
                  fill
                  className="object-cover"
                  sizes="28px"
                />
              </div>
            )}
            <span className="font-semibold text-sm truncate">{establishment.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        <StepBar step={stepForBar} total={totalSteps} />

        {/* ── Step 1: Service ───────────────────────────────────────────────── */}
        {state.step === 1 && (
          <div>
            <h1 className="text-2xl font-black mb-1">Escolha o serviço</h1>
            <p className="text-muted-foreground text-sm mb-6">Selecione o que você quer fazer</p>

            <div className="space-y-2">
              {services.map((svc) => (
                <button
                  key={svc.id}
                  type="button"
                  onClick={() => handleSelectService(svc)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all",
                    state.service?.id === svc.id
                      ? "border-primary/60 bg-primary/5"
                      : "border-white/5 hover:border-white/15 hover:bg-white/[0.02]"
                  )}
                >
                  {svc.image_url && (
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={svc.image_url}
                        alt={svc.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{svc.name}</p>
                    {svc.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {svc.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(svc.duration_minutes)}
                    </p>
                  </div>
                  <p className="font-bold text-primary shrink-0">
                    {formatCurrency(svc.price_cents)}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 2: Professional ──────────────────────────────────────────── */}
        {state.step === 2 && (
          <div>
            <h1 className="text-2xl font-black mb-1">Escolha o profissional</h1>
            <p className="text-muted-foreground text-sm mb-6">
              Com quem você prefere ser atendido?
            </p>

            <div className="space-y-2">
              {state.professionals.map((prof) => (
                <button
                  key={prof.id}
                  type="button"
                  onClick={() => handleSelectProfessional(prof)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/5 hover:border-primary/40 hover:bg-primary/5 text-left transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-primary">
                      {prof.display_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{prof.display_name}</p>
                    {prof.bio && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {prof.bio}
                      </p>
                    )}
                    {prof.specialties && prof.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {prof.specialties.slice(0, 3).map((s) => (
                          <Badge key={s} variant="secondary" className="text-xs py-0">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 3: Date + Time ───────────────────────────────────────────── */}
        {state.step === 3 && (
          <div>
            <h1 className="text-2xl font-black mb-1">Escolha a data e hora</h1>
            <p className="text-muted-foreground text-sm mb-6">
              Horários disponíveis com {state.professional?.display_name}
            </p>

            {/* Calendar */}
            <div className="glass-card p-4 mb-4">
              {/* Month nav */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => {
                    const prev =
                      state.calMonth === 0
                        ? { year: state.calYear - 1, month: 11 }
                        : { year: state.calYear, month: state.calMonth - 1 };
                    const today = new Date();
                    if (
                      prev.year > today.getFullYear() ||
                      (prev.year === today.getFullYear() && prev.month >= today.getMonth())
                    )
                      dispatch({ type: "SET_CAL", ...prev });
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <p className="font-semibold text-sm">
                  {MONTH_NAMES[state.calMonth]} {state.calYear}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const next =
                      state.calMonth === 11
                        ? { year: state.calYear + 1, month: 0 }
                        : { year: state.calYear, month: state.calMonth + 1 };
                    const maxDate = new Date();
                    maxDate.setMonth(maxDate.getMonth() + 3);
                    if (new Date(next.year, next.month, 1) <= maxDate)
                      dispatch({ type: "SET_CAL", ...next });
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 mb-2">
                {DAY_NAMES.map((d) => (
                  <p key={d} className="text-center text-xs text-muted-foreground font-medium py-1">
                    {d}
                  </p>
                ))}
              </div>

              {/* Days */}
              <div className="grid grid-cols-7 gap-1">
                {buildCalendarDays(state.calYear, state.calMonth).map(({ key, day }) => {
                  if (!day) return <div key={key} />;
                  const dateStr = toDateStr(state.calYear, state.calMonth, day);
                  const today = new Date();
                  const isPast =
                    new Date(state.calYear, state.calMonth, day) <
                    new Date(today.getFullYear(), today.getMonth(), today.getDate());
                  const isAvailable = !state.datesLoading && state.availableDates.includes(dateStr);
                  const isSelected = state.selectedDate === dateStr;

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      disabled={isPast || (!state.datesLoading && !isAvailable)}
                      onClick={() => handleSelectDate(dateStr)}
                      className={cn(
                        "aspect-square rounded-lg text-sm font-medium transition-all",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : isAvailable
                            ? "hover:bg-primary/10 text-foreground"
                            : "text-muted-foreground/30 cursor-default",
                        state.datesLoading && !isPast && "animate-pulse bg-white/5"
                      )}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slots */}
            {state.selectedDate && (
              <div className="mb-6">
                <p className="text-sm font-semibold mb-3">
                  {new Date(`${state.selectedDate}T00:00:00`).toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>

                {state.slotsLoading && (
                  <div className="grid grid-cols-4 gap-2">
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((n) => (
                      <div key={n} className="h-10 rounded-lg bg-white/5 animate-pulse" />
                    ))}
                  </div>
                )}

                {!state.slotsLoading && state.slots.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum horário disponível nesta data.
                  </p>
                )}

                {!state.slotsLoading && state.slots.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {state.slots.map((slot) => (
                      <button
                        key={slot.startsAt}
                        type="button"
                        onClick={() => handleSelectSlot(slot)}
                        className={cn(
                          "h-10 rounded-lg text-sm font-medium border transition-all",
                          state.selectedSlot?.startsAt === slot.startsAt
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-white/10 hover:border-primary/40 hover:bg-primary/5"
                        )}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <Button
              className="w-full"
              size="lg"
              disabled={!state.selectedDate || !state.selectedSlot}
              onClick={handleDateTimeNext}
            >
              Continuar
            </Button>
          </div>
        )}

        {/* ── Step 4: Client info ───────────────────────────────────────────── */}
        {state.step === 4 && (
          <div>
            <h1 className="text-2xl font-black mb-1">Seus dados</h1>
            <p className="text-muted-foreground text-sm mb-6">Para confirmarmos o agendamento</p>

            {/* Summary pill */}
            {state.service && state.selectedSlot && (
              <div className="glass-card p-3 mb-6 flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <CalendarDays className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{state.service.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(state.selectedSlot.startsAt).toLocaleDateString("pt-BR", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}{" "}
                    às {state.selectedSlot.time} · {state.professional?.display_name}
                  </p>
                </div>
                <p className="font-bold text-primary shrink-0">
                  {formatCurrency(state.service.price_cents)}
                </p>
              </div>
            )}

            {state.submitError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{state.submitError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={clientForm.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo *</Label>
                <Input
                  id="name"
                  placeholder="João Silva"
                  autoComplete="name"
                  error={!!clientForm.formState.errors.name}
                  {...clientForm.register("name")}
                />
                {clientForm.formState.errors.name && (
                  <p className="text-xs text-destructive">
                    {clientForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  autoComplete="email"
                  error={!!clientForm.formState.errors.email}
                  {...clientForm.register("email")}
                />
                {clientForm.formState.errors.email && (
                  <p className="text-xs text-destructive">
                    {clientForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone / WhatsApp *</Label>
                <Input
                  id="phone"
                  placeholder="(11) 99999-9999"
                  autoComplete="tel"
                  error={!!clientForm.formState.errors.phone}
                  {...clientForm.register("phone", {
                    onChange: (e) => {
                      e.target.value = formatPhone(e.target.value);
                    },
                  })}
                />
                {clientForm.formState.errors.phone && (
                  <p className="text-xs text-destructive">
                    {clientForm.formState.errors.phone.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações (opcional)</Label>
                <textarea
                  id="notes"
                  placeholder="Alguma preferência ou informação importante..."
                  rows={3}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                  {...clientForm.register("notes")}
                />
              </div>

              <Button type="submit" className="w-full" size="lg" loading={state.submitting}>
                {establishment.auto_confirm ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Confirmar agendamento
                  </>
                ) : (
                  "Enviar solicitação"
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Ao agendar, você concorda com os{" "}
                <Link href="/termos" className="text-primary hover:underline">
                  Termos de Uso
                </Link>{" "}
                do InkBook.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
