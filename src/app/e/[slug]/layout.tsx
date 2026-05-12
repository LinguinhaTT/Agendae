import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ESTABLISHMENT_CATEGORIES } from "@/lib/constants";
import { getEstablishmentBySlug } from "@/lib/data/establishment";

interface Props {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getEstablishmentBySlug(slug);

  if (!data) return { title: "Estabelecimento não encontrado" };

  const { establishment } = data;
  const categoryLabel =
    ESTABLISHMENT_CATEGORIES.find((c) => c.value === establishment.category)?.label ??
    establishment.category;

  return {
    title: `${establishment.name} — ${categoryLabel}`,
    description:
      establishment.description ??
      `Agende online com ${establishment.name}. ${categoryLabel} em ${establishment.address_city ?? ""}.`,
    openGraph: {
      title: establishment.name,
      description: establishment.description ?? undefined,
      images: establishment.cover_url ? [establishment.cover_url] : [],
    },
  };
}

export default async function EstablishmentLayout({ children, params }: Props) {
  const { slug } = await params;
  const data = await getEstablishmentBySlug(slug);

  if (!data) notFound();

  return <>{children}</>;
}
