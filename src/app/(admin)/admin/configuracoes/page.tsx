import type { Metadata } from "next";
import { EstablishmentImagesUpload } from "@/components/admin/establishment-images-upload";
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

      {/* Logo e capa */}
      <div className="rounded-xl border border-white/5 bg-card p-6 mb-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Identidade visual
        </h2>
        <EstablishmentImagesUpload
          establishmentId={establishment.id}
          currentLogoUrl={establishment.logo_url}
          currentCoverUrl={establishment.cover_url}
        />
      </div>

      <SettingsForm establishment={establishment} />
    </div>
  );
}
