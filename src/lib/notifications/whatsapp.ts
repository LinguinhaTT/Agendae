const ZAPI_INSTANCE = process.env.ZAPI_INSTANCE_ID;
const ZAPI_TOKEN = process.env.ZAPI_TOKEN;
const ZAPI_CLIENT_TOKEN = process.env.ZAPI_CLIENT_TOKEN;

function normalizePhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  const normalized = digits.startsWith("55") ? digits : `55${digits}`;
  // valid Brazilian numbers: 55 + DDD (2) + number (8 or 9) = 12 or 13 digits
  if (normalized.length < 12 || normalized.length > 13) return null;
  return normalized;
}

export async function sendWhatsAppText(to: string, text: string): Promise<void> {
  if (!ZAPI_INSTANCE || !ZAPI_TOKEN || !ZAPI_CLIENT_TOKEN) return;

  const phone = normalizePhone(to);
  if (!phone) {
    console.warn("[WhatsApp] Invalid phone number, skipping:", to);
    return;
  }

  try {
    const res = await fetch(
      `https://api.z-api.io/instances/${ZAPI_INSTANCE}/token/${ZAPI_TOKEN}/send-text`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "Client-Token": ZAPI_CLIENT_TOKEN },
        body: JSON.stringify({ phone, message: text }),
      }
    );
    if (!res.ok) {
      const body = await res.text();
      console.error("[WhatsApp] Z-API error:", res.status, body);
    } else {
      console.log("[WhatsApp] Sent to", phone);
    }
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
  status: "pending" | "confirmed" | "cancelled";
}

export function buildOwnerMessage(p: BookingWhatsAppParams): string {
  const icon = p.status === "cancelled" ? "❌" : p.status === "confirmed" ? "✅" : "⏳";
  const statusLabel =
    p.status === "cancelled"
      ? "Cancelado"
      : p.status === "confirmed"
        ? "Confirmado"
        : "Aguardando confirmação";

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

  if (p.status === "cancelled") {
    return [
      `Olá, *${p.clientName}*! 👋`,
      "",
      `❌ Seu agendamento em *${p.establishmentName}* foi *cancelado*.`,
      "",
      `✂️ *Serviço:* ${p.serviceName}`,
      `📅 *Data:* ${dateLabel}`,
      `⏰ *Horário:* ${startTime}`,
      "",
      "Se quiser remarcar, entre em contato conosco. Lamentamos o transtorno! 🙏",
    ]
      .filter((l) => l !== null)
      .join("\n");
  }

  const statusLine =
    p.status === "confirmed"
      ? "✅ Seu agendamento está *confirmado*! Até lá 🤙"
      : "⏳ Seu agendamento foi recebido e está *aguardando confirmação*. Entraremos em contato em breve!";

  return [
    `Olá, *${p.clientName}*! 👋`,
    "",
    statusLine,
    "",
    `🏠 *${p.establishmentName}*`,
    `✂️ *Serviço:* ${p.serviceName}`,
    p.professionalName ? `👤 *Profissional:* ${p.professionalName}` : null,
    `📅 *Data:* ${dateLabel}`,
    `⏰ *Horário:* ${startTime}`,
    `💰 *Valor:* ${price}`,
    "",
    "Qualquer dúvida, pode responder esta mensagem! 😊",
  ]
    .filter((l) => l !== null)
    .join("\n");
}

export interface ReminderWhatsAppParams {
  establishmentName: string;
  clientName: string;
  clientPhone: string;
  serviceName: string;
  professionalName: string | null;
  startsAt: Date;
  window: "24h" | "1h";
}

export function buildClientReminderMessage(p: ReminderWhatsAppParams): string {
  const timeLabel = p.startsAt.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });

  const dateLabel = p.startsAt.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    timeZone: "America/Sao_Paulo",
  });

  const windowText = p.window === "1h" ? "em *1 hora*" : "amanhã";

  return [
    `Olá, *${p.clientName}*! 👋`,
    "",
    `⏰ Lembrete: seu agendamento é ${windowText}!`,
    "",
    `🏠 *${p.establishmentName}*`,
    `✂️ *Serviço:* ${p.serviceName}`,
    p.professionalName ? `👤 *Profissional:* ${p.professionalName}` : null,
    `📅 *Data:* ${dateLabel}`,
    `⏰ *Horário:* ${timeLabel}`,
    "",
    "Até logo! 😊",
  ]
    .filter((l) => l !== null)
    .join("\n");
}

export function buildProfessionalReminderMessage(p: ReminderWhatsAppParams): string {
  const timeLabel = p.startsAt.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });

  const windowText = p.window === "1h" ? "em 1 hora" : "amanhã";

  return [
    `⏰ *Lembrete — agendamento ${windowText}*`,
    "",
    `👤 *Cliente:* ${p.clientName}`,
    `📱 *Telefone:* ${p.clientPhone}`,
    `✂️ *Serviço:* ${p.serviceName}`,
    `⏰ *Horário:* ${timeLabel}`,
    "",
    `_${p.establishmentName} via Agendaê_`,
  ]
    .filter((l) => l !== null)
    .join("\n");
}

/** @deprecated use buildOwnerMessage */
export const buildBookingMessage = buildOwnerMessage;
