import { addHours, setHours, startOfDay } from "date-fns";
import { describe, expect, it } from "vitest";
import { getAvailableSlots, isSlotStillAvailable } from "./availability";

// Use a Thursday far enough in the future so slots aren't filtered by minAdvanceHours
const today = startOfDay(new Date());
today.setFullYear(2027, 0, 14); // 2027-01-14 is a Thursday

const WEEKDAY_THURSDAY = 4;

const baseRules = [
  {
    weekday: WEEKDAY_THURSDAY,
    start_time: "09:00:00",
    end_time: "18:00:00",
    is_active: true,
  },
];

describe("getAvailableSlots", () => {
  it("returns slots within working hours", () => {
    const slots = getAvailableSlots({
      date: today,
      durationMinutes: 60,
      rules: baseRules,
      timeOffs: [],
      existingAppointments: [],
      minAdvanceHours: 0,
    });

    expect(slots.length).toBeGreaterThan(0);
    expect(slots[0]!.time).toBe("09:00");
    const lastSlot = slots[slots.length - 1]!;
    // Last 60min slot starting at 17:00
    expect(lastSlot.time).toBe("17:00");
  });

  it("returns empty array when no rules match the weekday", () => {
    const slots = getAvailableSlots({
      date: today,
      durationMinutes: 60,
      rules: [{ weekday: 0, start_time: "09:00:00", end_time: "18:00:00", is_active: true }], // Sunday
      timeOffs: [],
      existingAppointments: [],
      minAdvanceHours: 0,
    });

    expect(slots).toHaveLength(0);
  });

  it("blocks slots overlapping time-off", () => {
    const timeOffStart = setHours(new Date(today), 10);
    const timeOffEnd = setHours(new Date(today), 12);

    const slots = getAvailableSlots({
      date: today,
      durationMinutes: 60,
      rules: baseRules,
      timeOffs: [
        {
          starts_at: timeOffStart.toISOString(),
          ends_at: timeOffEnd.toISOString(),
        },
      ],
      existingAppointments: [],
      minAdvanceHours: 0,
    });

    const blockedTimes = ["10:00", "11:00"];
    for (const time of blockedTimes) {
      expect(slots.find((s) => s.time === time)).toBeUndefined();
    }
    expect(slots.find((s) => s.time === "09:00")).toBeDefined();
    expect(slots.find((s) => s.time === "12:00")).toBeDefined();
  });

  it("blocks slots overlapping existing appointments", () => {
    const apptStart = setHours(new Date(today), 10);
    const apptEnd = addHours(apptStart, 1);

    const slots = getAvailableSlots({
      date: today,
      durationMinutes: 60,
      rules: baseRules,
      timeOffs: [],
      existingAppointments: [
        {
          starts_at: apptStart.toISOString(),
          ends_at: apptEnd.toISOString(),
          status: "confirmed",
        },
      ],
      minAdvanceHours: 0,
    });

    expect(slots.find((s) => s.time === "10:00")).toBeUndefined();
    expect(slots.find((s) => s.time === "09:00")).toBeDefined();
    expect(slots.find((s) => s.time === "11:00")).toBeDefined();
  });

  it("respects buffer minutes between appointments", () => {
    const apptStart = setHours(new Date(today), 10);
    const apptEnd = addHours(apptStart, 1); // ends 11:00

    const slots = getAvailableSlots({
      date: today,
      durationMinutes: 60,
      rules: baseRules,
      timeOffs: [],
      existingAppointments: [
        {
          starts_at: apptStart.toISOString(),
          ends_at: apptEnd.toISOString(),
          status: "confirmed",
        },
      ],
      bufferMinutes: 15,
      minAdvanceHours: 0,
    });

    // 11:00 start would overlap buffer (ends 11:00 + 15min = 11:15, next starts at 11:00 conflicts)
    expect(slots.find((s) => s.time === "11:00")).toBeUndefined();
    expect(slots.find((s) => s.time === "11:15")).toBeDefined();
  });

  it("ignores cancelled appointments when checking availability", () => {
    const apptStart = setHours(new Date(today), 10);
    const apptEnd = addHours(apptStart, 1);

    const slots = getAvailableSlots({
      date: today,
      durationMinutes: 60,
      rules: baseRules,
      timeOffs: [],
      existingAppointments: [
        {
          starts_at: apptStart.toISOString(),
          ends_at: apptEnd.toISOString(),
          status: "cancelled",
        },
      ],
      minAdvanceHours: 0,
    });

    expect(slots.find((s) => s.time === "10:00")).toBeDefined();
  });

  it("slot end time must fit within working window", () => {
    const slots = getAvailableSlots({
      date: today,
      durationMinutes: 120, // 2h slots
      rules: baseRules, // window 09:00-18:00
      timeOffs: [],
      existingAppointments: [],
      minAdvanceHours: 0,
    });

    // Last 2h slot should start at 16:00 (ends 18:00)
    expect(slots[slots.length - 1]!.time).toBe("16:00");
    expect(slots.find((s) => s.time === "17:00")).toBeUndefined();
  });
});

describe("isSlotStillAvailable", () => {
  it("returns true when slot is free", () => {
    const result = isSlotStillAvailable({
      startsAt: setHours(new Date(today), 10),
      endsAt: setHours(new Date(today), 11),
      existingAppointments: [],
    });

    expect(result).toBe(true);
  });

  it("returns false when slot conflicts with existing appointment", () => {
    const apptStart = setHours(new Date(today), 10);
    const apptEnd = addHours(apptStart, 1);

    const result = isSlotStillAvailable({
      startsAt: apptStart,
      endsAt: apptEnd,
      existingAppointments: [
        {
          starts_at: apptStart.toISOString(),
          ends_at: apptEnd.toISOString(),
          status: "confirmed",
        },
      ],
    });

    expect(result).toBe(false);
  });

  it("returns true when conflicting appointment is cancelled", () => {
    const apptStart = setHours(new Date(today), 10);
    const apptEnd = addHours(apptStart, 1);

    const result = isSlotStillAvailable({
      startsAt: apptStart,
      endsAt: apptEnd,
      existingAppointments: [
        {
          starts_at: apptStart.toISOString(),
          ends_at: apptEnd.toISOString(),
          status: "cancelled",
        },
      ],
    });

    expect(result).toBe(true);
  });
});
