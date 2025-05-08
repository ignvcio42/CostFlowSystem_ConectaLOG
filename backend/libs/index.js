import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


export const hashPassword = async (userValue) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userValue, salt);
    return hashedPassword;
};

export const comparePassword = async (userPassword, password) => {
    try {
        const isMatch = await bcrypt.compare(userPassword, password);
        return isMatch;
    } catch (error) {
        console.log("Error comparing password:", error);
    }
};

export const createJWT = (id, role) => {
    return jwt.sign(
        {
            userId: id,
            role: role,  // <- incluimos el rol en el token
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d",
        }
    );
};


