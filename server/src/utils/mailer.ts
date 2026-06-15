import nodemailer from 'nodemailer';

/**
 * Sends an email via SMTP. If SMTP is not configured (no SMTP_HOST), this is a
 * no-op that returns false — the app runs fine without email credentials.
 */
export async function sendMail(opts: {
  to: string;
  subject: string;
  text: string;
}): Promise<boolean> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
  if (!SMTP_HOST) return false;

  const port = Number(SMTP_PORT) || 587;
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });

  await transporter.sendMail({
    from: SMTP_FROM ?? 'Trip Mates <no-reply@tripmates.app>',
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
  });
  return true;
}

/** Notifies a trip owner that someone expressed interest in their trip. */
export async function notifyTripInterest(opts: {
  ownerEmail: string;
  ownerName: string;
  tripTitle: string;
  interestedName: string;
}): Promise<boolean> {
  return sendMail({
    to: opts.ownerEmail,
    subject: `New interest in your trip "${opts.tripTitle}"`,
    text:
      `Hi ${opts.ownerName},\n\n` +
      `${opts.interestedName} expressed interest in your trip "${opts.tripTitle}".\n\n` +
      `Log in to Trip Mates to connect with them.`,
  });
}
