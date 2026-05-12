import {
  AtSign,
  CalendarPlus,
  ChevronRight,
  Clock,
  Globe,
  MapPin,
  Phone,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ESTABLISHMENT_CATEGORIES } from "@/lib/constants";
import { getEstablishmentBySlug, type PublicService } from "@/lib/data/establishment";
import { formatDuration, formatPrice } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string }>;
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const iconClass = size === "lg" ? "h-5 w-5" : "h-3.5 w-3.5";

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          viewBox="0 0 24 24"
          className={`${iconClass} ${
            n <= full
              ? "text-yellow-400 fill-yellow-400"
              : n === full + 1 && half
                ? "text-yellow-400"
                : "text-muted-foreground/30 fill-muted-foreground/30"
          }`}
          aria-hidden="true"
        >
          {n === full + 1 && half ? (
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          ) : (
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          )}
        </svg>
      ))}
    </div>
  );
}

function ServiceCard({ service, slug }: { service: PublicService; slug: string }) {
  return (
    <Link
      href={`/e/${slug}/agendar?service=${service.id}`}
      className="group flex items-center gap-4 p-4 rounded-xl border border-white/5 hover:border-primary/30 hover:bg-white/[0.02] transition-all"
    >
      {service.image_url && (
        <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
          <Image
            src={service.image_url}
            alt={service.name}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
          {service.name}
        </p>
        {service.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{service.description}</p>
        )}
        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDuration(service.duration_minutes)}
          </span>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className="font-bold text-sm text-primary">{formatPrice(service.price_cents)}</p>
        <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto mt-1 group-hover:text-primary transition-colors" />
      </div>
    </Link>
  );
}

