export type Result<T, E = { type: string; message?: string }> =
  | { ok: true; data: T }
  | { ok: false; error: E };

export type BookingError =
  | { type: "INVALID_INPUT"; issues: unknown[] }
  | { type: "SLOT_TAKEN" }
  | { type: "PROFESSIONAL_UNAVAILABLE" }
  | { type: "ESTABLISHMENT_NOT_FOUND" }
  | { type: "SERVICE_NOT_FOUND" }
  | { type: "ADVANCE_TOO_SHORT" }
  | { type: "ADVANCE_TOO_LONG" }
  | { type: "PAYMENT_REQUIRED" }
  | { type: "UNAUTHORIZED" }
  | { type: "UNKNOWN" };

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "no_show"
  | "completed"
  | "rescheduled";

export type PaymentStatus = "not_required" | "pending" | "paid" | "refunded" | "failed";

export type UserRole = "owner" | "professional" | "staff";

export type Plan = "free" | "pro" | "business";

export type EstablishmentCategory =
  | "tattoo"
  | "barber"
  | "salon"
  | "aesthetics"
  | "nail"
  | "eyebrow"
  | "massage"
  | "podology"
  | "psychology"
  | "nutrition"
  | "vet"
  | "carwash"
  | "other";

export interface TimeSlot {
  time: string;
  available: boolean;
  startsAt: Date;
  endsAt: Date;
}

export interface BookingWizardData {
  serviceId: string;
  serviceName: string;
  serviceDurationMinutes: number;
  servicePriceCents: number;
  professionalId: string;
  professionalName: string;
  date: Date;
  slot: TimeSlot;
  client: {
    name: string;
    email: string;
    phone: string;
    notes?: string;
  };
}
