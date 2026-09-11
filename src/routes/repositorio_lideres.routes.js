import { Router } from "express";
import multer from "multer";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { RepositorioLideresModel } from "../models/repositorio_lideres.model.js";
import { RepositorioLideresService } from "../services/repositorio_lideres.service.js";
import { RepositorioLideresController } from "../controllers/repositorio_lideres.controller.js";

const router = Router();

const upload = multer({
  limits: {
    fileSize: 30 * 1024 * 1024,
  },
});

const model = new RepositorioLideresModel(); 
const service = new RepositorioLideresService(model);
const controller = new RepositorioLideresController(service);

router.use(authMiddleware);

router.get("/eventos", controller.getByRango);
router.get("/eventos/:fecha", controller.getByFecha);
router.put("/eventos/:fecha", controller.saveResumen);
router.post("/eventos/:fecha/archivos", upload.array("files", 10), controller.uploadArchivos);
router.delete("/documentos/:id", controller.deleteDocumento);
router.get("/documentos/:id/descargar", controller.downloadDocumento);

export default router;

