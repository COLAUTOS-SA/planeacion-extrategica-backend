import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { PlanMensualSedeController } from "../controllers/plan_mensual_sede.controller.js";

const router = Router();
const controller =
  new PlanMensualSedeController();

router.use(authMiddleware);

router.get(
  "/plan-mensual/:idPlanMensual",
  controller.getByPlanMensual,
);

router.post(
  "/plan-mensual/:idPlanMensual",
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
  controller.remove,
);

export default router;