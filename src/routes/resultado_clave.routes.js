// src/routes/resultado_clave.routes.js

import { Router } from "express";
import { ResultadoClaveModel } from "../models/resultado_clave.model.js";
import { ResultadoClaveService } from "../services/resultado_clave.service.js";
import { ResultadoClaveController } from "../controllers/resultado_clave.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

const model = new ResultadoClaveModel();
const service = new ResultadoClaveService(model);
const controller = new ResultadoClaveController(service);

router.use(authMiddleware);

router.post("/", controller.create);
router.get("/", controller.getAll);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);
router.get("/:id", controller.getById);
router.patch("/:id/favorito", controller.toggleFavorito);

export default router;
