import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendSystemEmail = async (to: string, subject: string, htmlContent: string) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@meetsense.app",
    to,
    subject,
    html: htmlContent,
  };

  return transporter.sendMail(mailOptions);
};
