import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { ShareBookingButton } from "@/components/admin/share-booking-button";
import { getAdminContext } from "@/lib/data/admin";

export const metadata: Metadata = {
  title: { template: "%s — Agendaê Admin", default: "Agendaê Admin" },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { establishment } = await getAdminContext();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AdminSidebar establishmentName={establishment.name} slug={establishment.slug} />

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between gap-3 px-4 h-14 border-b border-white/5 bg-card shrink-0">
          <p className="font-bold text-sm truncate">{establishment.name}</p>
          <ShareBookingButton slug={establishment.slug} establishmentName={establishment.name} />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">{children}</main>
      </div>
    </div>
  );
}
