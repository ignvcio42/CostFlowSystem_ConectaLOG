// libs/email.js
import { Resend } from "resend";

const resend = new Resend("re_5W2PUdB7_K7kK1ozrXstiWQedQWQovwWt"); // Reemplaza con tu API Key real

const FROM_EMAIL = "noreply@pruebastestcostflow.store"; // Cambia por tu dominio

export async function sendVerificationEmail(to, token) {
  const verifyUrl = `http://localhost:5173/verificar-correo?token=${token}`;
  await resend.emails.send({
    from: `"Tu App" <${FROM_EMAIL}>`,
    to,
    subject: "Verifica tu correo electrónico",
    html: `
      <p>Haz click en el siguiente enlace para verificar tu correo:</p>
      <a href="${verifyUrl}">${verifyUrl}</a>
      <p>Este enlace expirará en 24 horas.</p>
    `,
  });
}

export async function sendResetPasswordEmail(to, token) {
  const resetUrl = `http://localhost:5173/reset-password?token=${token}`;
  await resend.emails.send({
    from: `"Tu App" <${FROM_EMAIL}>`,
    to,
    subject: "Recuperar contraseña",
    html: `
      <p>Haz click en el siguiente enlace para restablecer tu contraseña:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>Este enlace expira en 1 hora.</p>
    `,
  });
}

