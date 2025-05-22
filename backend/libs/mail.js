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
    from: '"Tu App" <noreply@mailtrap.io>', // Puedes dejarlo así para pruebas
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
    from: '"Tu App" <noreply@mailtrap.io>',
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
    from: '"Sistema" <noreply@mailtrap.io>',
    to: adminEmails.join(","),  
    subject,
    html,
  });
}

export async function sendUserAcceptedEmail(userEmail, nombre) {
  await transporter.sendMail({
    from: '"Plataforma" <noreply@mailtrap.io>',
    to: userEmail,
    subject: "¡Tu cuenta ha sido aceptada!",
    html: `
      <h2>¡Bienvenido/a, ${nombre}!</h2>
      <p>Tu cuenta ha sido <strong>aceptada</strong> por un administrador.</p>
      <p>Ahora puedes iniciar sesión en la plataforma.</p>
      <a href="https://tusistema.com/sign-in" style="display:inline-block;margin-top:12px;padding:10px 20px;background:#22c55e;color:white;text-decoration:none;border-radius:8px;">Iniciar sesión</a>
      <p style="color:#888;margin-top:16px;font-size:13px;">Si tienes dudas o problemas, contáctanos.</p>
    `
  });
}

export async function sendUserRejectedEmail(userEmail, nombre, comentario) {
  await transporter.sendMail({
    from: '"Plataforma" <noreply@mailtrap.io>',
    to: userEmail,
    subject: "Tu cuenta fue rechazada",
    html: `
      <h2>Hola, ${nombre}</h2>
      <p>Lamentablemente, tu cuenta fue <strong>rechazada</strong> por el administrador.</p>
      <p><b>Motivo:</b> ${comentario ? comentario : "No se indicó un motivo."}</p>
      <p style="color:#888;margin-top:16px;font-size:13px;">Si crees que esto fue un error o tienes preguntas, responde a este correo.</p>
    `
  });
}

export async function sendUserDisabledEmail(userEmail, nombre, comentario) {
  await transporter.sendMail({
    from: '"Plataforma" <noreply@mailtrap.io>',
    to: userEmail,
    subject: "Tu cuenta fue deshabilitada",
    html: `
      <h2>Hola, ${nombre}</h2>
      <p>Tu cuenta fue <strong>deshabilitada temporalmente</strong> por un administrador.</p>
      <p><b>Motivo:</b> ${comentario ? comentario : "No se indicó un motivo."}</p>
      <p>Mientras tu cuenta esté deshabilitada, no podrás acceder a la plataforma.</p>
      <p style="color:#888;margin-top:16px;font-size:13px;">Si necesitas más información, contáctanos.</p>
    `
  });
}

export async function sendUserEnabledEmail(userEmail, nombre) {
  await transporter.sendMail({
    from: '"Plataforma" <noreply@mailtrap.io>',
    to: userEmail,
    subject: "¡Tu cuenta ha sido habilitada de nuevo!",
    html: `
      <h2>Hola, ${nombre}</h2>
      <p>¡Tu cuenta ha sido <strong>habilitada</strong> nuevamente!</p>
      <p>Ya puedes volver a acceder a la plataforma.</p>
      <a href="https://tusistema.com/sign-in" style="display:inline-block;margin-top:12px;padding:10px 20px;background:#22c55e;color:white;text-decoration:none;border-radius:8px;">Iniciar sesión</a>
      <p style="color:#888;margin-top:16px;font-size:13px;">Bienvenido/a de vuelta.</p>
    `
  });
}
