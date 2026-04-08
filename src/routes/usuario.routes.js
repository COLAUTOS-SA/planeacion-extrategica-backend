// src/routes/usuario.routes.js

import { Router } from "express";
import multer from "multer";
import { UsuarioController } from "../controllers/usuario.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();
const controller = new UsuarioController();

const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.patch("/:id/roles", authMiddleware, authorizeRoles("admin"), controller.updateRoles);

router.patch("/:id", controller.updateNombre);

router.patch("/:id/password", controller.updatePassword);

router.post("/:id/avatar", upload.single("avatar"), controller.uploadAvatar);

router.get("/:id/avatar", controller.getAvatar);

router.get("/me", authMiddleware, controller.getMe);

router.get(
  "/",
  authMiddleware,
  authorizeRoles("super_admin"), // o el nombre del rol 3
  controller.getUsuarios,
);

router.patch(
  "/:id/full",
  authMiddleware,
  authorizeRoles("super_admin"),
  controller.updateUser,
);

export default router;
