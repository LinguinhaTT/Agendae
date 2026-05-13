import { AtSign, Clock, Globe, MapPin, Phone, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/establishment/fade-in";
import { FloatingActions } from "@/components/establishment/floating-actions";
import { Badge } from "@/components/ui/badge";
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
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function ServiceCard({ service, slug }: { service: PublicService; slug: string }) {
  return (
    <Link
      href={`/e/${slug}/agendar?service=${service.id}`}
      className="group relative flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-card/60 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {service.image_url ? (
        <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
          <Image
            src={service.image_url}
            alt={service.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="64px"
          />
        </div>
      ) : (
        <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-xl font-black text-primary">{service.name.charAt(0)}</span>
        </div>
      )}

      <div className="flex-1 min-w-0 relative z-10">
        <p className="font-bold text-sm group-hover:text-primary transition-colors truncate">
          {service.name}
        </p>
        {service.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{service.description}</p>
        )}
        <div className="flex items-center gap-1.5 mt-1.5">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {formatDuration(service.duration_minutes)}
          </span>
        </div>
      </div>

      <div className="shrink-0 text-right relative z-10">
        <p className="font-black text-sm text-primary">{formatPrice(service.price_cents)}</p>
        <div className="mt-1 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center ml-auto group-hover:bg-primary group-hover:text-white transition-all duration-300">
          <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current" aria-hidden="true">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

const WEEKDAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default async function EstablishmentPage({ params }: Props) {
  const { slug } = await params;
  const data = await getEstablishmentBySlug(slug);

  if (!data) notFound();

  const {
    establishment,
    members,
    services,
    portfolio,
    reviews,
    avgRating,
    totalReviews,
    workingHours,
  } = data;

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
    <div className="min-h-screen bg-background pb-32">
      {/* Cover */}
      <div className="relative h-56 md:h-80 overflow-hidden">
        {establishment.cover_url ? (
          <Image
            src={establishment.cover_url}
            alt={`Capa de ${establishment.name}`}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <FadeIn delay={0.05}>
          <div className="relative -mt-20 mb-8">
            <div className="flex items-end gap-4">
              {/* Logo */}
              <div className="relative w-28 h-28 rounded-2xl border-4 border-background overflow-hidden bg-card shrink-0 shadow-2xl">
                {establishment.logo_url ? (
                  <Image
                    src={establishment.logo_url}
                    alt={`Logo de ${establishment.name}`}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <span className="text-3xl font-black text-primary">
                      {establishment.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 pb-1">
                <Badge
                  variant="secondary"
                  className="text-xs mb-2 bg-primary/10 text-primary border-primary/20"
                >
                  {categoryLabel}
                </Badge>
                <h1 className="text-2xl md:text-3xl font-black leading-tight">
                  {establishment.name}
                </h1>
                {totalReviews > 0 && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <StarRating rating={avgRating} />
                    <span className="font-bold text-sm">{avgRating.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">({totalReviews})</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact pills */}
            <div className="flex flex-wrap gap-2 mt-4">
              {hasAddress && (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-white/5 rounded-full px-3 py-1.5">
                  <MapPin className="h-3 w-3 shrink-0 text-primary" />
                  {[establishment.address_neighborhood, establishment.address_city]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              )}
              {establishment.phone && (
                <a
                  href={`tel:${establishment.phone}`}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground bg-white/5 hover:bg-white/10 rounded-full px-3 py-1.5 transition-colors"
                >
                  <Phone className="h-3 w-3 shrink-0 text-primary" />
                  {establishment.phone}
                </a>
              )}
              {establishment.instagram && (
                <a
                  href={`https://instagram.com/${establishment.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-muted-foreground bg-white/5 hover:bg-white/10 rounded-full px-3 py-1.5 transition-colors"
                >
                  <AtSign className="h-3 w-3 shrink-0 text-primary" />
                  {establishment.instagram}
                </a>
              )}
              {establishment.website && (
                <a
                  href={establishment.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-muted-foreground bg-white/5 hover:bg-white/10 rounded-full px-3 py-1.5 transition-colors"
                >
                  <Globe className="h-3 w-3 shrink-0 text-primary" />
                  Site
                </a>
              )}
            </div>

            {establishment.description && (
              <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                {establishment.description}
              </p>
            )}
          </div>
        </FadeIn>

        {/* Services */}
        {services.length > 0 && (
          <FadeIn delay={0.1} className="mb-12">
            <h2 className="text-lg font-black mb-5 flex items-center gap-2">
              <span className="w-1 h-5 bg-primary rounded-full inline-block" />
              Serviços
            </h2>
            <div className="space-y-10">
              {Object.entries(servicesByCategory).map(([category, items]) => (
                <div key={category}>
                  {Object.keys(servicesByCategory).length > 1 && (
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                      {category}
                    </p>
                  )}
                  <StaggerChildren className="space-y-2.5">
                    {items.map((service) => (
                      <StaggerItem key={service.id}>
                        <ServiceCard service={service} slug={slug} />
                      </StaggerItem>
                    ))}
                  </StaggerChildren>
                </div>
              ))}
            </div>
          </FadeIn>
        )}

        {/* Team */}
        {members.length > 0 && (
          <FadeIn className="mb-12">
            <h2 className="text-lg font-black mb-5 flex items-center gap-2">
              <span className="w-1 h-5 bg-primary rounded-full inline-block" />
              Profissionais
            </h2>
            <StaggerChildren className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {members.map((member) => (
                <StaggerItem key={member.id}>
                  <div className="group text-center p-5 rounded-2xl border border-white/5 bg-card/60 hover:border-primary/20 hover:bg-primary/5 transition-all duration-300">
                    <div className="relative w-16 h-16 rounded-full mx-auto mb-3 overflow-hidden">
                      {member.avatar_url ? (
                        <Image
                          src={member.avatar_url}
                          alt={member.display_name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                          <span className="text-xl font-black text-primary">
                            {member.display_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="font-bold text-sm group-hover:text-primary transition-colors">
                      {member.display_name}
                    </p>
                    {member.bio && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {member.bio}
                      </p>
                    )}
                    {member.specialties && member.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1 justify-center mt-2">
                        {member.specialties.slice(0, 2).map((spec) => (
                          <Badge
                            key={spec}
                            variant="secondary"
                            className="text-xs bg-primary/10 text-primary border-none"
                          >
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </FadeIn>
        )}

        {/* Portfolio */}
        {portfolio.length > 0 && (
          <FadeIn className="mb-12">
            <h2 className="text-lg font-black mb-5 flex items-center gap-2">
              <span className="w-1 h-5 bg-primary rounded-full inline-block" />
              Portfólio
            </h2>
            <div className="grid grid-cols-3 gap-1.5">
              {portfolio.map((item, i) => (
                <div
                  key={item.id}
                  className={`relative rounded-xl overflow-hidden bg-card group ${
                    i === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"
                  }`}
                >
                  <Image
                    src={item.thumbnail_url ?? item.image_url}
                    alt={item.title ?? "Portfólio"}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 33vw, 200px"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  {item.is_featured && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-yellow-400/90 backdrop-blur-sm rounded-full p-1">
                        <Star className="h-3 w-3 text-yellow-900 fill-yellow-900" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </FadeIn>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <FadeIn className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-lg font-black flex items-center gap-2">
                <span className="w-1 h-5 bg-primary rounded-full inline-block" />
                Avaliações
              </h2>
              <div className="flex items-center gap-1.5 ml-1">
                <StarRating rating={avgRating} size="lg" />
                <span className="font-black text-lg">{avgRating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">({totalReviews})</span>
              </div>
            </div>

            <StaggerChildren className="space-y-3">
              {reviews.map((review) => (
                <StaggerItem key={review.id}>
                  <div className="p-4 rounded-2xl border border-white/5 bg-card/60 hover:border-white/10 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">
                            {review.client_name?.charAt(0).toUpperCase() ?? "C"}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-semibold">{review.client_name ?? "Cliente"}</p>
                          <StarRating rating={review.rating} />
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                        &ldquo;{review.comment}&rdquo;
                      </p>
                    )}
                    {review.owner_response && (
                      <div className="mt-3 pl-3 border-l-2 border-primary/40 bg-primary/5 rounded-r-lg py-2 pr-2">
                        <p className="text-xs font-semibold text-primary mb-0.5">
                          Resposta do estabelecimento
                        </p>
                        <p className="text-xs text-muted-foreground">{review.owner_response}</p>
                      </div>
                    )}
                  </div>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </FadeIn>
        )}

        {/* Working Hours */}
        {workingHours.length > 0 && (
          <FadeIn className="mb-12">
            <h2 className="text-lg font-black mb-5 flex items-center gap-2">
              <span className="w-1 h-5 bg-primary rounded-full inline-block" />
              Horário de funcionamento
            </h2>
            <div className="rounded-2xl border border-white/5 bg-card/60 overflow-hidden">
              {workingHours.map(({ weekday, start_time, end_time }, i) => (
                <div
                  key={weekday}
                  className={`flex items-center justify-between px-5 py-3 text-sm ${
                    i < workingHours.length - 1 ? "border-b border-white/5" : ""
                  }`}
                >
                  <span className="text-muted-foreground font-medium w-10">
                    {WEEKDAY_NAMES[weekday]}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="font-semibold tabular-nums">
                      {start_time} – {end_time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        )}

        {/* Address */}
        {hasAddress && (
          <FadeIn className="mb-12">
            <h2 className="text-lg font-black mb-5 flex items-center gap-2">
              <span className="w-1 h-5 bg-primary rounded-full inline-block" />
              Localização
            </h2>
            <div className="rounded-2xl border border-white/5 bg-card/60 p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">
                  {[establishment.address_street, establishment.address_number]
                    .filter(Boolean)
                    .join(", ")}
                  {establishment.address_complement && ` — ${establishment.address_complement}`}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
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
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-3 font-semibold"
                >
                  Ver no Google Maps →
                </a>
              </div>
            </div>
          </FadeIn>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-white/5 py-6 text-center">
        <p className="text-xs text-muted-foreground">
          Agendamento por{" "}
          <Link href="/" className="text-primary hover:underline font-semibold">
            Agendaê
          </Link>
        </p>
      </div>

      {/* Floating actions */}
      <FloatingActions
        slug={slug}
        phone={establishment.phone}
        whatsapp={establishment.whatsapp}
        establishmentName={establishment.name}
      />
    </div>
  );
}
