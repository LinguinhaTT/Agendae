import { Calendar, CheckCircle2, Clock, DollarSign, TrendingUp } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { APPOINTMENT_STATUS_LABELS } from "@/lib/constants";
import { getAdminContext, getDashboardData } from "@/lib/data/admin";
import { formatCurrency, formatDuration } from "@/lib/utils";

export const metadata: Metadata = { title: "Painel" };

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
    confirmed: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    completed: "bg-green-500/15 text-green-400 border-green-500/20",
    cancelled: "bg-red-500/15 text-red-400 border-red-500/20",
    no_show: "bg-muted/50 text-muted-foreground border-white/5",
    rescheduled: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colorMap[status] ?? colorMap.no_show}`}
    >
      {APPOINTMENT_STATUS_LABELS[status] ?? status}
    </span>
  );
}

export default async function DashboardPage() {
  const { establishment } = await getAdminContext();
  const data = await getDashboardData(establishment.id);

  const stats = [
    {
      label: "Agendamentos hoje",
      value: data.todayCount,
      icon: Calendar,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Pendentes",
      value: data.pendingCount,
      icon: Clock,
      color: data.pendingCount > 0 ? "text-yellow-400" : "text-muted-foreground",
      bg: data.pendingCount > 0 ? "bg-yellow-500/10" : "bg-white/5",
    },
    {
      label: "Este mês",
      value: data.monthlyCount,
      icon: TrendingUp,
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
    {
      label: "Recebido este mês",
      value: formatCurrency(data.monthlyRevenue),
      icon: DollarSign,
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black">Painel</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Olá! Aqui está o resumo do {establishment.name}.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-xl border border-white/5 bg-card p-4">
            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <p className="text-2xl font-black">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Upcoming appointments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Próximos agendamentos</h2>
          <Link href="/admin/agenda" className="text-sm text-primary hover:underline">
            Ver todos →
          </Link>
        </div>

        {data.upcoming.length === 0 ? (
          <div className="rounded-xl border border-white/5 bg-card p-8 text-center">
            <CheckCircle2 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Nenhum agendamento nos próximos 7 dias.</p>
            <Link
              href={`/e/${establishment.slug}`}
              target="_blank"
              className="text-sm text-primary hover:underline mt-2 inline-block"
            >
              Compartilhe sua página para receber agendamentos →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {data.upcoming.map((appt) => {
              const start = new Date(appt.starts_at);
              return (
                <div
                  key={appt.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-card hover:border-white/10 transition-colors"
                >
                  {/* Date/time */}
                  <div className="w-14 shrink-0 text-center">
                    <p className="text-xs text-muted-foreground">
                      {start.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")}
                    </p>
                    <p className="text-lg font-black leading-none">
                      {start.toLocaleDateString("pt-BR", { day: "2-digit" })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {start.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{appt.client_name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {appt.service_name_snapshot} ·{" "}
                      {formatDuration(appt.duration_minutes_snapshot ?? 0)}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-primary">
                      {formatCurrency(appt.price_cents_snapshot)}
                    </p>
                    <StatusBadge status={appt.status} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
