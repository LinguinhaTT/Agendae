import Link from "next/link";
import { verifyCancelToken } from "@/lib/booking/cancel-token";
import { createClient } from "@/lib/supabase/server";
import { CancelForm } from "./cancel-form";

function fmt(d: Date): string {
  return d.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function fmtTime(d: Date): string {
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function ErrorCard({ message }: { message: string }) {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full rounded-2xl border border-white/10 bg-card p-8 text-center space-y-4">
        <p className="text-muted-foreground">{message}</p>
        <Link href="/" className="text-sm text-primary hover:underline">
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}

export default async function CancelPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const parsed = verifyCancelToken(token);

  if (!parsed) return <ErrorCard message="Link inválido ou expirado." />;

  const supabase = await createClient();

  const { data: appt } = await supabase
    .from("appointments")
    .select("id, status, starts_at, ends_at, service_name_snapshot, establishment_id")
    .eq("id", parsed.appointmentId)
    .eq("client_email", parsed.clientEmail)
    .maybeSingle();

  if (!appt) return <ErrorCard message="Agendamento não encontrado." />;
  if (appt.status === "cancelled")
    return <ErrorCard message="Este agendamento já foi cancelado." />;
  if (appt.status === "completed" || appt.status === "no_show")
    return <ErrorCard message="Não é possível cancelar este agendamento." />;
  if (new Date(appt.starts_at) < new Date())
    return <ErrorCard message="Não é possível cancelar agendamentos já realizados." />;

  const { data: est } = await supabase
    .from("establishments")
    .select("name, slug")
    .eq("id", appt.establishment_id)
    .maybeSingle();

  const startsAt = new Date(appt.starts_at);
  const endsAt = new Date(appt.ends_at);

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full rounded-2xl border border-white/10 bg-card p-8">
        <div className="mb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Agendaê
          </p>
          <h1 className="text-xl font-bold">Cancelar agendamento</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tem certeza que deseja cancelar o agendamento abaixo?
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-background p-4 mb-6 space-y-3">
          <Row label="Serviço" value={appt.service_name_snapshot} />
          <Row label="Data" value={fmt(startsAt)} />
          <Row label="Horário" value={`${fmtTime(startsAt)} – ${fmtTime(endsAt)}`} />
          {est && <Row label="Estabelecimento" value={est.name} />}
        </div>

        <CancelForm token={token} establishmentSlug={est?.slug} />
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
