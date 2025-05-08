import JWT from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  const authHeader = req?.headers?.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res
      .status(401)
      .json({ status: "auth_failed", message: "Authentication failed" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = JWT.verify(token, process.env.JWT_SECRET);

    req.body.user = {
      userId: decoded.userId, // Agrega el userId al objeto user
      role: decoded.role, // Agrega el rol al objeto user
    };

    next();
  } catch (error) {
    console.log(error);
    return res
      .status(401)
      .json({ status: "auth_failed", message: "Authentication failed" });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.body.user.role !== "admin") {
    return res.status(403).json({ status: "error", message: "Access denied: Admins only" });
  }
  next();
};

export default authMiddleware;
