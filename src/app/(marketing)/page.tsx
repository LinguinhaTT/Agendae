"use client";

import { motion, useInView } from "framer-motion";
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
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { Badge } from "@/components/ui/badge";

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
    role: "Tatuador",
    studio: "Studio RS Ink",
    initials: "RS",
    color: "from-blue-500 to-indigo-600",
    quote:
      "Antes eu perdia horas no WhatsApp confirmando agendamento. Hoje minha agenda se preenche sozinha.",
    rating: 5,
  },
  {
    name: "Camila Torres",
    role: "Manicure",
    studio: "Nail Art CT",
    initials: "CT",
    color: "from-pink-500 to-rose-600",
    quote:
      "O link de agendamento na bio do Instagram mudou meu negócio. Triplicou meu número de clientes.",
    rating: 5,
  },
  {
    name: "Lucas Mendes",
    role: "Barbeiro",
    studio: "Barbearia Corte Certo",
    initials: "LM",
    color: "from-emerald-500 to-teal-600",
    quote: "As faltas reduziram demais com os lembretes automáticos. Meu faturamento aumentou 40%.",
    rating: 5,
  },
];

function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{ duration: 0.55, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function HeroMockup() {
  return (
    <div className="relative w-full max-w-sm mx-auto lg:mx-0">
      {/* Glow behind the card */}
      <div className="absolute -inset-6 rounded-3xl bg-blue-500/10 blur-2xl" />
      <div className="absolute -inset-8 rounded-3xl bg-purple-500/8 blur-3xl" />

      {/* Main dashboard card */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        className="relative rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-4 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-white/40 font-medium">Hoje</p>
            <p className="text-sm font-bold text-white">Agenda do dia</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/20 px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium">Ao vivo</span>
          </div>
        </div>

        {/* Appointment cards */}
        <div className="space-y-2 mb-4">
          {[
            { time: "09:00", name: "Ana Lima", service: "Tatuagem floral", done: true },
            { time: "11:30", name: "Breno Costa", service: "Sleeve colorido", done: false },
            { time: "14:00", name: "Júlia Ramos", service: "Mini tattoo", done: false },
          ].map((apt) => (
            <div
              key={apt.time}
              className={`flex items-center gap-3 rounded-xl p-2.5 border ${
                apt.done
                  ? "bg-white/[0.03] border-white/5 opacity-60"
                  : "bg-primary/[0.08] border-primary/20"
              }`}
            >
              <div className="text-center min-w-[38px]">
                <p className="text-[10px] font-bold text-primary">{apt.time}</p>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{apt.name}</p>
                <p className="text-[10px] text-white/40 truncate">{apt.service}</p>
              </div>
              {apt.done && (
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 text-emerald-400" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Revenue mini chart */}
        <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] text-white/40 font-medium">Faturamento mensal</p>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] text-emerald-400 font-bold">+24%</span>
            </div>
          </div>
          <p className="text-base font-black text-white mb-2">R$ 3.840</p>
          <div className="flex items-end gap-1 h-8">
            {[40, 65, 50, 80, 60, 90, 75].map((h, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: static decorative bars
                key={i}
                className="flex-1 rounded-sm bg-primary/40"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Floating notification */}
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{
          duration: 5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 1.5,
        }}
        className="absolute -left-10 bottom-16 rounded-xl border border-white/10 bg-background/90 backdrop-blur-xl px-3 py-2 shadow-xl"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <Bell className="w-3 h-3 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-white">Novo agendamento!</p>
            <p className="text-[9px] text-white/40">Fernanda • Amanhã 10:00</p>
          </div>
        </div>
      </motion.div>

      {/* Floating star badge */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 0.8,
        }}
        className="absolute -right-8 top-8 rounded-xl border border-yellow-400/20 bg-background/90 backdrop-blur-xl px-3 py-2 shadow-xl"
      >
        <div className="flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-bold text-white">4.9</span>
          <span className="text-[10px] text-white/40">avaliação</span>
        </div>
      </motion.div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center">
        {/* Background */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, rgba(37,99,235,0.15) 0%, transparent 40%), radial-gradient(circle at 80% 80%, rgba(139,92,246,0.12) 0%, transparent 40%), #050816",
          }}
        />
        <div className="absolute inset-0 -z-10 bg-grid opacity-60" />

        <div className="relative max-w-6xl mx-auto px-4 py-28 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: text */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Badge
                  variant="secondary"
                  className="mb-6 text-xs px-3 py-1.5 border border-primary/20 bg-primary/10 text-primary"
                >
                  <Zap className="mr-1.5 h-3 w-3" />
                  Agendamento online inteligente
                </Badge>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.08 }}
                className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-[1.05]"
              >
                Chega de{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
                  WhatsApp
                </span>
                <br />
                para agendar
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.16 }}
                className="text-lg text-muted-foreground max-w-lg mb-10 leading-relaxed"
              >
                Plataforma de agendamento online para tatuadores, barbeiros, salões de beleza e
                profissionais de estética. Seus clientes agendam em 3 cliques, a qualquer hora.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.22 }}
                className="flex flex-col sm:flex-row gap-3 mb-12"
              >
                <Link
                  href="/cadastro"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 hover:brightness-110 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Começar grátis agora
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#como-funciona"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-7 py-3.5 text-sm font-medium hover:bg-white/[0.08] transition-all"
                >
                  Ver como funciona
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.32 }}
                className="flex flex-wrap gap-8"
              >
                {[
                  { value: "2 min", label: "para configurar" },
                  { value: "70%", label: "menos faltas" },
                  { value: "24/7", label: "agendamentos" },
                  { value: "grátis", label: "para começar" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl font-black text-primary">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right: mockup */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="hidden lg:flex justify-center"
            >
              <HeroMockup />
            </motion.div>
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
      <section id="funcionalidades" className="py-28 max-w-6xl mx-auto px-4">
        <FadeUp className="text-center mb-16">
          <Badge
            variant="secondary"
            className="mb-4 border border-primary/20 bg-primary/10 text-primary"
          >
            Funcionalidades
          </Badge>
          <h2 className="text-3xl md:text-5xl font-black mb-4">Tudo que você precisa</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Do agendamento ao financeiro, o Agendaê cobre todos os aspectos do seu negócio.
          </p>
        </FadeUp>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <FadeUp key={feature.title} delay={i * 0.07}>
                <div className="group h-full rounded-2xl border border-white/8 bg-white/[0.03] p-6 hover:border-primary/30 hover:bg-primary/[0.04] transition-all duration-300 backdrop-blur-sm">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:scale-105 transition-all">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-bold mb-2 text-sm">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </FadeUp>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section
        id="como-funciona"
        className="py-28 relative border-y border-white/5 overflow-hidden"
      >
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 60% 60% at 50% 100%, rgba(37,99,235,0.06) 0%, transparent 70%)",
          }}
        />
        <div className="max-w-6xl mx-auto px-4">
          <FadeUp className="text-center mb-16">
            <Badge
              variant="secondary"
              className="mb-4 border border-primary/20 bg-primary/10 text-primary"
            >
              Como funciona
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black mb-4">Configure em 4 passos</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Em menos de 2 minutos você já tem sua página de agendamento funcionando.
            </p>
          </FadeUp>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <FadeUp key={step.number} delay={i * 0.1}>
                <div className="relative">
                  {i < STEPS.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-primary/20 to-transparent z-0" />
                  )}
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 shadow-lg shadow-primary/10">
                      <span className="text-2xl font-black text-primary">{step.number}</span>
                    </div>
                    <h3 className="font-bold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-28 max-w-6xl mx-auto px-4">
        <FadeUp className="text-center mb-16">
          <Badge
            variant="secondary"
            className="mb-4 border border-primary/20 bg-primary/10 text-primary"
          >
            Depoimentos
          </Badge>
          <h2 className="text-3xl md:text-5xl font-black mb-4">Quem já usa, recomenda</h2>
        </FadeUp>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <FadeUp key={t.name} delay={i * 0.1}>
              <div className="h-full rounded-2xl border border-white/8 bg-white/[0.03] p-6 backdrop-blur-sm hover:border-white/15 transition-colors">
                <div className="flex gap-0.5 mb-5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={`star-${t.name}-${n}`}
                      className="h-4 w-4 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 italic">
                  &quot;{t.quote}&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center shrink-0`}
                  >
                    <span className="text-xs font-bold text-white">{t.initials}</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.role} · {t.studio}
                    </p>
                  </div>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="precos" className="py-28 relative border-y border-white/5 overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 50% 70% at 50% 50%, rgba(37,99,235,0.07) 0%, transparent 70%)",
          }}
        />
        <div className="max-w-6xl mx-auto px-4">
          <FadeUp className="text-center mb-16">
            <Badge
              variant="secondary"
              className="mb-4 border border-primary/20 bg-primary/10 text-primary"
            >
              Preços
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black mb-4">Simples e transparente</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Comece grátis. Faça upgrade quando precisar. Sem fidelidade.
            </p>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {PLANS.map((plan, i) => (
              <FadeUp key={plan.name} delay={i * 0.1}>
                <div
                  className={`relative h-full rounded-2xl border p-6 flex flex-col backdrop-blur-sm transition-all duration-300 ${
                    plan.highlight
                      ? "border-primary/40 bg-primary/[0.06] shadow-xl shadow-primary/10 glow-primary scale-[1.02]"
                      : "border-white/8 bg-white/[0.03] hover:border-white/15"
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/40">
                        <Zap className="h-3 w-3" />
                        Mais popular
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <p className="font-bold text-lg mb-0.5">{plan.name}</p>
                    <p className="text-xs text-muted-foreground mb-4">{plan.description}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black">{plan.price}</span>
                      <span className="text-muted-foreground text-sm">{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-2.5 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <div className="w-4 h-4 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                          <Check className="h-2.5 w-2.5 text-primary" />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={plan.href}
                    className={`inline-flex items-center justify-center w-full rounded-xl py-2.5 text-sm font-semibold transition-all ${
                      plan.highlight
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:brightness-110 hover:scale-[1.02]"
                        : "border border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </FadeUp>
            ))}
          </div>

          <FadeUp>
            <p className="text-center text-sm text-muted-foreground mt-8">
              Precisa de mais?{" "}
              <Link href="/precos" className="text-primary hover:underline">
                Ver planos completos
              </Link>
            </p>
          </FadeUp>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 max-w-6xl mx-auto px-4 text-center">
        <FadeUp>
          <div className="relative rounded-3xl border border-white/10 bg-white/[0.03] p-12 md:p-16 overflow-hidden backdrop-blur-sm">
            <div
              className="absolute inset-0 -z-10"
              style={{
                background:
                  "radial-gradient(ellipse 80% 60% at 50% 120%, rgba(37,99,235,0.18) 0%, transparent 60%)",
              }}
            />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

            <h2 className="text-3xl md:text-5xl font-black mb-4">
              Pronto para parar de
              <br />
              perder clientes?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Crie sua conta grátis agora e tenha sua página de agendamento online em menos de 2
              minutos.
            </p>
            <Link
              href="/cadastro"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-xl shadow-primary/30 hover:brightness-110 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Criar conta grátis
              <ArrowRight className="h-5 w-5" />
            </Link>
            <p className="text-xs text-muted-foreground mt-4">
              Sem cartão de crédito. Sem fidelidade. Cancele quando quiser.
            </p>
          </div>
        </FadeUp>
      </section>
    </div>
  );
}
