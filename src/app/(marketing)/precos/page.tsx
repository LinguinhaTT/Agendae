import { ArrowRight, Check, X } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Preços",
  description:
    "Planos simples e transparentes para tatuadores, barbeiros e profissionais de estética. Comece grátis.",
};

const PLANS = [
  {
    name: "Grátis",
    price: "R$ 0",
    period: "/mês",
    description: "Para quem quer experimentar",
    highlight: false,
    cta: "Começar grátis",
    href: "/cadastro",
  },
  {
    name: "Pro",
    price: "R$ 49",
    period: "/mês",
    description: "Para profissionais autônomos",
    highlight: true,
    cta: "Assinar Pro",
    href: "/cadastro",
  },
  {
    name: "Business",
    price: "R$ 149",
    period: "/mês",
    description: "Para estúdios e equipes grandes",
    highlight: false,
    cta: "Assinar Business",
    href: "/cadastro",
  },
];

type FeatureValue = boolean | string;

interface ComparisonFeature {
  name: string;
  free: FeatureValue;
  pro: FeatureValue;
  business: FeatureValue;
}

const COMPARISON: ComparisonFeature[] = [
  { name: "Profissionais", free: "1", pro: "Até 5", business: "Ilimitados" },
  { name: "Agendamentos/mês", free: "30", pro: "Ilimitados", business: "Ilimitados" },
  { name: "Página de agendamento", free: true, pro: true, business: true },
  { name: "Portfólio de fotos", free: false, pro: true, business: true },
  { name: "Avaliações de clientes", free: false, pro: true, business: true },
  { name: "Lembretes por email", free: true, pro: true, business: true },
  { name: "Lembretes por WhatsApp", free: false, pro: true, business: true },
  { name: "Lembretes por SMS", free: false, pro: false, business: true },
  { name: "Relatórios básicos", free: false, pro: true, business: true },
  { name: "Relatórios avançados", free: false, pro: false, business: true },
  { name: "Subdomínio personalizado", free: false, pro: false, business: true },
  { name: "API e webhooks", free: false, pro: false, business: true },
  { name: "Suporte por email", free: true, pro: true, business: true },
  { name: "Suporte prioritário", free: false, pro: true, business: true },
  { name: "Suporte dedicado", free: false, pro: false, business: true },
];

function FeatureCell({ value }: { value: FeatureValue }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="h-5 w-5 text-primary mx-auto" />
    ) : (
      <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />
    );
  }
  return <span className="text-sm font-medium">{value}</span>;
}

const FAQ = [
  {
    q: "Posso cancelar a qualquer momento?",
    a: "Sim. Não há fidelidade. Você pode cancelar a qualquer momento pelo painel, sem burocracia.",
  },
  {
    q: "O que acontece se eu atingir o limite do plano grátis?",
    a: "Você não poderá receber novos agendamentos até o próximo mês ou até fazer upgrade para o Pro.",
  },
  {
    q: "Os agendamentos existentes são perdidos ao cancelar?",
    a: "Não. Todos os seus dados ficam salvos por 90 dias após o cancelamento.",
  },
  {
    q: "Existe desconto para pagamento anual?",
    a: "Sim! Pagando anualmente você ganha 2 meses grátis (equivale a ~17% de desconto).",
  },
  {
    q: "Como funciona o período trial?",
    a: "Ao criar a conta, você tem 14 dias grátis do plano Pro para testar todos os recursos.",
  },
];

export default function PrecosPage() {
  return (
    <div className="py-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Preços
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black mb-4">Simples e transparente</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Comece grátis. Faça upgrade quando precisar. Sem fidelidade, sem surpresas.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-20 max-w-4xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`glass-card p-8 flex flex-col relative ${
                plan.highlight ? "border-primary/50 ring-1 ring-primary/30" : ""
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground text-xs">Mais popular</Badge>
                </div>
              )}
              <div className="mb-8">
                <p className="font-black text-xl mb-1">{plan.name}</p>
                <p className="text-xs text-muted-foreground mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </div>
              <Button
                asChild
                variant={plan.highlight ? "default" : "outline"}
                size="lg"
                className="w-full mt-auto"
              >
                <Link href={plan.href}>
                  {plan.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <div className="mb-20 overflow-x-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Comparação completa</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-4 pr-4 text-sm font-medium text-muted-foreground w-1/2">
                  Funcionalidade
                </th>
                {PLANS.map((plan) => (
                  <th
                    key={plan.name}
                    className={`py-4 px-4 text-center text-sm font-bold ${
                      plan.highlight ? "text-primary" : ""
                    }`}
                  >
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row, i) => (
                <tr
                  key={row.name}
                  className={`border-b border-white/5 ${i % 2 === 0 ? "bg-white/[0.01]" : ""}`}
                >
                  <td className="py-3.5 pr-4 text-sm">{row.name}</td>
                  <td className="py-3.5 px-4 text-center">
                    <FeatureCell value={row.free} />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <FeatureCell value={row.pro} />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <FeatureCell value={row.business} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mb-20">
          <h2 className="text-2xl font-bold text-center mb-8">Perguntas frequentes</h2>
          <div className="space-y-4">
            {FAQ.map((item) => (
              <div key={item.q} className="glass-card p-6">
                <p className="font-bold mb-2 text-sm">{item.q}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center glass-card p-12">
          <h2 className="text-2xl md:text-3xl font-black mb-3">Comece com 14 dias grátis do Pro</h2>
          <p className="text-muted-foreground mb-6">
            Sem cartão de crédito. Sem compromisso. Cancele quando quiser.
          </p>
          <Button asChild size="xl" className="font-semibold">
            <Link href="/cadastro">
              Criar conta grátis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
