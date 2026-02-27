import { AppError } from "../utils/AppError.js";

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user.rol;

    if (!allowedRoles.includes(userRole)) {
      throw new AppError("No tienes permisos para esta acción", 403);
    }

    next();
  };
};
