import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database.types";

export type AdminEstablishment = Tables<"establishments">;
export type AdminService = Tables<"services">;
export type AdminAppointment = Pick<
  Tables<"appointments">,
  | "id"
  | "starts_at"
  | "ends_at"
  | "client_name"
  | "client_email"
  | "client_phone"
  | "client_notes"
  | "service_name_snapshot"
  | "price_cents_snapshot"
  | "duration_minutes_snapshot"
  | "status"
  | "created_at"
  | "professional_id"
>;

export async function getAdminContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: establishment } = await supabase
    .from("establishments")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!establishment) redirect("/cadastro/estabelecimento");

  return { userId: user.id, establishment: establishment as AdminEstablishment };
}

export async function getDashboardData(establishmentId: string) {
  const supabase = await createClient();
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const weekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7).toISOString();

  const [todayRes, pendingRes, monthRes, upcomingRes] = await Promise.all([
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("establishment_id", establishmentId)
      .gte("starts_at", todayStart)
      .lt("starts_at", todayEnd)
      .not("status", "eq", "cancelled"),

    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("establishment_id", establishmentId)
      .eq("status", "pending"),

    supabase
      .from("appointments")
      .select("price_cents_snapshot")
      .eq("establishment_id", establishmentId)
      .gte("starts_at", monthStart)
      .in("status", ["confirmed", "completed"]),

    supabase
      .from("appointments")
      .select(
        "id, starts_at, ends_at, client_name, client_phone, service_name_snapshot, price_cents_snapshot, duration_minutes_snapshot, status"
      )
      .eq("establishment_id", establishmentId)
      .gte("starts_at", todayStart)
      .lt("starts_at", weekEnd)
      .in("status", ["pending", "confirmed"])
      .order("starts_at")
      .limit(10),
  ]);

  const monthlyRevenue = (monthRes.data ?? []).reduce((sum, a) => sum + a.price_cents_snapshot, 0);

  return {
    todayCount: todayRes.count ?? 0,
    pendingCount: pendingRes.count ?? 0,
    monthlyRevenue,
    monthlyCount: monthRes.data?.length ?? 0,
    upcoming: upcomingRes.data ?? [],
  };
}

export async function getAppointmentsAdmin(
  establishmentId: string,
  statusFilter?: string
): Promise<AdminAppointment[]> {
  const supabase = await createClient();

  let query = supabase
    .from("appointments")
    .select(
      "id, starts_at, ends_at, client_name, client_email, client_phone, client_notes, " +
        "service_name_snapshot, price_cents_snapshot, duration_minutes_snapshot, status, created_at, professional_id"
    )
    .eq("establishment_id", establishmentId)
    .order("starts_at", { ascending: false })
    .limit(100);

  if (statusFilter && statusFilter !== "all") {
    query = query.eq(
      "status",
      statusFilter as
        | "pending"
        | "confirmed"
        | "cancelled"
        | "no_show"
        | "completed"
        | "rescheduled"
    );
  }

  const { data } = await query;
  return (data ?? []) as unknown as AdminAppointment[];
}

export async function getServicesAdmin(establishmentId: string): Promise<AdminService[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("services")
    .select("*")
    .eq("establishment_id", establishmentId)
    .order("position");
  return (data ?? []) as AdminService[];
}
