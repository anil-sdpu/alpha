const nodemailer = require('nodemailer');

async function run() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.FROM_EMAIL || user;
  const to = process.env.TEST_TO || process.argv[2];

  if (!host || !port || !user || !pass) {
    console.error('Missing SMTP environment variables. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.');
    process.exit(2);
  }
  if (!to) {
    console.error('Specify recipient email via TEST_TO env or as first arg');
    process.exit(2);
  }

  const transporter = nodemailer.createTransport({ host, port: Number(port), secure: Number(port) === 465, auth: { user, pass } });

  try {
    const info = await transporter.sendMail({ from, to, subject: 'Alpha - SMTP test', text: 'This is a test email from Alpha tuition system.' });
    console.log('Message sent:', info.messageId || info.response);
    process.exit(0);
  } catch (err) {
    console.error('Send failed:', err && err.message ? err.message : err);
    process.exit(1);
  }
}

run();
