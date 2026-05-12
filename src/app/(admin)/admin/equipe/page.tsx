import type { Metadata } from "next";
import { EquipeManager } from "@/components/admin/equipe-manager";
import { getAdminContext } from "@/lib/data/admin";
import { getTeamMembers } from "@/lib/data/team";

export const metadata: Metadata = { title: "Equipe" };

export default async function EquipePage() {
  const { establishment } = await getAdminContext();
  const members = await getTeamMembers(establishment.id);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <EquipeManager initialMembers={members} />
    </div>
  );
}
