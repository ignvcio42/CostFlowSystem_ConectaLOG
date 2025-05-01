import { comparePassword, hashPassword } from "../libs/index.js";
import { pool } from "../libs/database.js";

export const getUser = async (req, res) => {
    try {
        const {userId} = req.body.user;

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
        
        const {userId} = req.body.user;
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

        const {userId} = req.body.user;
        const {firstname, lastname, country, currency, contact} = req.body;

        const userExists = await pool.query({
            text: "SELECT * FROM tbluser WHERE id = $1",
            values: [userId],
        })

        const user = userExists.rows[0];

        if (!user) {
            return res.status(404).json({ status: "failed", message: "User not found" });
        }

        const updatedUser = await pool.query({
            text: "UPDATE tbluser SET firstname = $1, lastname = $2, country = $3, currency = $4, contact = $5, updatedat = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *",
            values: [firstname, lastname, country, currency, contact, userId],
        })

        updatedUser.rows[0].password = undefined; // Remove password from the response

        res.status(201).json({ status: "success", message: "User updated successfully", user: updatedUser.rows[0] });



    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "failed", message: "Internal server error" });
    }
};