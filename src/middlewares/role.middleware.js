import { AppError } from "../utils/AppError.js";

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const userRoles = req.user.roles; // array

    if (!userRoles || userRoles.length === 0) {
      return res.status(403).json({ message: "Sin roles asignados" });
    }

    const hasAccess = userRoles.some((role) => allowedRoles.includes(role));

    if (!hasAccess) {
      return res.status(403).json({ message: "No autorizado" });
    }

    next();
  };
};