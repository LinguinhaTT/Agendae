"use server";

import { addMonths, endOfMonth, startOfDay, startOfMonth } from "date-fns";
import { z } from "zod";
import {
  getAvailableDates,
  getAvailableSlots,
  isSlotStillAvailable,
} from "@/lib/booking/availability";
import { sendAppointmentEmail } from "@/lib/notifications/send";
import type { AppointmentEmailParams } from "@/lib/notifications/templates/appointment";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { BookingError, Result } from "@/types";

export interface SerializedSlot {
  time: string;
  startsAt: string;
  endsAt: string;
}

export interface ProfessionalOption {
  id: string;
  display_name: string;
  bio: string | null;
  specialties: string[] | null;
}

// ─── Get professionals who can perform a service ─────────────────────────────

export async function getProfessionalsForService(
  establishmentId: string,
  serviceId: string
): Promise<ProfessionalOption[]> {
  const supabase = await createClient();

  // First check if professional_services has entries for this service
  const { data: linked } = await supabase
    .from("professional_services")
    .select("professional_id")
    .eq("service_id", serviceId);

  let memberQuery = supabase
    .from("establishment_members")
    .select("id, display_name, bio, specialties")
    .eq("establishment_id", establishmentId)
    .eq("is_active", true)
    .eq("is_visible_public", true)
    .order("position");

  if (linked && linked.length > 0) {
    const ids = linked.map((r) => r.professional_id);
    memberQuery = memberQuery.in("id", ids);
  }

  const { data } = await memberQuery;
  return (data ?? []) as ProfessionalOption[];
}

// ─── Get available dates in a month ─────────────────────────────────────────

export async function getAvailableDatesForMonth(
  professionalId: string,
  durationMinutes: number,
  year: number,
  month: number, // 0-indexed
  bufferMinutes: number,
  minAdvanceHours: number
): Promise<string[]> {
  const supabase = await createClient();

  const start = startOfMonth(new Date(year, month, 1));
  const end = endOfMonth(start);
  const today = startOfDay(new Date());
  const rangeStart = start < today ? today : start;
  const maxDate = addMonths(today, 3);
  const rangeEnd = end > maxDate ? maxDate : end;

  if (rangeStart > rangeEnd) return [];

  const [rulesResult, timeOffResult, appointmentsResult] = await Promise.all([
    supabase
      .from("availability_rules")
      .select("weekday, start_time, end_time, is_active")
      .eq("professional_id", professionalId)
      .eq("is_active", true),

    supabase
      .from("time_off")
      .select("starts_at, ends_at")
      .eq("professional_id", professionalId)
      .gte("ends_at", rangeStart.toISOString())
      .lte("starts_at", rangeEnd.toISOString()),

    supabase
      .from("appointments")
      .select("starts_at, ends_at, status")
      .eq("professional_id", professionalId)
      .in("status", ["pending", "confirmed"])
      .gte("starts_at", rangeStart.toISOString())
      .lte("starts_at", rangeEnd.toISOString()),
  ]);

  const dates = getAvailableDates({
    startDate: rangeStart,
    endDate: rangeEnd,
    durationMinutes,
    rules: rulesResult.data ?? [],
    timeOffs: timeOffResult.data ?? [],
    existingAppointments: appointmentsResult.data ?? [],
    bufferMinutes,
    minAdvanceHours,
  });

  return dates.map((d) => d.toISOString().split("T")[0]!);
}

// ─── Get slots for a specific date ──────────────────────────────────────────

export async function getSlotsForDate(
  professionalId: string,
  durationMinutes: number,
  dateStr: string,
  bufferMinutes: number,
  minAdvanceHours: number
): Promise<SerializedSlot[]> {
  const supabase = await createClient();
  const date = new Date(`${dateStr}T00:00:00`);

  const [rulesResult, timeOffResult, appointmentsResult] = await Promise.all([
    supabase
      .from("availability_rules")
      .select("weekday, start_time, end_time, is_active")
      .eq("professional_id", professionalId)
      .eq("is_active", true),

    supabase
      .from("time_off")
      .select("starts_at, ends_at")
      .eq("professional_id", professionalId)
      .lte("starts_at", new Date(`${dateStr}T23:59:59`).toISOString())
      .gte("ends_at", new Date(`${dateStr}T00:00:00`).toISOString()),

    supabase
      .from("appointments")
      .select("starts_at, ends_at, status")
      .eq("professional_id", professionalId)
      .in("status", ["pending", "confirmed"])
      .gte("starts_at", new Date(`${dateStr}T00:00:00`).toISOString())
      .lte("starts_at", new Date(`${dateStr}T23:59:59`).toISOString()),
  ]);

  const slots = getAvailableSlots({
    date,
    durationMinutes,
    rules: rulesResult.data ?? [],
    timeOffs: timeOffResult.data ?? [],
    existingAppointments: appointmentsResult.data ?? [],
    bufferMinutes,
    minAdvanceHours,
  });

  return slots.map((s) => ({
    time: s.time,
    startsAt: s.startsAt.toISOString(),
    endsAt: s.endsAt.toISOString(),
  }));
}

