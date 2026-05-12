import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database.types";

export type TeamMember = Tables<"establishment_members">;
export type AvailabilityRule = Tables<"availability_rules">;
export type TimeOff = Tables<"time_off">;

export async function getTeamMembers(establishmentId: string): Promise<TeamMember[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("establishment_members")
    .select("*")
    .eq("establishment_id", establishmentId)
    .order("position");
  return (data ?? []) as TeamMember[];
}

export async function getMemberWithAvailability(memberId: string, establishmentId: string) {
  const supabase = await createClient();

  const [memberRes, rulesRes, timeOffRes] = await Promise.all([
    supabase
      .from("establishment_members")
      .select("*")
      .eq("id", memberId)
      .eq("establishment_id", establishmentId)
      .maybeSingle(),

    supabase
      .from("availability_rules")
      .select("*")
      .eq("professional_id", memberId)
      .order("weekday"),

    supabase
      .from("time_off")
      .select("*")
      .eq("professional_id", memberId)
      .gte("ends_at", new Date().toISOString())
      .order("starts_at"),
  ]);

  if (!memberRes.data) return null;

  return {
    member: memberRes.data as TeamMember,
    rules: (rulesRes.data ?? []) as AvailabilityRule[],
    timeOffs: (timeOffRes.data ?? []) as TimeOff[],
  };
}
