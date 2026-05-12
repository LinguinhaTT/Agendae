import type { Metadata } from "next";
import { SettingsForm } from "@/components/admin/settings-form";
import { getAdminContext } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Configurações" };

export default async function ConfiguracoesPage() {
  const { establishment } = await getAdminContext();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie as informações e preferências do seu negócio.
        </p>
      </div>

      <SettingsForm establishment={establishment} />
    </div>
  );
}
