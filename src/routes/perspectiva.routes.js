import { Router } from "express";
import { PerspectivaController } from "../controllers/perspectiva.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();

const controller =
  new PerspectivaController();

router.use(authMiddleware);

router.get(
  "/",
  controller.getAll,
);

router.get(
  "/:id",
  controller.getById,
);

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