import { comparePassword, hashPassword } from "../libs/index.js";
import { pool } from "../libs/database.js";
import { sendUserAcceptedEmail, sendUserDisabledEmail, sendUserRejectedEmail } from "../libs/mail.js";

export const getUser = async (req, res) => {
  try {
    const { userId } = req.user;

    const userExists = await pool.query({
      text: "SELECT * FROM tbluser WHERE id = $1",
      values: [userId],
    });

    const user = userExists.rows[0];
    if (!user) {
      return res
        .status(404)
        .json({ status: "failed", message: "User not found" });
    }

    user.password = undefined; // Remove password from the response

    res.status(201).json({ status: "success", message: "User found", user });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ status: "failed", message: "Internal server error" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { userId } = req.user;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    const userExists = await pool.query({
      text: "SELECT * FROM tbluser WHERE id = $1",
      values: [userId],
    });

    const user = userExists.rows[0];

    if (!user) {
      return res
        .status(404)
        .json({ status: "failed", message: "User not found" });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(401)
        .json({ status: "failed", message: "Passwords do not match" });
    }

    const isMatch = await comparePassword(currentPassword, user?.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ status: "failed", message: "Current password is incorrect" });
    }

    const hashedPassword = await hashPassword(newPassword);

    await pool.query({
      text: "UPDATE tbluser SET password = $1 WHERE id = $2",
      values: [hashedPassword, userId],
    });

    res
      .status(201)
      .json({ status: "success", message: "Password updated successfully" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ status: "failed", message: "Internal server error" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { userId } = req.user;
    const { firstname, lastname, contact } = req.body;

    const userExists = await pool.query({
      text: "SELECT * FROM tbluser WHERE id = $1",
      values: [userId],
    });

    const user = userExists.rows[0];

    if (!user) {
      return res
        .status(404)
        .json({ status: "failed", message: "User not found" });
    }

    const updatedUser = await pool.query({
      text: "UPDATE tbluser SET firstname = $1, lastname = $2, contact = $3, updatedat = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *",
      values: [firstname, lastname, contact, userId],
    });

    updatedUser.rows[0].password = undefined; // Remove password from the response

    res.status(201).json({
      status: "success",
      message: "User updated successfully",
      user: updatedUser.rows[0],
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ status: "failed", message: "Internal server error" });
  }
};

export const getAllRoleUsers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM tbluser WHERE role = 'user' ORDER BY createdAt DESC"
    );
    res.status(200).json({ status: "success", users: result.rows });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ status: "error", message: "Error al obtener usuarios" });
  }
};

export const changeUserEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { nuevo_estado, motivo_estado, comentario } = req.body;
    const cambiado_por = req.user.userId;

    const userResult = await pool.query("SELECT * FROM tbluser WHERE id = $1", [
      id,
    ]);
    if (!userResult.rows.length) {
      return res
        .status(404)
        .json({ status: "error", message: "Usuario no encontrado" });
    }
    const user = userResult.rows[0];

    // Actualizar estado y motivo
    await pool.query(
      "UPDATE tbluser SET estado = $1, motivo_estado = $2, updatedat = CURRENT_TIMESTAMP WHERE id = $3",
      [nuevo_estado, motivo_estado, id]
    );

    // Registrar en historial
    await pool.query(
      "INSERT INTO tbl_user_estado_historial (user_id, cambiado_por, nuevo_estado, comentario) VALUES ($1, $2, $3, $4)",
      [id, cambiado_por, nuevo_estado, comentario]
    );

    // Envía correo según el motivo_estado (ejemplo, tú puedes agregar más casos)
    // Envía correo según el motivo_estado (ejemplo, tú puedes agregar más casos)
    if (user) {
      try {
        if (motivo_estado === "aceptado") {
          await sendUserAcceptedEmail(user.email, user.firstname);
        } else if (motivo_estado === "rechazado") {
          await sendUserRejectedEmail(user.email, user.firstname, comentario);
        } else if (motivo_estado === "deshabilitado") {
          await sendUserDisabledEmail(user.email, user.firstname, comentario);
        }
      } catch (correoError) {
        console.error(
          "No se pudo enviar el correo de notificación:",
          correoError
        );
        // No lances error, sigue normalmente
      }
    }

    res.status(200).json({
      status: "success",
      message: "Estado del usuario actualizado correctamente",
    });
  } catch (error) {
    console.error("Error actualizando estado:", error);
    res.status(500).json({ status: "error", message: "Error en el servidor" });
  }
};

// En tu userController.js

export const disableOwnUser = async (req, res) => {
  try {
    const userId = req.user.userId; // <-- del JWT
    const { comentario } = req.body;

    // Cambia el estado y motivo_estado
    await pool.query(
      "UPDATE tbluser SET estado = FALSE, motivo_estado = $1, updatedat = CURRENT_TIMESTAMP WHERE id = $2",
      ["deshabilitado", userId]
    );

    // Guarda en historial
    await pool.query(
      "INSERT INTO tbl_user_estado_historial (user_id, cambiado_por, nuevo_estado, comentario) VALUES ($1, $2, $3, $4)",
      [userId, userId, false, comentario || "Deshabilitado por el propio usuario"]
    );

    res.status(200).json({ status: "success", message: "Tu cuenta ha sido deshabilitada. Puedes volver a solicitar activación más adelante." });
  } catch (error) {
    console.error("Error deshabilitando usuario:", error);
    res.status(500).json({ status: "error", message: "Error en el servidor" });
  }
};

export const actualizarPeriodoValidez = async (req, res) => {
  const userId = req.user.userId;
  const { periodo_validez_meses } = req.body;

  if (
    !periodo_validez_meses ||
    isNaN(periodo_validez_meses) ||
    periodo_validez_meses <= 0
  ) {
    return res
      .status(400)
      .json({ message: "Valor de periodo inválido.", code: "INVALID_VALUE" });
  }

  try {
    await pool.query(
      `UPDATE tbluser
       SET validez_preferida = $1,
           updatedAt = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [periodo_validez_meses, userId]
    );

    res.status(200).json({ message: "Periodo actualizado correctamente." });
  } catch (error) {
    console.error("Error al actualizar periodo de validez:", error);
    res
      .status(500)
      .json({ message: "Error interno del servidor.", code: "INTERNAL_ERROR" });
  }
};

// En controllers/userController.js
export const obtenerPeriodoValidez = async (req, res) => {
  const userId = req.user.userId;
  try {
    const { rows } = await pool.query(
      "SELECT validez_preferida FROM tbluser WHERE id = $1",
      [userId]
    );
    const validez = rows[0]?.validez_preferida ?? 2;
    res.json({ periodo_validez_meses: validez });
  } catch (error) {
    console.error("Error al obtener validez:", error);
    res.status(500).json({ message: "Error interno" });
  }
};
