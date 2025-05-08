import { pool } from "../libs/database.js";
import { comparePassword, createJWT, hashPassword } from "../libs/index.js";

export const signupUser = async (req, res) => {
    try {
        const { firstName, email, password, role = 'user' } = req.body;

        if (!(firstName || email || password)) {
            return res.status(404).json({ status: "error", message: "Please provide all fields" });
        }

        const userExist = await pool.query({
            text: "SELECT EXISTS (SELECT * FROM tbluser WHERE email = $1)",
            values: [email],
        });

        if (userExist.rows[0].exists) {
            return res.status(409).json({ status: "error", message: "Email already exists" });
        }

        const hashedPassword = await hashPassword(password);

        const user = await pool.query({
            text: "INSERT INTO tbluser (firstName, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
            values: [firstName, email, hashedPassword, role],
        });

        user.rows[0].password = undefined;

        res.status(201).json({ status: "success", message: "User created successfully", user: user.rows[0] });

    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ status: "error", message: error.message });
    }
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
            return res.status(404).json({ status: "error", message: "Invalid email or password" });
        }

        const isMatch = await comparePassword(password, user?.password);

        if (!isMatch) {
            return res.status(404).json({ status: "error", message: "Invalid email or password" });
        }

        const token = createJWT(user.id , user.role); // Pass the role to the JWT

        user.password = undefined; // Remove password from the response

        res.status(200).json({ status: "success", message: "User logged in successfully", user, token });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ status: "error", message: error.message });
    }
};

