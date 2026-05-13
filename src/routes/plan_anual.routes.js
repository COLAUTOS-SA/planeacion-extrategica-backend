import { Router } from "express";
import { PlanAnualController } from "../controllers/plan_anual.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();
const controller = new PlanAnualController();

router.use(authMiddleware);

router.get("/negocios", controller.getNegocios);
router.post("/negocios", authorizeRoles("admin", "super_admin"), controller.createNegocio);
router.patch(
  "/negocios/:id",
  authorizeRoles("admin", "super_admin"),
  controller.updateNegocio,
);
router.delete(
  "/negocios/:id",
  authorizeRoles("admin", "super_admin"),
  controller.deleteNegocio,
);

router.get("/:anio/completo", controller.getCompletoByAnio);
router.get("/:anio", controller.getByAnio);
router.put("/:anio", authorizeRoles("admin", "super_admin"), controller.saveByAnio);

export default router;
