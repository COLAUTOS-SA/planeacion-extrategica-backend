import { Router } from "express";
import { AprendizajeModel } from "../models/aprendizaje.model.js";
import { AprendizajeService } from "../services/aprendizaje.service.js";
import { AprendizajeController } from "../controllers/aprendizaje.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

const model = new AprendizajeModel();
const service = new AprendizajeService(model);
const controller = new AprendizajeController(service);

router.use(authMiddleware);

router.post("/", controller.create);
router.get("/", controller.getAll);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);

export default router;
