import { Router } from "express";
import { PrioridadModel } from "../models/prioridad.model.js";
import { PrioridadService } from "../services/prioridad.service.js";
import { PrioridadController } from "../controllers/prioridad.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

const model = new PrioridadModel();
const service = new PrioridadService(model);
const controller = new PrioridadController(service);

router.use(authMiddleware);

router.post("/", controller.create);
router.get("/", controller.getAll);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);

export default router;