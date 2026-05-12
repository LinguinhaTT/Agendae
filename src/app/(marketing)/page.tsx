import {
  ArrowRight,
  BarChart3,
  Bell,
  Calendar,
  Check,
  Clock,
  Shield,
  Smartphone,
  Star,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    icon: Calendar,
    title: "Agendamento 24/7",
    description:
      "Seus clientes agendam a qualquer hora, pelo celular, sem precisar entrar em contato via WhatsApp.",
  },
  {
    icon: Bell,
    title: "Lembretes automáticos",
    description:
      "Envio automático de confirmação, lembrete 24h e 2h antes. Reduza faltas em até 70%.",
  },
  {
    icon: BarChart3,
    title: "Relatórios e métricas",
    description:
      "Acompanhe faturamento, taxa de ocupação, serviços mais populares e histórico de clientes.",
  },
  {
    icon: Star,
    title: "Avaliações integradas",
    description:
      "Colete avaliações automaticamente após cada atendimento e mostre sua reputação publicamente.",
  },
  {
    icon: Smartphone,
    title: "Link de agendamento",
    description:
      "Página pública personalizada com seu link único. Coloque na bio do Instagram e pronto.",
  },
  {
    icon: Shield,
    title: "Sem duplo agendamento",
    description:
      "Bloqueio automático de horários já ocupados. Nunca mais dois clientes no mesmo horário.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Crie sua conta grátis",
    description: "Cadastre seu estabelecimento em menos de 2 minutos. Sem cartão de crédito.",
  },
  {
    number: "02",
    title: "Configure seus serviços",
    description: "Adicione seus serviços, preços, duração e horários de atendimento.",
  },
  {
    number: "03",
    title: "Compartilhe seu link",
    description: "Coloque seu link de agendamento na bio do Instagram, WhatsApp e onde quiser.",
  },
  {
    number: "04",
    title: "Receba agendamentos",
    description: "Clientes agendam sozinhos e você recebe notificação. Simples assim.",
  },
];

const PLANS = [
  {
    name: "Grátis",
    price: "R$ 0",
    period: "/mês",
    description: "Para começar a testar",
    features: [
      "1 profissional",
      "30 agendamentos/mês",
      "Página de agendamento",
      "Lembretes por email",
    ],
    cta: "Começar grátis",
    href: "/cadastro",
    highlight: false,
  },
  {
    name: "Pro",
    price: "R$ 49",
    period: "/mês",
    description: "Para profissionais autônomos",
    features: [
      "Até 5 profissionais",
      "Agendamentos ilimitados",
      "Lembretes por WhatsApp",
      "Portfólio e avaliações",
      "Relatórios básicos",
      "Suporte prioritário",
    ],
    cta: "Assinar Pro",
    href: "/cadastro",
    highlight: true,
  },
  {
    name: "Business",
    price: "R$ 149",
    period: "/mês",
    description: "Para estúdios e equipes",
    features: [
      "Profissionais ilimitados",
      "Agendamentos ilimitados",
      "Todos os canais de notificação",
      "Portfólio e avaliações",
      "Relatórios avançados",
      "API e integrações",
      "Subdomínio personalizado",
    ],
    cta: "Assinar Business",
    href: "/cadastro",
    highlight: false,
  },
];

