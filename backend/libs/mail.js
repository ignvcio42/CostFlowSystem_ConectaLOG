// libs/email.js
import nodemailer from "nodemailer";
import { Resend } from "resend";

// const resend = new Resend("re_5W2PUdB7_K7kK1ozrXstiWQedQWQovwWt"); // pon tu API key de Resend

// Usando el transporter Resend para nodemailer
// Usando mailtrap para pruebas
const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "7da1c66531b197",
    pass: "1c566ef286e981",
  },
});

export async function sendVerificationEmail(to, token) {
  const verifyUrl = `http://localhost:5173/verificar-correo?token=${token}`; // Ajusta tu frontend
  const mailOptions = {
    from: '"Tu App" <onboarding@resend.dev>', // Puedes dejarlo así para pruebas
    to,
    subject: "Verifica tu correo electrónico",
    html: `<p>Haz click en el siguiente enlace para verificar tu correo:</p>
           <a href="${verifyUrl}">${verifyUrl}</a>
           <p>Este enlace expirará en 24 horas.</p>`,
  };
  await transporter.sendMail(mailOptions);
}

export async function sendResetPasswordEmail(to, token) {
  const resetUrl = `http://localhost:5173/reset-password?token=${token}`;
  const mailOptions = {
    from: '"Tu App" <onboarding@resend.dev>',
    to,
    subject: "Recuperar contraseña",
    html: `
      <p>Haz click en el siguiente enlace para restablecer tu contraseña:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>Este enlace expira en 1 hora.</p>
    `
  };
  await transporter.sendMail(mailOptions);
}
