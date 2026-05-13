import { Router } from "express";
import { PlanMensualController } from "../controllers/plan_mensual.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();
const controller = new PlanMensualController();

router.use(authMiddleware);

router.get("/:anio/negocios/:idNegocio", controller.getByAnioNegocio);
router.post(
  "/:anio/negocios/:idNegocio",
  authorizeRoles("admin", "super_admin"),
  controller.create,
);
router.patch("/:id", authorizeRoles("admin", "super_admin"), controller.update);
router.delete("/:id", authorizeRoles("admin", "super_admin"), controller.remove);

export default router;
