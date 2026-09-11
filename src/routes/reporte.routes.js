import { Router } from "express";
import { ReporteService } from "../services/reporte.service.js";
import { ReporteController } from "../controllers/reporte.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

const service = new ReporteService();
const controller = new ReporteController(service);

router.use(authMiddleware);

router.get("/lideres", controller.getLideres);
router.get("/lideres/:id/favoritos", controller.getFavoritos);

export default router;
