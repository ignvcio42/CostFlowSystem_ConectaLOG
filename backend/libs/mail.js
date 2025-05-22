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

export async function sendEmailToAdmins(adminEmails, user) {
  const subject = "Nuevo usuario esperando confirmación";
  const html = `
    <p>El usuario <b>${user?.firstname}</b> con correo <b>${user?.email}</b> ha verificado su correo y está esperando ser confirmado.</p>
    <p>Por favor ingresa al panel de administración para aceptar o rechazar la cuenta.</p>
  `;
  await transporter.sendMail({
    from: '"Sistema" <noreply@tusistema.com>',
    to: adminEmails.join(","),  
    subject,
    html,
  });
}

export async function sendUserAcceptedEmail(userEmail, nuevo_estado, comentario) {
  const subject = nuevo_estado
    ? "¡Tu cuenta ha sido aceptada!"
    : "Tu cuenta fue rechazada";
  const html = nuevo_estado
    ? `<p>¡Felicitaciones! Tu cuenta ha sido activada y ya puedes iniciar sesión.</p>`
    : `<p>Lamentablemente, tu cuenta fue rechazada. Comentario del admin: <br>${comentario || "(Sin comentario)"}.</p>`;

  await transporter.sendMail({
    from: '"Sistema" <noreply@tusistema.com>',
    to: userEmail,
    subject,
    html,
  });
}

export async function sendUserRejectedEmail(userEmail, nombre, comentario = "") {
  await transporter.sendMail({
    from: '"Sistema" <noreply@tusistema.com>',
    to: userEmail,
    subject: "Tu cuenta fue rechazada",
    html: `
      <p>Hola ${nombre},</p>
      <p>Lamentablemente tu cuenta fue rechazada.</p>
      <p>${comentario ? `Motivo: <i>${comentario}</i>` : ""}</p>
    `
  });
}