export default async function EstablishmentPage({ params }: Props) {
  const { slug } = await params;
  const data = await getEstablishmentBySlug(slug);

  if (!data) notFound();

  const { establishment, members, services, portfolio, reviews, avgRating, totalReviews } = data;

  const categoryLabel =
    ESTABLISHMENT_CATEGORIES.find((c) => c.value === establishment.category)?.label ??
    establishment.category;

  const addressParts = [
    establishment.address_street,
    establishment.address_number,
    establishment.address_neighborhood,
    establishment.address_city,
    establishment.address_state,
  ].filter(Boolean);

  const hasAddress = addressParts.length > 0;

  const servicesByCategory = services.reduce<Record<string, PublicService[]>>((acc, svc) => {
    const cat = svc.category ?? "Serviços";
    if (!acc[cat]) acc[cat] = [];
    acc[cat]!.push(svc);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background">
      {/* Cover */}
      <div className="relative h-52 md:h-72 bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden">
        {establishment.cover_url && (
          <Image
            src={establishment.cover_url}
            alt={`Capa de ${establishment.name}`}
            fill
            className="object-cover opacity-60"
            priority
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      <div className="max-w-3xl mx-auto px-4">
        {/* Header card */}
        <div className="relative -mt-16 mb-8">
          <div className="flex items-end gap-4">
            {/* Logo */}
            <div className="relative w-24 h-24 rounded-2xl border-4 border-background overflow-hidden bg-card shrink-0 shadow-xl">
              {establishment.logo_url ? (
                <Image
                  src={establishment.logo_url}
                  alt={`Logo de ${establishment.name}`}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-black text-primary">
                    {establishment.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Name + badge */}
            <div className="flex-1 min-w-0 pb-1">
              <Badge variant="secondary" className="text-xs mb-1">
                {categoryLabel}
              </Badge>
              <h1 className="text-2xl md:text-3xl font-black leading-tight truncate">
                {establishment.name}
              </h1>
            </div>
          </div>

          {/* Rating row */}
          {totalReviews > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <StarRating rating={avgRating} />
              <span className="font-bold text-sm">{avgRating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">
                ({totalReviews} {totalReviews === 1 ? "avaliação" : "avaliações"})
              </span>
            </div>
          )}

          {/* Info pills */}
          <div className="flex flex-wrap gap-2 mt-3">
            {hasAddress && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {[establishment.address_neighborhood, establishment.address_city]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            )}
            {establishment.phone && (
              <a
                href={`tel:${establishment.phone}`}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Phone className="h-3.5 w-3.5 shrink-0" />
                {establishment.phone}
              </a>
            )}
            {establishment.instagram && (
              <a
                href={`https://instagram.com/${establishment.instagram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <AtSign className="h-3.5 w-3.5 shrink-0" />
                {establishment.instagram}
              </a>
            )}
            {establishment.website && (
              <a
                href={establishment.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Globe className="h-3.5 w-3.5 shrink-0" />
                Site
              </a>
            )}
          </div>

          {/* Description */}
          {establishment.description && (
            <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
              {establishment.description}
            </p>
          )}
        </div>

        {/* Book CTA */}
        <div className="sticky top-0 z-10 py-3 bg-background/90 backdrop-blur-sm -mx-4 px-4 mb-8 border-b border-white/5">
          <Button asChild size="lg" className="w-full font-semibold">
            <Link href={`/e/${slug}/agendar`}>
              <CalendarPlus className="mr-2 h-5 w-5" />
              Agendar horário
            </Link>
          </Button>
        </div>

        {/* Services */}
        {services.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-bold mb-4">Serviços</h2>
            <div className="space-y-8">
              {Object.entries(servicesByCategory).map(([category, items]) => (
                <div key={category}>
                  {Object.keys(servicesByCategory).length > 1 && (
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      {category}
                    </p>
                  )}
                  <div className="space-y-2">
                    {items.map((service) => (
                      <ServiceCard key={service.id} service={service} slug={slug} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Team */}
        {members.length > 0 && (
          <>
            <Separator className="mb-10" />
            <section className="mb-10">
              <h2 className="text-lg font-bold mb-4">Profissionais</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {members.map((member) => (
                  <div key={member.id} className="text-center p-4 rounded-xl border border-white/5">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <span className="text-lg font-bold text-primary">
                        {member.display_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <p className="font-semibold text-sm">{member.display_name}</p>
                    {member.bio && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {member.bio}
                      </p>
                    )}
                    {member.specialties && member.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1 justify-center mt-2">
                        {member.specialties.slice(0, 2).map((spec) => (
                          <Badge key={spec} variant="secondary" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Portfolio */}
        {portfolio.length > 0 && (
          <>
            <Separator className="mb-10" />
            <section className="mb-10">
              <h2 className="text-lg font-bold mb-4">Portfólio</h2>
              <div className="grid grid-cols-3 gap-1.5">
                {portfolio.map((item) => (
                  <div
                    key={item.id}
                    className="relative aspect-square rounded-lg overflow-hidden bg-card"
                  >
                    <Image
                      src={item.thumbnail_url ?? item.image_url}
                      alt={item.title ?? "Portfólio"}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 33vw, 200px"
                    />
                    {item.is_featured && (
                      <div className="absolute top-1 right-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <>
            <Separator className="mb-10" />
            <section className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-lg font-bold">Avaliações</h2>
                <div className="flex items-center gap-1.5">
                  <StarRating rating={avgRating} size="lg" />
                  <span className="font-bold">{avgRating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">({totalReviews})</span>
                </div>
              </div>

              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="p-4 rounded-xl border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <StarRating rating={review.rating} />
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                    {review.owner_response && (
                      <div className="mt-3 pl-3 border-l-2 border-primary/30">
                        <p className="text-xs font-semibold text-primary mb-1">
                          Resposta do estabelecimento
                        </p>
                        <p className="text-xs text-muted-foreground">{review.owner_response}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Address */}
        {hasAddress && (
          <>
            <Separator className="mb-10" />
            <section className="mb-16">
              <h2 className="text-lg font-bold mb-4">Localização</h2>
              <div className="rounded-xl border border-white/5 p-4 flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">
                    {[establishment.address_street, establishment.address_number]
                      .filter(Boolean)
                      .join(", ")}
                    {establishment.address_complement && ` — ${establishment.address_complement}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {[
                      establishment.address_neighborhood,
                      establishment.address_city,
                      establishment.address_state,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  {establishment.address_zip && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      CEP {establishment.address_zip}
                    </p>
                  )}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressParts.join(", "))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline mt-2 inline-block"
                  >
                    Ver no Google Maps →
                  </a>
                </div>
              </div>
            </section>
          </>
        )}
      </div>

      {/* Powered by footer */}
      <div className="border-t border-white/5 py-6 text-center">
        <p className="text-xs text-muted-foreground">
          Agendamento por{" "}
          <Link href="/" className="text-primary hover:underline font-medium">
            InkBook
          </Link>
        </p>
      </div>
    </div>
  );
}
