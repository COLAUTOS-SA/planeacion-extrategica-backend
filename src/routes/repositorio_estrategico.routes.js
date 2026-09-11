import { Router } from "express";
import multer from "multer";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { RepositorioEstrategicoModel } from "../models/repositorio_estrategico.model.js";
import { RepositorioEstrategicoService } from "../services/repositorio_estrategico.service.js";
import { RepositorioEstrategicoController } from "../controllers/repositorio_estrategico.controller.js";

const router = Router();

const upload = multer({
  limits: {
    fileSize: 30 * 1024 * 1024,
  },
});

const model = new RepositorioEstrategicoModel();
const service = new RepositorioEstrategicoService(model);
const controller = new RepositorioEstrategicoController(service);

router.use(authMiddleware);

router.get("/eventos", controller.getByRango);
router.get("/eventos/:fecha", controller.getByFecha);
router.put("/eventos/:fecha", controller.saveEvento);
router.post(
  "/eventos/:fecha/archivos",
  upload.array("files", 10),
  controller.uploadArchivos,
);
router.delete("/documentos/:id", controller.deleteDocumento);
router.get("/documentos/:id/descargar", controller.downloadDocumento);

export default router;
