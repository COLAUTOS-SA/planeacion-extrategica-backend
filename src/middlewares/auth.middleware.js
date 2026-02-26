import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;

if (!header || !header.startsWith("Bearer ")) {
  return res.status(401).json({ message: "Unauthorized" });
}

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    req.user = decoded; // ahora decoded.id es id_usuario

    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};
