const EVOLUTION_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_KEY = process.env.EVOLUTION_API_KEY;
const EVOLUTION_INSTANCE = process.env.EVOLUTION_API_INSTANCE;

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("55") ? digits : `55${digits}`;
}

export async function sendWhatsAppText(to: string, text: string): Promise<void> {
  if (!EVOLUTION_URL || !EVOLUTION_KEY || !EVOLUTION_INSTANCE) return;

  try {
    await fetch(`${EVOLUTION_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: EVOLUTION_KEY },
      body: JSON.stringify({ number: normalizePhone(to), text }),
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

export function buildBookingMessage(p: BookingWhatsAppParams): string {
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

  const price = (p.priceCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const lines = [
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

  return lines;
}
