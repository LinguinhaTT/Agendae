import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database.types";

export type PublicEstablishment = Tables<"establishments">;

export type PublicMember = Pick<
  Tables<"establishment_members">,
  "id" | "display_name" | "bio" | "specialties" | "is_visible_public" | "position" | "whatsapp"
> & { avatar_url?: string | null };

export type PublicService = Pick<
  Tables<"services">,
  | "id"
  | "name"
  | "description"
  | "category"
  | "duration_minutes"
  | "price_cents"
  | "image_url"
  | "position"
>;

export type PublicPortfolioItem = Pick<
  Tables<"portfolio_items">,
  "id" | "image_url" | "thumbnail_url" | "title" | "tags" | "is_featured"
>;

export type PublicReview = Pick<
  Tables<"reviews">,
  "id" | "rating" | "comment" | "owner_response" | "owner_responded_at" | "created_at"
> & { client_name?: string };

export interface WorkingHours {
  weekday: number;
  start_time: string;
  end_time: string;
}

export interface EstablishmentPageData {
  establishment: PublicEstablishment;
  members: PublicMember[];
  services: PublicService[];
  portfolio: PublicPortfolioItem[];
  reviews: PublicReview[];
  workingHours: WorkingHours[];
  avgRating: number;
  totalReviews: number;
}

export async function getEstablishmentBySlug(slug: string): Promise<EstablishmentPageData | null> {
  const supabase = await createClient();

  const { data: establishment, error } = await supabase
    .from("establishments")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !establishment) return null;

  const [membersResult, servicesResult, portfolioResult, reviewsResult] = await Promise.all([
    supabase
      .from("establishment_members")
      .select("id, display_name, bio, specialties, whatsapp, is_visible_public, position")
      .eq("establishment_id", establishment.id)
      .eq("is_visible_public", true)
      .eq("is_active", true)
      .order("position"),

    supabase
      .from("services")
      .select("id, name, description, category, duration_minutes, price_cents, image_url, position")
      .eq("establishment_id", establishment.id)
      .eq("is_active", true)
      .order("position"),

    supabase
      .from("portfolio_items")
      .select("id, image_url, thumbnail_url, title, tags, is_featured")
      .eq("establishment_id", establishment.id)
      .order("is_featured", { ascending: false })
      .order("position")
      .limit(24),

    supabase
      .from("reviews")
      .select("id, rating, comment, owner_response, owner_responded_at, created_at")
      .eq("establishment_id", establishment.id)
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  // Fetch working hours using member IDs already retrieved
  const memberIds = (membersResult.data ?? []).map((m) => m.id);
  const hoursResult =
    memberIds.length > 0
      ? await supabase
          .from("availability_rules")
          .select("weekday, start_time, end_time")
          .eq("is_active", true)
          .in("professional_id", memberIds)
      : { data: [] };

  const reviews = (reviewsResult.data ?? []) as PublicReview[];
  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0;

  // Aggregate: earliest start and latest end per weekday
  const byWeekday = new Map<number, { start: string; end: string }>();
  for (const rule of hoursResult.data ?? []) {
    const existing = byWeekday.get(rule.weekday);
    if (!existing) {
      byWeekday.set(rule.weekday, { start: rule.start_time, end: rule.end_time });
    } else {
      if (rule.start_time < existing.start) existing.start = rule.start_time;
      if (rule.end_time > existing.end) existing.end = rule.end_time;
    }
  }
  const workingHours: WorkingHours[] = Array.from(byWeekday.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([weekday, { start, end }]) => ({
      weekday,
      start_time: start.slice(0, 5),
      end_time: end.slice(0, 5),
    }));

  return {
    establishment,
    members: (membersResult.data ?? []) as PublicMember[],
    services: (servicesResult.data ?? []) as PublicService[],
    portfolio: (portfolioResult.data ?? []) as PublicPortfolioItem[],
    reviews,
    workingHours,
    avgRating,
    totalReviews,
  };
}