const TESTIMONIALS = [
  {
    name: "Rafael Souza",
    role: "Tatuador • Studio RS Ink",
    quote:
      "Antes eu perdia horas no WhatsApp confirmando agendamento. Hoje minha agenda se preenche sozinha.",
    rating: 5,
  },
  {
    name: "Camila Torres",
    role: "Manicure • Nail Art CT",
    quote:
      "O link de agendamento na bio do Instagram mudou meu negócio. Triplicou meu número de clientes.",
    rating: 5,
  },
  {
    name: "Lucas Mendes",
    role: "Barbeiro • Barbearia Corte Certo",
    quote: "As faltas reduziram demais com os lembretes automáticos. Meu faturamento aumentou 40%.",
    rating: 5,
  },
];

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center gradient-mesh">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -20%, oklch(0.65 0.2 264 / 30%), transparent)",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 py-24 text-center">
          <Badge variant="secondary" className="mb-6 text-xs px-3 py-1">
            <Zap className="mr-1 h-3 w-3" />
            Agendamento online inteligente
          </Badge>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-[1.05]">
            Chega de <span className="text-primary">WhatsApp</span>
            <br />
            para agendar
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Plataforma de agendamento online para tatuadores, barbeiros, salões de beleza e
            profissionais de estética. Seus clientes agendam em 3 cliques, a qualquer hora.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
            <Button asChild size="xl" className="font-semibold">
              <Link href="/cadastro">
                Começar grátis agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="xl" variant="outline">
              <Link href="#como-funciona">Ver como funciona</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 text-center">
            {[
              { value: "2 min", label: "para configurar" },
              { value: "70%", label: "menos faltas" },
              { value: "24/7", label: "agendamentos" },
              { value: "grátis", label: "para começar" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-black text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof bar */}
      <div className="border-y border-white/5 bg-white/[0.02] py-5">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span>+500 profissionais ativos</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span>+10.000 agendamentos/mês</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-primary fill-primary" />
            <span>4.9/5 de avaliação média</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span>2 minutos para configurar</span>
          </div>
        </div>
      </div>

      {/* Features */}
      <section id="funcionalidades" className="py-24 max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Funcionalidades
          </Badge>
          <h2 className="text-3xl md:text-5xl font-black mb-4">Tudo que você precisa</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Do agendamento ao financeiro, o InkBook cobre todos os aspectos do seu negócio.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="glass-card p-6 hover:border-primary/30 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-24 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              Como funciona
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black mb-4">Configure em 4 passos</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Em menos de 2 minutos você já tem sua página de agendamento funcionando.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <div key={step.number} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-white/10 z-0" />
                )}
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                    <span className="text-2xl font-black text-primary">{step.number}</span>
                  </div>
                  <h3 className="font-bold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Depoimentos
          </Badge>
          <h2 className="text-3xl md:text-5xl font-black mb-4">Quem já usa, recomenda</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="glass-card p-6">
              <div className="flex gap-0.5 mb-4">
                {[1, 2, 3, 4, 5].slice(0, t.rating).map((n) => (
                  <Star
                    key={`star-${t.name}-${n}`}
                    className="h-4 w-4 text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4 italic">
                &quot;{t.quote}&quot;
              </p>
              <div>
                <p className="font-bold text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing preview */}
      <section id="precos" className="py-24 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              Preços
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black mb-4">Simples e transparente</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Comece grátis. Faça upgrade quando precisar. Sem fidelidade.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`glass-card p-6 flex flex-col ${
                  plan.highlight ? "border-primary/50 ring-1 ring-primary/30 relative" : ""
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground text-xs">
                      Mais popular
                    </Badge>
                  </div>
                )}
                <div className="mb-6">
                  <p className="font-bold text-lg">{plan.name}</p>
                  <p className="text-xs text-muted-foreground mb-3">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button asChild variant={plan.highlight ? "default" : "outline"} className="w-full">
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Precisa de mais?{" "}
            <Link href="/precos" className="text-primary hover:underline">
              Ver planos completos
            </Link>
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 max-w-6xl mx-auto px-4 text-center">
        <div
          className="glass-card p-12 md:p-16 relative overflow-hidden"
          style={{
            background:
              "radial-gradient(ellipse 100% 80% at 50% 100%, oklch(0.65 0.2 264 / 15%), transparent)",
          }}
        >
          <h2 className="text-3xl md:text-5xl font-black mb-4">
            Pronto para parar de
            <br />
            perder clientes?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Crie sua conta grátis agora e tenha sua página de agendamento online em menos de 2
            minutos.
          </p>
          <Button asChild size="xl" className="font-semibold">
            <Link href="/cadastro">
              Criar conta grátis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            Sem cartão de crédito. Sem fidelidade. Cancele quando quiser.
          </p>
        </div>
      </section>
    </div>
  );
}
