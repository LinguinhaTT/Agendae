import type { Metadata } from "next";
import Link from "next/link";
import { AppointmentActions } from "@/components/admin/appointment-actions";
import { APPOINTMENT_STATUS_LABELS } from "@/lib/constants";
import { getAdminContext, getAppointmentsAdmin } from "@/lib/data/admin";
import { formatCurrency, formatDuration } from "@/lib/utils";

export const metadata: Metadata = { title: "Agenda" };

interface Props {
  searchParams: Promise<{ status?: string }>;
}

const STATUS_TABS = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Aguardando" },
  { value: "confirmed", label: "Confirmados" },
  { value: "completed", label: "Concluídos" },
  { value: "cancelled", label: "Cancelados" },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  confirmed: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  completed: "bg-green-500/15 text-green-400 border-green-500/20",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/20",
  no_show: "bg-muted/50 text-muted-foreground border-white/5",
  rescheduled: "bg-purple-500/15 text-purple-400 border-purple-500/20",
};

export default async function AgendaPage({ searchParams }: Props) {
  const { status = "all" } = await searchParams;
  const { establishment } = await getAdminContext();
  const appointments = await getAppointmentsAdmin(establishment.id, status);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black">Agenda</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {appointments.length} agendamento{appointments.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 mb-6 flex-wrap">
        {STATUS_TABS.map(({ value, label }) => (
          <Link
            key={value}
            href={value === "all" ? "/admin/agenda" : `/admin/agenda?status=${value}`}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              status === value || (value === "all" && !status)
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* List */}
      {appointments.length === 0 ? (
        <div className="rounded-xl border border-white/5 bg-card p-12 text-center">
          <p className="text-muted-foreground text-sm">Nenhum agendamento encontrado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appt) => {
            const start = new Date(appt.starts_at);
            const end = new Date(appt.ends_at);

            return (
              <div
                key={appt.id}
                className="rounded-xl border border-white/5 bg-card p-4 hover:border-white/10 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Date block */}
                  <div className="w-16 shrink-0 text-center rounded-lg bg-white/5 p-2">
                    <p className="text-xs text-muted-foreground capitalize">
                      {start.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}
                    </p>
                    <p className="text-2xl font-black leading-none">
                      {start.toLocaleDateString("pt-BR", { day: "2-digit" })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {start.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">{appt.client_name}</p>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[appt.status] ?? STATUS_COLORS.no_show}`}
                      >
                        {APPOINTMENT_STATUS_LABELS[appt.status] ?? appt.status}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground mt-0.5">
                      {appt.service_name_snapshot} ·{" "}
                      {formatDuration(appt.duration_minutes_snapshot)} ·{" "}
                      {start.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      –{" "}
                      {end.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                      {appt.client_phone && <span>{appt.client_phone}</span>}
                      {appt.client_email && <span>{appt.client_email}</span>}
                    </div>

                    {appt.client_notes && (
                      <p className="text-xs text-muted-foreground mt-1.5 italic">
                        &ldquo;{appt.client_notes}&rdquo;
                      </p>
                    )}

                    <AppointmentActions id={appt.id} status={appt.status} />
                  </div>

                  {/* Price */}
                  <div className="shrink-0 text-right">
                    <p className="font-bold text-primary">
                      {formatCurrency(appt.price_cents_snapshot)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                      {start.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
