import { comparePassword, hashPassword } from "../libs/index.js";
import { pool } from "../libs/database.js";

export const getUser = async (req, res) => {
    try {
        const {userId} = req.user;

        const userExists = await pool.query({
            text: "SELECT * FROM tbluser WHERE id = $1",
            values: [userId],
        })

        const user = userExists.rows[0];
        if (!user) {
            return res.status(404).json({ status: "failed", message: "User not found" });
        }

        user.password = undefined; // Remove password from the response

        res.status(201).json({ status: "success", message: "User found", user });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "failed", message: "Internal server error" });
    }
};

export const changePassword = async (req, res) => {
    try {
        
        const {userId} = req.user;
        const {currentPassword, newPassword, confirmPassword} = req.body;

        const userExists = await pool.query({
            text: "SELECT * FROM tbluser WHERE id = $1",
            values: [userId],
        })

        const user = userExists.rows[0];

        if (!user) {
            return res.status(404).json({ status: "failed", message: "User not found" });
        }

        if (newPassword !== confirmPassword) {
            return res.status(401).json({ status: "failed", message: "Passwords do not match" });
        }

        const isMatch = await comparePassword(currentPassword, user?.password);

        if (!isMatch) {
            return res.status(401).json({ status: "failed", message: "Current password is incorrect" });
        }

        const hashedPassword = await hashPassword(newPassword);

        await pool.query({
            text: "UPDATE tbluser SET password = $1 WHERE id = $2",
            values: [hashedPassword, userId],
        })

        res.status(201).json({ status: "success", message: "Password updated successfully" });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "failed", message: "Internal server error" });
    }
};

export const updateUser = async (req, res) => {
    try {

        const {userId} = req.user;
        const {firstname, lastname, contact} = req.body;

        const userExists = await pool.query({
            text: "SELECT * FROM tbluser WHERE id = $1",
            values: [userId],
        })

        const user = userExists.rows[0];

        if (!user) {
            return res.status(404).json({ status: "failed", message: "User not found" });
        }

        const updatedUser = await pool.query({
            text: "UPDATE tbluser SET firstname = $1, lastname = $2, contact = $3, updatedat = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *",
            values: [firstname, lastname, contact, userId],
        })

        updatedUser.rows[0].password = undefined; // Remove password from the response

        res.status(201).json({ status: "success", message: "User updated successfully", user: updatedUser.rows[0] });



    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "failed", message: "Internal server error" });
    }
};

export const getAllRoleUsers = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM tbluser WHERE role = 'user' ORDER BY createdAt DESC");
        res.status(200).json({ status: "success", users: result.rows });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "error", message: "Error al obtener usuarios" });
    }
};

export const changeUserEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { nuevo_estado, comentario } = req.body;
    const cambiado_por = req.user.userId;

    const userExists = await pool.query({
      text: "SELECT * FROM tbluser WHERE id = $1",
      values: [id],
    });

    if (!userExists.rows.length) {
      return res.status(404).json({ status: "error", message: "Usuario no encontrado" });
    }

    // Actualizar estado en tbluser
    await pool.query({
      text: "UPDATE tbluser SET estado = $1, updatedat = CURRENT_TIMESTAMP WHERE id = $2",
      values: [nuevo_estado, id],
    });

    // Registrar en historial
    await pool.query({
      text: "INSERT INTO tbl_user_estado_historial (user_id, cambiado_por, nuevo_estado, comentario) VALUES ($1, $2, $3, $4)",
      values: [id, cambiado_por, nuevo_estado, comentario],
    });

    res.status(200).json({ status: "success", message: "Estado del usuario actualizado correctamente" });

  } catch (error) {
    console.error("Error actualizando estado:", error);
    res.status(500).json({ status: "error", message: "Error en el servidor" });
  }
};


