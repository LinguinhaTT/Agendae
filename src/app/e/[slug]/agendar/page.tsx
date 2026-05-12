import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookingWizard } from "@/components/booking/wizard";
import { getEstablishmentBySlug } from "@/lib/data/establishment";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ service?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getEstablishmentBySlug(slug);
  if (!data) return {};
  return { title: `Agendar — ${data.establishment.name}` };
}

export default async function AgendarPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { service: preSelectedServiceId } = await searchParams;

  const data = await getEstablishmentBySlug(slug);
  if (!data) notFound();

  const { establishment, services, members } = data;

  if (services.length === 0) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center px-4">
        <div className="text-center space-y-3 max-w-sm">
          <p className="text-2xl">📋</p>
          <h1 className="text-xl font-bold">Nenhum serviço disponível</h1>
          <p className="text-sm text-muted-foreground">
            {establishment.name} ainda não configurou seus serviços.
          </p>
        </div>
      </div>
    );
  }

  return (
    <BookingWizard
      establishment={{
        id: establishment.id,
        name: establishment.name,
        slug,
        logo_url: establishment.logo_url,
        auto_confirm: establishment.auto_confirm,
        buffer_minutes: establishment.buffer_minutes,
        booking_advance_min_hours: establishment.booking_advance_min_hours,
        booking_advance_max_days: establishment.booking_advance_max_days,
      }}
      services={services.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        category: s.category,
        duration_minutes: s.duration_minutes,
        price_cents: s.price_cents,
        image_url: s.image_url,
      }))}
      allMembers={members.map((m) => ({
        id: m.id,
        display_name: m.display_name,
        bio: m.bio,
        specialties: m.specialties,
      }))}
      preSelectedServiceId={preSelectedServiceId}
    />
  );
}
