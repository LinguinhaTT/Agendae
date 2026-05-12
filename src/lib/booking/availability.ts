import {
  addMinutes,
  areIntervalsOverlapping,
  eachMinuteOfInterval,
  format,
  getDay,
  parseISO,
  startOfDay,
} from "date-fns";
import { BOOKING_SLOT_INTERVAL_MINUTES } from "@/lib/constants";
import type { TimeSlot } from "@/types";

interface AvailabilityRule {
  weekday: number;
  start_time: string; // "09:00:00"
  end_time: string; // "18:00:00"
  is_active: boolean;
}

interface TimeOff {
  starts_at: string;
  ends_at: string;
}

interface ExistingAppointment {
  starts_at: string;
  ends_at: string;
  status: string;
}

interface GetSlotsParams {
  date: Date;
  durationMinutes: number;
  rules: AvailabilityRule[];
  timeOffs: TimeOff[];
  existingAppointments: ExistingAppointment[];
  bufferMinutes?: number;
  minAdvanceHours?: number;
}

export function getAvailableSlots({
  date,
  durationMinutes,
  rules,
  timeOffs,
  existingAppointments,
  bufferMinutes = 0,
  minAdvanceHours = 1,
}: GetSlotsParams): TimeSlot[] {
  const weekday = getDay(date); // 0=Sunday
  const dayRules = rules.filter((r) => r.weekday === weekday && r.is_active);

  if (dayRules.length === 0) return [];

  const now = new Date();
  const minStart = addMinutes(now, minAdvanceHours * 60);

  const slots: TimeSlot[] = [];

  for (const rule of dayRules) {
    const [sh, sm] = rule.start_time.split(":").map(Number);
    const [eh, em] = rule.end_time.split(":").map(Number);

    const dayStart = startOfDay(date);
    const windowStart = new Date(dayStart);
    windowStart.setHours(sh ?? 0, sm ?? 0, 0, 0);

    const windowEnd = new Date(dayStart);
    windowEnd.setHours(eh ?? 0, em ?? 0, 0, 0);

    // Generate candidate start times every BOOKING_SLOT_INTERVAL_MINUTES
    const candidates = eachMinuteOfInterval(
      { start: windowStart, end: addMinutes(windowEnd, -durationMinutes) },
      { step: BOOKING_SLOT_INTERVAL_MINUTES }
    );

    for (const candidateStart of candidates) {
      const candidateEnd = addMinutes(candidateStart, durationMinutes);

      // Slot must be in the future with min advance
      if (candidateStart < minStart) continue;

      // Slot must fit within the working window
      if (candidateEnd > windowEnd) continue;

      // Check time-off conflicts
      const blockedByTimeOff = timeOffs.some((to) =>
        areIntervalsOverlapping(
          { start: candidateStart, end: candidateEnd },
          { start: parseISO(to.starts_at), end: parseISO(to.ends_at) }
        )
      );

      if (blockedByTimeOff) continue;

      // Check existing appointment conflicts (including buffer)
      const blockedByAppointment = existingAppointments
        .filter((a) => a.status === "pending" || a.status === "confirmed")
        .some((a) => {
          const apptStart = parseISO(a.starts_at);
          const apptEnd = addMinutes(parseISO(a.ends_at), bufferMinutes);
          const candidateEndWithBuffer = addMinutes(candidateEnd, bufferMinutes);
          return areIntervalsOverlapping(
            { start: candidateStart, end: candidateEndWithBuffer },
            { start: addMinutes(apptStart, -bufferMinutes), end: apptEnd }
          );
        });

      if (blockedByAppointment) continue;

      slots.push({
        time: format(candidateStart, "HH:mm"),
        available: true,
        startsAt: candidateStart,
        endsAt: candidateEnd,
      });
    }
  }

  // Sort by time and remove duplicates
  return slots
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
    .filter(
      (slot, index, arr) =>
        index === 0 || slot.startsAt.getTime() !== arr[index - 1]!.startsAt.getTime()
    );
}

export function getAvailableDates({
  startDate,
  endDate,
  durationMinutes,
  rules,
  timeOffs,
  existingAppointments,
  bufferMinutes = 0,
  minAdvanceHours = 1,
}: Omit<GetSlotsParams, "date"> & { startDate: Date; endDate: Date }): Date[] {
  const availableDates: Date[] = [];

  const current = new Date(startDate);
  while (current <= endDate) {
    const slots = getAvailableSlots({
      date: current,
      durationMinutes,
      rules,
      timeOffs,
      existingAppointments,
      bufferMinutes,
      minAdvanceHours,
    });

    if (slots.length > 0) {
      availableDates.push(new Date(current));
    }

    current.setDate(current.getDate() + 1);
  }

  return availableDates;
}

export function isSlotStillAvailable({
  startsAt,
  endsAt,
  existingAppointments,
  bufferMinutes = 0,
}: {
  startsAt: Date;
  endsAt: Date;
  existingAppointments: ExistingAppointment[];
  bufferMinutes?: number;
}): boolean {
  return !existingAppointments
    .filter((a) => a.status === "pending" || a.status === "confirmed")
    .some((a) =>
      areIntervalsOverlapping(
        { start: startsAt, end: addMinutes(endsAt, bufferMinutes) },
        {
          start: addMinutes(parseISO(a.starts_at), -bufferMinutes),
          end: parseISO(a.ends_at),
        }
      )
    );
}
