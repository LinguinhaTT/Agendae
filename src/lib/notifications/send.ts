import { FROM_EMAIL, getResend } from "./resend";
import type { AppointmentEmailParams } from "./templates/appointment";
import { buildAppointmentEmail } from "./templates/appointment";

export async function sendAppointmentEmail(
  to: string,
  params: AppointmentEmailParams
): Promise<void> {
  const resend = getResend();
  if (!resend) return;
  const { subject, html } = buildAppointmentEmail(params);
  try {
    await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
  } catch (err) {
    console.error("[Email] Failed to send:", err);
  }
}
