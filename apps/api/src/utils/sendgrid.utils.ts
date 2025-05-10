import sgMail from '@sendgrid/mail';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
if (!SENDGRID_API_KEY) {
  // eslint-disable-next-line no-console
  console.warn('SENDGRID_API_KEY is not set. Email sending will fail.');
}
sgMail.setApiKey(SENDGRID_API_KEY);

export async function sendEmail({ to, subject, html, text }: { to: string; subject: string; html?: string; text?: string }) {
  if (!SENDGRID_API_KEY) throw new Error('SendGrid API key not set');
  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL || 'no-reply@planiversary.com',
    subject,
    text,
    html,
  };
  return sgMail.send(msg);
} 