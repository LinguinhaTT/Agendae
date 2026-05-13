const ZAPI_INSTANCE = process.env.ZAPI_INSTANCE_ID;
const ZAPI_TOKEN = process.env.ZAPI_TOKEN;

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("55") ? digits : `55${digits}`;
}

export async function sendWhatsAppText(to: string, text: string): Promise<void> {
  if (!ZAPI_INSTANCE || !ZAPI_TOKEN) return;

  try {
    await fetch(`https://api.z-api.io/instances/${ZAPI_INSTANCE}/token/${ZAPI_TOKEN}/send-text`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: normalizePhone(to), message: text }),
    });
  } catch (err) {
    console.error("[WhatsApp] Failed to send:", err);
  }
}

export interface BookingWhatsAppParams {
  establishmentName: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  serviceName: string;
  professionalName: string | null;
  startsAt: Date;
  endsAt: Date;
  priceCents: number;
  status: "pending" | "confirmed";
}

export function buildOwnerMessage(p: BookingWhatsAppParams): string {
  const icon = p.status === "confirmed" ? "✅" : "⏳";
  const statusLabel = p.status === "confirmed" ? "Confirmado" : "Aguardando confirmação";

  const dateLabel = p.startsAt.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  });

  const startTime = p.startsAt.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });

  const endTime = p.endsAt.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });

  const price =
    p.priceCents === 0
      ? "A combinar"
      : (p.priceCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return [
    `${icon} *Novo Agendamento — ${p.establishmentName}*`,
    `Status: ${statusLabel}`,
    "",
    `👤 *Cliente:* ${p.clientName}`,
    `📱 *Telefone:* ${p.clientPhone}`,
    `📧 *Email:* ${p.clientEmail}`,
    "",
    `✂️ *Serviço:* ${p.serviceName}`,
    p.professionalName ? `👨‍🎨 *Profissional:* ${p.professionalName}` : null,
    `📅 *Data:* ${dateLabel}`,
    `⏰ *Horário:* ${startTime} – ${endTime}`,
    `💰 *Valor:* ${price}`,
    "",
    "_Agendado via Agendaê_",
  ]
    .filter((l) => l !== null)
    .join("\n");
}

export function buildClientMessage(p: BookingWhatsAppParams): string {
  const dateLabel = p.startsAt.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  });

  const startTime = p.startsAt.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });

  const price =
    p.priceCents === 0
      ? "A combinar"
      : (p.priceCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const statusLine =
    p.status === "confirmed"
      ? "✅ Seu agendamento está *confirmado*!"
      : "⏳ Seu agendamento foi recebido e está *aguardando confirmação*.";

  return [
    `Olá, *${p.clientName}*! 👋`,
    "",
    statusLine,
    "",
    `🏠 *${p.establishmentName}*`,
    `✂️ *Serviço:* ${p.serviceName}`,
    p.professionalName ? `👨‍🎨 *Profissional:* ${p.professionalName}` : null,
    `📅 *Data:* ${dateLabel}`,
    `⏰ *Horário:* ${startTime}`,
    `💰 *Valor:* ${price}`,
    "",
    "_Agendado via Agendaê_",
  ]
    .filter((l) => l !== null)
    .join("\n");
}

/** @deprecated use buildOwnerMessage */
export const buildBookingMessage = buildOwnerMessage;
