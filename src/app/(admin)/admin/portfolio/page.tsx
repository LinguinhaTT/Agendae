import type { Metadata } from "next";
import { PortfolioManager } from "@/components/admin/portfolio-manager";
import { getAdminContext } from "@/lib/data/admin";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Portfólio" };

export default async function PortfolioPage() {
  const { establishment } = await getAdminContext();
  const supabase = await createClient();

  const { data: items } = await supabase
    .from("portfolio_items")
    .select("id, image_url, title, is_featured")
    .eq("establishment_id", establishment.id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black">Portfólio</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Fotos do seu trabalho exibidas na página pública.
        </p>
      </div>

      <PortfolioManager establishmentId={establishment.id} initialItems={items ?? []} />
    </div>
  );
}