export async function sendEmailToAdmins(adminEmails, user) {
  const subject = "Nuevo usuario esperando confirmación";
  const html = `
    <p>El usuario "<b>${user?.firstname}</b>" con correo "<b>${user?.email}</b>" ha verificado su correo y está esperando ser confirmado.</p>
    <p>Por favor ingresa al panel de administración para aceptar o rechazar la cuenta.</p>
  `;
  await resend.emails.send({
    from: `"Sistema" <${FROM_EMAIL}>`,
    to: adminEmails,
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

  await resend.emails.send({
    from: `"Sistema" <${FROM_EMAIL}>`,
    to: userEmail,
    subject,
    html,
  });
}

export async function sendUserRejectedEmail(userEmail, nombre, comentario = "") {
  await resend.emails.send({
    from: `"Sistema" <${FROM_EMAIL}>`,
    to: userEmail,
    subject: "Tu cuenta fue rechazada",
    html: `
      <p>Hola ${nombre},</p>
      <p>Lamentablemente tu cuenta fue rechazada.</p>
      <p>${comentario ? `Motivo: <i>${comentario}</i>` : ""}</p>
    `,
  });
}
export async function sendUserDisabledEmail(userEmail, nombre, comentario) {
  await resend.emails.send({
    from: `"Plataforma" <${FROM_EMAIL}>`,
    to: userEmail,
    subject: "Tu cuenta fue deshabilitada",
    html: `
      <h2>Hola, ${nombre}</h2>
      <p>Tu cuenta fue <strong>deshabilitada temporalmente</strong> por un administrador.</p>
      <p><b>Motivo:</b> ${comentario ? comentario : "No se indicó un motivo."}</p>
      <p>Mientras tu cuenta esté deshabilitada, no podrás acceder a la plataforma.</p>
      <p style="color:#888;margin-top:16px;font-size:13px;">Si necesitas más información, contáctanos.</p>
    `,
  });
}

export async function sendUserEnabledEmail(userEmail, nombre) {
  await resend.emails.send({
    from: `"Plataforma" <${FROM_EMAIL}>`,
    to: userEmail,
    subject: "¡Tu cuenta ha sido habilitada de nuevo!",
    html: `
      <h2>Hola, ${nombre}</h2>
      <p>¡Tu cuenta ha sido <strong>habilitada</strong> nuevamente!</p>
      <p>Ya puedes volver a acceder a la plataforma.</p>
      <a href="https://tusistema.com/sign-in" style="display:inline-block;margin-top:12px;padding:10px 20px;background:#22c55e;color:white;text-decoration:none;border-radius:8px;">Iniciar sesión</a>
      <p style="color:#888;margin-top:16px;font-size:13px;">Bienvenido/a de vuelta.</p>
    `,
  });
}

export async function sendUserQuerySummary(to, resultados) {
  const MAX_SHOWN = 10;
  const MAX_TXT_ROWS = 50; // máximo de filas en el adjunto TXT para evitar archivos muy grandes
  const total = resultados.length;

  // ==== HTML RESUMIDO ====
  let message = `
    <p>
      <strong>Respaldo automático y resumido de tus consultas.</strong><br>
      <b>Total consultas:</b> ${total}.<br>
      Por razones de tamaño, solo mostramos las primeras ${MAX_SHOWN} consultas.<br>
      Para revisar el detalle completo, ingresa a tu <b>Historial</b> en la plataforma.
    </p>
  `;

  let tableHeader = `
    <table border="1" cellpadding="3" cellspacing="0" style="border-collapse:collapse;font-size:12px;width:100%;max-width:800px">
      <tr>
        <th>#</th>
        <th>Origen</th>
        <th>Destino</th>
        <th>Capítulo</th>
        <th>Producto</th>
        <th>Costos (CLP)</th>
        <th>Costos (USD)</th>
      </tr>
  `;

  let tableRows = "";
  for (let i = 0; i < Math.min(total, MAX_SHOWN); i++) {
    const resp = resultados[i];
    const nacional = resp?.Nacional;
    const internacional = resp?.Internacional;
    tableRows += `
      <tr>
        <td>${i + 1}</td>
        <td>${nacional?.["origen local"] ?? "-"}</td>
        <td>${nacional?.["destino local"] ?? "-"}</td>
        <td>${nacional?.producto?.Capitulo ?? "-"}</td>
        <td>${nacional?.producto?.Partida ?? "-"}</td>
        <td>
          $${Number(nacional?.["Costos"]?.["Costo tramo ferrocarril ($)"] ?? 0).toFixed(0)} (Ferro),
          $${Number(nacional?.["Costos"]?.["Costo tramo camión ($)"] ?? 0).toFixed(0)} (Camión)
        </td>
        <td>
          $${Number(internacional?.["Costo Documental Total($USD)"] ?? 0).toFixed(0)} (Doc),
          $${Number(internacional?.["Costo Transporte Internacional($USD)"] ?? 0).toFixed(0)} (Transp)
        </td>
      </tr>
    `;
  }
  let tableFooter = "</table>";

  let finalMsg = "";
  if (total > MAX_SHOWN) {
    finalMsg = `
      <p style="color:#b91c1c;font-size:13px;">
        <b>Nota:</b> Solo se muestran las primeras ${MAX_SHOWN} consultas.<br>
        El respaldo completo está siempre disponible en la plataforma.<br>
        Si necesitas un respaldo en Excel, puedes exportar tu historial desde la web.
      </p>
    `;
  }

  const footer = `
    <br>
    <p style="font-size:11px;color:#888;">
      Este correo es solo un resumen automático.<br>
      No respondas a este mensaje. <br>
      Plataforma: <a href="http://localhost:5173/history" target="_blank">Historial</a>
    </p>
  `;

  const html =
    message + tableHeader + tableRows + tableFooter + finalMsg + footer;

  // ==== TXT ADJUNTO (solo si hay muchas consultas) ====
  let attachments = [];
  if (total > MAX_SHOWN) {
    let txtContent = `Respaldo resumido de tus consultas (${total} en total)\n\n`;
    txtContent +=
      "Solo se muestran las primeras " + MAX_TXT_ROWS + " consultas:\n";
    for (let i = 0; i < Math.min(total, MAX_TXT_ROWS); i++) {
      const resp = resultados[i];
      const nacional = resp?.Nacional;
      const internacional = resp?.Internacional;
      txtContent += `#${i + 1}: `;
      txtContent += `Origen=${nacional?.["origen local"] ?? "-"}, `;
      txtContent += `Destino=${nacional?.["destino local"] ?? "-"}, `;
      txtContent += `Capítulo=${nacional?.producto?.Capitulo ?? "-"}, `;
      txtContent += `Producto=${nacional?.producto?.Partida ?? "-"}, `;
      txtContent += `CostoFerroCLP=$${Number(nacional?.["Costos"]?.["Costo tramo ferrocarril ($)"] ?? 0).toFixed(0)}, `;
      txtContent += `CostoCamionCLP=$${Number(nacional?.["Costos"]?.["Costo tramo camión ($)"] ?? 0).toFixed(0)}, `;
      txtContent += `CostoDocUSD=$${Number(internacional?.["Costo Documental Total($USD)"] ?? 0).toFixed(0)}, `;
      txtContent += `CostoTranspUSD=$${Number(internacional?.["Costo Transporte Internacional($USD)"] ?? 0).toFixed(0)}\n`;
    }
    if (total > MAX_TXT_ROWS) {
      txtContent += `\n...Mostrando solo las primeras ${MAX_TXT_ROWS} consultas...\n`;
    }
    txtContent +=
      "\nEste archivo es solo un respaldo resumido. El historial completo está en la plataforma.";

    attachments.push({
      filename: "respaldo_consultas.txt",
      content: txtContent,
      contentType: "text/plain",
    });
  }

  // ==== ENVÍA EL CORREO ====
  await resend.emails.send({
    from: `"Tu App" <${FROM_EMAIL}>`,
    to,
    subject: "Respaldo resumido de tus consultas (no responder)",
    html,
    ...(attachments.length > 0 && { attachments }),
  });
}