// ─── Create appointment ───────────────────────────────────────────────────────

const createAppointmentSchema = z.object({
  establishmentId: z.string().uuid(),
  professionalId: z.string().uuid(),
  serviceId: z.string().uuid(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  serviceNameSnapshot: z.string(),
  priceCentsSnapshot: z.number().int().nonnegative(),
  durationMinutesSnapshot: z.number().int().positive(),
  clientName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  clientEmail: z.string().email("Email inválido"),
  clientPhone: z.string().min(10, "Telefone inválido"),
  clientNotes: z.string().max(500).optional(),
});

export async function createAppointment(
  input: unknown
): Promise<Result<{ appointmentId: string; status: string }, BookingError>> {
  const parsed = createAppointmentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: { type: "INVALID_INPUT", issues: parsed.error.issues },
    };
  }

  const d = parsed.data;
  const supabase = await createClient();

  // Fetch establishment for settings + plan check
  const { data: establishment } = await supabase
    .from("establishments")
    .select(
      "id, auto_confirm, buffer_minutes, booking_advance_min_hours, booking_advance_max_days, plan, name, slug, owner_id"
    )
    .eq("id", d.establishmentId)
    .maybeSingle();

  if (!establishment) return { ok: false, error: { type: "ESTABLISHMENT_NOT_FOUND" } };

  // Check free plan limit
  if (establishment.plan === "free") {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("establishment_id", d.establishmentId)
      .gte("created_at", monthStart.toISOString())
      .not("status", "eq", "cancelled");

    if ((count ?? 0) >= 30) {
      return { ok: false, error: { type: "PAYMENT_REQUIRED" } };
    }
  }

  // Re-validate slot is still available (race condition guard)
  const { data: existingAppts } = await supabase
    .from("appointments")
    .select("starts_at, ends_at, status")
    .eq("professional_id", d.professionalId)
    .in("status", ["pending", "confirmed"]);

  const startsAt = new Date(d.startsAt);
  const endsAt = new Date(d.endsAt);

  const stillAvailable = isSlotStillAvailable({
    startsAt,
    endsAt,
    existingAppointments: existingAppts ?? [],
    bufferMinutes: establishment.buffer_minutes,
  });

  if (!stillAvailable) return { ok: false, error: { type: "SLOT_TAKEN" } };

  // Get the authenticated user id (optional - client may not be logged in)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const status = establishment.auto_confirm ? "confirmed" : "pending";

  const { data: appointment, error } = await supabase
    .from("appointments")
    .insert({
      establishment_id: d.establishmentId,
      professional_id: d.professionalId,
      service_id: d.serviceId,
      client_id: user?.id ?? null,
      client_name: d.clientName,
      client_email: d.clientEmail,
      client_phone: d.clientPhone,
      client_notes: d.clientNotes ?? null,
      starts_at: d.startsAt,
      ends_at: d.endsAt,
      service_name_snapshot: d.serviceNameSnapshot,
      price_cents_snapshot: d.priceCentsSnapshot,
      duration_minutes_snapshot: d.durationMinutesSnapshot,
      status,
      source: "booking_page",
    })
    .select("id, status")
    .single();

  if (error || !appointment) {
    // Unique constraint violation = slot taken by concurrent booking
    if (error?.code === "23P01" || error?.code === "23505") {
      return { ok: false, error: { type: "SLOT_TAKEN" } };
    }
    return { ok: false, error: { type: "UNKNOWN" } };
  }

  // Fire-and-forget email notifications
  void (async () => {
    try {
      const { data: prof } = await supabase
        .from("establishment_members")
        .select("display_name")
        .eq("id", d.professionalId)
        .maybeSingle();

      const sharedParams: AppointmentEmailParams = {
        type: status === "confirmed" ? "booking_confirmed" : "booking_received",
        clientName: d.clientName,
        clientEmail: d.clientEmail,
        clientPhone: d.clientPhone,
        serviceName: d.serviceNameSnapshot,
        professionalName: prof?.display_name ?? null,
        establishmentName: establishment.name,
        establishmentSlug: establishment.slug,
        startsAt: new Date(d.startsAt),
        endsAt: new Date(d.endsAt),
        priceCents: d.priceCentsSnapshot,
      };

      await sendAppointmentEmail(d.clientEmail, sharedParams);

      const adminClient = createAdminClient();
      const { data: ownerAuth } = await adminClient.auth.admin.getUserById(establishment.owner_id);
      if (ownerAuth.user?.email) {
        await sendAppointmentEmail(ownerAuth.user.email, {
          ...sharedParams,
          type: "owner_new_booking",
        });
      }
    } catch (err) {
      console.error("[Email] Booking notification error:", err);
    }
  })();

  return { ok: true, data: { appointmentId: appointment.id, status: appointment.status } };
}
