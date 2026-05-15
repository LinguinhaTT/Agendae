import type { Metadata } from "next";
import { ServicosManager } from "@/components/admin/servicos-manager";
import { getAdminContext, getServicesAdmin } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Serviços" };

export default async function ServicosPage() {
  const { establishment } = await getAdminContext();
  const services = await getServicesAdmin(establishment.id);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <ServicosManager initialServices={services} establishmentCategory={establishment.category} />
    </div>
  );
}
