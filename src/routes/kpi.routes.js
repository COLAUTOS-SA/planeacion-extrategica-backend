import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { KpiController } from "../controllers/kpi.controller.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();
const controller = new KpiController();

router.use(authMiddleware);

router.get("/sedes", controller.getSedes);
router.get("/usuarios/:idUsuario/sedes", controller.getUsuarioSedes);
router.put(
  "/usuarios/:idUsuario/sedes",
  authorizeRoles("admin", "super_admin"),
  controller.updateUsuarioSedes,
);
router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.patch("/:id", controller.update);
router.delete("/:id", controller.delete);
router.post("/valores", controller.saveValores);

export default router;
