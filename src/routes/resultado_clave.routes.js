// src/routes/resultado_clave.routes.js

import { Router } from "express";
import { ResultadoClaveModel } from "../models/resultado_clave.model.js";
import { ResultadoClaveService } from "../services/resultado_clave.service.js";
import { ResultadoClaveController } from "../controllers/resultado_clave.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { EvidenciaService } from "../services/evidencia.service.js";
import multer from "multer";


const router = Router();

const model = new ResultadoClaveModel();
const service = new ResultadoClaveService(model);
const controller = new ResultadoClaveController(service);

const upload = multer({
  limits: { fileSize: 50 * 1024 * 1024 },
});

const evidenciaService = new EvidenciaService();

router.use(authMiddleware);

router.post("/", controller.create);
router.get("/", controller.getAll);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);
router.get("/:id", controller.getById);
router.patch("/:id/favorito", controller.toggleFavorito);
router.post(
  "/:id/evidencias",
  upload.single("file"),
  async (req, res, next) => {
    try {
      const resultadoId = parseInt(req.params.id);

      const evidencia = await evidenciaService.uploadResultado(
        resultadoId,
        req.file,
      );

      res.json({
        success: true,
        data: evidencia,
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
