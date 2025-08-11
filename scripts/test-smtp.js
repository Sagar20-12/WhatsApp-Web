import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
  TEST_EMAIL_TO,
} = process.env;

async function main() {
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.error('Missing SMTP env. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM');
    process.exit(1);
  }
  if (!TEST_EMAIL_TO) {
    console.error('Missing TEST_EMAIL_TO env to send test email');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  const info = await transporter.sendMail({
    from: SMTP_FROM || SMTP_USER,
    to: TEST_EMAIL_TO,
    subject: 'SMTP test from WhatsApp Web app',
    text: 'If you received this, SMTP is configured correctly.',
  });
  console.log('Message sent:', info.messageId || 'ok');
}

main().catch((err) => {
  console.error('SMTP test failed:', err);
  process.exit(1);
});


