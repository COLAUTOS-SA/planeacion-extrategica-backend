import { Router } from "express";
import { ObjetivoEspecificoController } from "../controllers/objetivo_especifico.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();

const controller =
  new ObjetivoEspecificoController();

router.use(authMiddleware);

router.get("/", controller.getAll);

router.get("/:id", controller.getById);

router.post(
  "/",
  authorizeRoles(
    "admin",
    "super_admin",
  ),
  controller.create,
);

router.patch(
  "/:id",
  authorizeRoles(
    "admin",
    "super_admin",
  ),
  controller.update,
);

router.delete(
  "/:id",
  authorizeRoles(
    "admin",
    "super_admin",
  ),
  controller.delete,
);

export default router;