export type EmailType =
  | "booking_received"
  | "booking_confirmed"
  | "booking_cancelled"
  | "owner_new_booking";

export interface AppointmentEmailParams {
  type: EmailType;
  clientName: string;
  clientEmail: string;
  clientPhone?: string | null;
  serviceName: string;
  professionalName?: string | null;
  establishmentName: string;
  establishmentSlug: string;
  startsAt: Date;
  endsAt: Date;
  priceCents: number;
  cancelUrl?: string | null;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://agendae.app";

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

function fmtPrice(cents: number): string {
  if (cents === 0) return "A combinar";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:10px 0;color:#71717a;font-size:14px;width:38%;border-bottom:1px solid #f4f4f5;vertical-align:top;">${esc(label)}</td>
    <td style="padding:10px 0;color:#09090b;font-size:14px;font-weight:600;border-bottom:1px solid #f4f4f5;">${esc(value)}</td>
  </tr>`;
}

export function buildAppointmentEmail(p: AppointmentEmailParams): {
  subject: string;
  html: string;
} {
  // Subjects are plain text (not HTML) — no escaping needed
  const subjects: Record<EmailType, string> = {
    booking_received: `Agendamento recebido — ${p.serviceName} em ${p.establishmentName}`,
    booking_confirmed: `Agendamento confirmado ✓ — ${p.serviceName} em ${p.establishmentName}`,
    booking_cancelled: `Agendamento cancelado — ${p.serviceName} em ${p.establishmentName}`,
    owner_new_booking: `Novo agendamento: ${p.clientName} — ${p.serviceName}`,
  };

  const badges: Record<EmailType, { label: string; color: string }> = {
    booking_received: { label: "Aguardando confirmação", color: "#f59e0b" },
    booking_confirmed: { label: "Confirmado", color: "#10b981" },
    booking_cancelled: { label: "Cancelado", color: "#ef4444" },
    owner_new_booking: { label: "Novo agendamento", color: "#8b5cf6" },
  };

  const titles: Record<EmailType, string> = {
    booking_received: "Agendamento recebido!",
    booking_confirmed: "Agendamento confirmado!",
    booking_cancelled: "Agendamento cancelado",
    owner_new_booking: `Novo agendamento de ${esc(p.clientName)}`,
  };

  const bodies: Record<EmailType, string> = {
    booking_received: `Seu agendamento em <strong>${esc(p.establishmentName)}</strong> foi recebido com sucesso e está aguardando confirmação da equipe.`,
    booking_confirmed: `Ótimas notícias! Seu agendamento em <strong>${esc(p.establishmentName)}</strong> foi confirmado. Nos vemos em breve!`,
    booking_cancelled: `Infelizmente seu agendamento em <strong>${esc(p.establishmentName)}</strong> foi cancelado. Entre em contato com o estabelecimento para mais informações.`,
    owner_new_booking: `<strong>${esc(p.clientName)}</strong> acabou de fazer um agendamento. Confira os detalhes abaixo.`,
  };

  const badge = badges[p.type];
  const isOwner = p.type === "owner_new_booking";
  const showCancel =
    p.cancelUrl && (p.type === "booking_received" || p.type === "booking_confirmed");

  const detailRows = [
    row("Serviço", p.serviceName),
    ...(p.professionalName ? [row("Profissional", p.professionalName)] : []),
    row("Data", fmt(p.startsAt)),
    row("Horário", `${fmtTime(p.startsAt)} – ${fmtTime(p.endsAt)}`),
    row("Valor", fmtPrice(p.priceCents)),
    ...(isOwner
      ? [
          row("Cliente", p.clientName),
          ...(p.clientPhone ? [row("Telefone", p.clientPhone)] : []),
          row("E-mail", p.clientEmail),
        ]
      : []),
  ].join("\n");

  const ctaHref = isOwner ? `${APP_URL}/admin/agenda` : `${APP_URL}/e/${p.establishmentSlug}`;
  const ctaLabel = isOwner ? "Ver na agenda" : "Ver estabelecimento";

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${subjects[p.type]}</title>
</head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f4f4f5;margin:0;padding:24px 16px;">
<table role="presentation" cellpadding="0" cellspacing="0" style="max-width:580px;margin:0 auto;width:100%;">
  <tr><td>

    <!-- Card -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:white;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);">

      <!-- Header -->
      <tr>
        <td style="background:#09090b;padding:24px 32px;">
          <span style="display:inline-block;background:${badge.color};border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700;color:white;text-transform:uppercase;letter-spacing:.06em;margin-bottom:14px;">${badge.label}</span>
          <div style="color:white;font-size:22px;font-weight:900;letter-spacing:-.5px;">Agendaê</div>
          <div style="color:#a1a1aa;font-size:13px;margin-top:2px;">Sistema de agendamento</div>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:32px;">
          <h2 style="margin:0 0 10px;font-size:20px;font-weight:800;color:#09090b;">${titles[p.type]}</h2>
          <p style="margin:0 0 24px;font-size:15px;color:#52525b;line-height:1.6;">${bodies[p.type]}</p>

          <!-- Details -->
          <div style="background:#fafafa;border-radius:8px;padding:4px 16px 0;margin-bottom:28px;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
              ${detailRows}
            </table>
          </div>

          <!-- CTA -->
          <a href="${ctaHref}" style="display:inline-block;background:#09090b;color:white;text-decoration:none;padding:13px 28px;border-radius:8px;font-weight:700;font-size:14px;">${ctaLabel} →</a>

          ${
            showCancel
              ? `<!-- Cancel link -->
          <p style="margin:20px 0 0;font-size:13px;color:#a1a1aa;">
            Precisa cancelar? <a href="${p.cancelUrl}" style="color:#ef4444;text-decoration:none;">Cancelar agendamento</a>
          </p>`
              : ""
          }
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#fafafa;border-top:1px solid #f4f4f5;padding:18px 32px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#a1a1aa;">
            Este e-mail foi enviado pelo <strong>Agendaê</strong> em nome de ${esc(p.establishmentName)}.
          </p>
        </td>
      </tr>

    </table>

  </td></tr>
</table>
</body>
</html>`;

  return { subject: subjects[p.type], html };
}
