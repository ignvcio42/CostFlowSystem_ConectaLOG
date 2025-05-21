import { pool } from "../libs/database.js";
import { comparePassword, createJWT, hashPassword } from "../libs/index.js";
import crypto from "crypto";
import { sendVerificationEmail } from "../libs/mail.js";

export const signupUser = async (req, res) => {
  try {
    const { firstName, email, password, role = "user" } = req.body;
    if (!(firstName && email && password)) {
      return res
        .status(404)
        .json({ status: "error", message: "Please provide all fields" });
    }
    const userExist = await pool.query(
      "SELECT EXISTS (SELECT * FROM tbluser WHERE email = $1)",
      [email]
    );
    if (userExist.rows[0].exists) {
      return res
        .status(409)
        .json({ status: "error", message: "Email already exists" });
    }

    const hashedPassword = await hashPassword(password);

    const userResult = await pool.query(
      "INSERT INTO tbluser (firstName, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
      [firstName, email, hashedPassword, role]
    );
    const user = userResult.rows[0];

    // Generar token de verificación y guardar en tabla
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    await pool.query(
      `INSERT INTO tbl_email_verification (user_id, verification_token, expires_at) VALUES ($1, $2, $3)`,
      [user.id, verificationToken, expiresAt]
    );

    // Enviar email de verificación
    await sendVerificationEmail(email, verificationToken);

    user.password = undefined;

    res.status(201).json({
      status: "success",
      message: "User created. Please verify your email.",
      user,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  console.log("Llamada recibida a /verify-email con token:", req.query.token);
  const { token } = req.query;
  console.log("Token recibido:", token);

  if (!token) {
    return res.status(400).json({ status: "error", message: "Token missing" });
  }

  try {
    // 1. Buscar el registro del token, válido y no expirado, aún no verificado
    const result = await pool.query(
      `SELECT * FROM tbl_email_verification WHERE verification_token = $1 AND expires_at > NOW() AND verified = FALSE`,
      [token]
    );

    if (result.rows.length === 0) {
      return res
        .status(400)
        .json({ status: "error", message: "Token inválido o expirado." });
    }

    // 2. Actualizar el campo verified a TRUE
    const updateResult = await pool.query(
      `UPDATE tbl_email_verification SET verified = TRUE WHERE verification_token = $1 RETURNING *`,
      [token]
    );

    if (updateResult.rows.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "No se pudo actualizar el estado de verificación.",
      });
    }

    res.status(200).json({
      status: "success",
      message:
        "Correo verificado correctamente. Ahora espera la activación por parte del administrador.",
    });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const resendVerificationEmail = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email requerido" });

  // 1. Busca el usuario y verifica que no esté verificado
  const userResult = await pool.query(
    "SELECT * FROM tbluser WHERE email = $1",
    [email]
  );
  const user = userResult.rows[0];
  if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

  // (Opcional) Si ya está activado, no le mandes de nuevo
  if (user.estado)
    return res
      .status(400)
      .json({ message: "La cuenta ya está activada por un administrador." });

  // 2. Genera un nuevo token y actualiza la tabla
  const crypto = await import("crypto");
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // (Opcional) Invalida tokens anteriores, si quieres. O solo agrega uno nuevo.
  await pool.query(
    "INSERT INTO tbl_email_verification (user_id, verification_token, expires_at) VALUES ($1, $2, $3)",
    [user.id, verificationToken, expiresAt]
  );

  // 3. Envía el correo
  await sendVerificationEmail(email, verificationToken);

  res
    .status(200)
    .json({ message: "Se ha enviado un nuevo correo de verificación." });
};

export const signinUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query({
      text: "SELECT * FROM tbluser WHERE email = $1",
      values: [email],
    });

    const user = result.rows[0];

    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "Invalid email or password" });
    }

    const isMatch = await comparePassword(password, user?.password);

    if (!isMatch) {
      return res
        .status(404)
        .json({ status: "error", message: "Invalid email or password" });
    }
    if (!user.estado) {
      return res.status(403).json({
        status: "error",
        message:
          "Tu cuenta está deshabilitada. Espera activación por un administrador.",
      });
    }
    if (user.verified === false) {
      return res.status(403).json({
        status: "error",
        message:
          "Tu cuenta no está verificada. Revisa tu correo o reenvía el enlace.",
      });
    }

    const token = createJWT(user.id, user.role); // Pass the role to the JWT

    user.password = undefined; // Remove password from the response

    res.status(200).json({
      status: "success",
      message: "User logged in successfully",
      user,
      token,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};
