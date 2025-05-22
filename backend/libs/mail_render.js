// // libs/email.js
// import { Resend } from "resend";

// const resend = new Resend("re_5W2PUdB7_K7kK1ozrXstiWQedQWQovwWt"); // Reemplaza con tu API Key real

// const FROM_EMAIL = "noreply@pruebastestcostflow.store"; // Cambia por tu dominio

// export async function sendVerificationEmail(to, token) {
//   const verifyUrl = `http://localhost:5173/verificar-correo?token=${token}`;
//   await resend.emails.send({
//     from: `"Tu App" <${FROM_EMAIL}>`,
//     to,
//     subject: "Verifica tu correo electrónico",
//     html: `
//       <p>Haz click en el siguiente enlace para verificar tu correo:</p>
//       <a href="${verifyUrl}">${verifyUrl}</a>
//       <p>Este enlace expirará en 24 horas.</p>
//     `,
//   });
// }

// export async function sendResetPasswordEmail(to, token) {
//   const resetUrl = `http://localhost:5173/reset-password?token=${token}`;
//   await resend.emails.send({
//     from: `"Tu App" <${FROM_EMAIL}>`,
//     to,
//     subject: "Recuperar contraseña",
//     html: `
//       <p>Haz click en el siguiente enlace para restablecer tu contraseña:</p>
//       <a href="${resetUrl}">${resetUrl}</a>
//       <p>Este enlace expira en 1 hora.</p>
//     `,
//   });
// }

// export async function sendEmailToAdmins(adminEmails, user) {
//   const subject = "Nuevo usuario esperando confirmación";
//   const html = `
//     <p>El usuario <b>${user?.firstname}</b> con correo <b>${user?.email}</b> ha verificado su correo y está esperando ser confirmado.</p>
//     <p>Por favor ingresa al panel de administración para aceptar o rechazar la cuenta.</p>
//   `;
//   await resend.emails.send({
//     from: `"Sistema" <${FROM_EMAIL}>`,
//     to: adminEmails,
//     subject,
//     html,
//   });
// }

// export async function sendUserAcceptedEmail(userEmail, nuevo_estado, comentario) {
//   const subject = nuevo_estado
//     ? "¡Tu cuenta ha sido aceptada!"
//     : "Tu cuenta fue rechazada";
//   const html = nuevo_estado
//     ? `<p>¡Felicitaciones! Tu cuenta ha sido activada y ya puedes iniciar sesión.</p>`
//     : `<p>Lamentablemente, tu cuenta fue rechazada. Comentario del admin: <br>${comentario || "(Sin comentario)"}.</p>`;

//   await resend.emails.send({
//     from: `"Sistema" <${FROM_EMAIL}>`,
//     to: userEmail,
//     subject,
//     html,
//   });
// }

// export async function sendUserRejectedEmail(userEmail, nombre, comentario = "") {
//   await resend.emails.send({
//     from: `"Sistema" <${FROM_EMAIL}>`,
//     to: userEmail,
//     subject: "Tu cuenta fue rechazada",
//     html: `
//       <p>Hola ${nombre},</p>
//       <p>Lamentablemente tu cuenta fue rechazada.</p>
//       <p>${comentario ? `Motivo: <i>${comentario}</i>` : ""}</p>
//     `,
//   });
// }
