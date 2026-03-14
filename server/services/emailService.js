const nodemailer = require('nodemailer');
const { logger } = require('../middleware/errorHandler');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_USER !== 'your@gmail.com') {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    return transporter;
  }

  return null;
};

const sendLowStockAlert = async (to, name, items) => {
  const transport = getTransporter();

  const rows = items
    .map(
      (p) =>
        `<tr>
      <td>${p.name}</td><td>${p.sku}</td>
      <td style="color:#b45309">${p.currentStock} ${p.uom}</td>
      <td>${p.minStockLevel} ${p.uom}</td>
    </tr>`
    )
    .join('');

  const html = `
    <h2>Low Stock Alert</h2>
    <p>Hi ${name}, the following items are at or below their minimum stock level:</p>
    <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse">
      <tr><th>Product</th><th>SKU</th><th>Current Stock</th><th>Min Level</th></tr>
      ${rows}
    </table>
    <p>Please review and reorder as needed.</p>
  `;

  if (!transport) {
    logger.info(`[EMAIL STUBBED] Low stock alert for ${name} (${to}):`);
    logger.info(`Items flagged: ${items.map((i) => `${i.name} (${i.currentStock}/${i.minStockLevel})`).join(', ')}`);
    return;
  }

  await transport.sendMail({
    from: process.env.ALERT_FROM,
    to,
    subject: `⚠ CoreInventory — ${items.length} item(s) low on stock`,
    html,
  });
};

const sendOtpEmail = async (to, otp) => {
  const transport = getTransporter();
  const html = `
    <h2>CoreInventory — Password Reset</h2>
    <p>Your one-time code is: <strong>${otp}</strong></p>
    <p>This code expires in 10 minutes. If you didn't request this, please ignore this email.</p>
  `;
  if (!transport) {
    logger.info(`[EMAIL STUBBED] OTP for ${to}: ${otp}`);
    return;
  }
  await transport.sendMail({
    from: process.env.ALERT_FROM || process.env.SMTP_USER,
    to,
    subject: 'CoreInventory — Your password reset code',
    html,
  });
};

module.exports = { sendLowStockAlert, sendOtpEmail };
