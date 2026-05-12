export const APP_NAME = "Agendaê";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://Agendaê.app";

export const ESTABLISHMENT_CATEGORIES = [
  { value: "tattoo", label: "Estúdio de Tatuagem" },
  { value: "barber", label: "Barbearia" },
  { value: "salon", label: "Salão de Beleza" },
  { value: "aesthetics", label: "Estética" },
  { value: "nail", label: "Manicure / Nail Designer" },
  { value: "eyebrow", label: "Designer de Sobrancelha" },
  { value: "massage", label: "Massagem / Spa" },
  { value: "podology", label: "Podologia" },
  { value: "psychology", label: "Psicologia" },
  { value: "nutrition", label: "Nutrição" },
  { value: "vet", label: "Banho & Tosa" },
  { value: "carwash", label: "Lava-Jato" },
  { value: "other", label: "Outro" },
] as const;

export const APPOINTMENT_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  NO_SHOW: "no_show",
  COMPLETED: "completed",
  RESCHEDULED: "rescheduled",
} as const;

export const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Aguardando",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
  no_show: "Não compareceu",
  completed: "Concluído",
  rescheduled: "Remarcado",
};

export const PAYMENT_STATUS = {
  NOT_REQUIRED: "not_required",
  PENDING: "pending",
  PAID: "paid",
  REFUNDED: "refunded",
  FAILED: "failed",
} as const;

export const ROLES = {
  SUPER_ADMIN: "super_admin",
  OWNER: "owner",
  PROFESSIONAL: "professional",
  STAFF: "staff",
  CLIENT: "client",
} as const;

export const PLANS = {
  FREE: "free",
  PRO: "pro",
  BUSINESS: "business",
} as const;

export const PLAN_LIMITS = {
  free: { professionals: 1, appointments_per_month: 30 },
  pro: { professionals: 5, appointments_per_month: Infinity },
  business: { professionals: Infinity, appointments_per_month: Infinity },
} as const;

export const WEEKDAYS = [
  { value: 0, label: "Domingo", short: "Dom" },
  { value: 1, label: "Segunda-feira", short: "Seg" },
  { value: 2, label: "Terça-feira", short: "Ter" },
  { value: 3, label: "Quarta-feira", short: "Qua" },
  { value: 4, label: "Quinta-feira", short: "Qui" },
  { value: 5, label: "Sexta-feira", short: "Sex" },
  { value: 6, label: "Sábado", short: "Sáb" },
] as const;

export const BOOKING_SLOT_INTERVAL_MINUTES = 15;
