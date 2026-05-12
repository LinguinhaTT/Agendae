import { createHmac, timingSafeEqual } from "node:crypto";

function secret() {
  return process.env.CANCEL_TOKEN_SECRET ?? "agendae-cancel-fallback";
}

export function generateCancelToken(appointmentId: string, clientEmail: string): string {
  const payload = Buffer.from(`${appointmentId}:${clientEmail}`).toString("base64url");
  const sig = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyCancelToken(
  token: string
): { appointmentId: string; clientEmail: string } | null {
  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;

  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");

  try {
    const a = Buffer.from(sig, "base64url");
    const b = Buffer.from(expected, "base64url");
    if (a.length !== b.length) return null;
    if (!timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  try {
    const decoded = Buffer.from(payload, "base64url").toString("utf-8");
    const colon = decoded.indexOf(":");
    if (colon === -1) return null;
    return {
      appointmentId: decoded.slice(0, colon),
      clientEmail: decoded.slice(colon + 1),
    };
  } catch {
    return null;
  }
}
