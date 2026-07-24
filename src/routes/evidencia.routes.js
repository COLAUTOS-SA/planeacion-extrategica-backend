import { Router } from "express";
import multer from "multer";
import { EvidenciaController } from "../controllers/evidencia.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

const controller = new EvidenciaController();

const upload = multer({
  limits: { fileSize: 100 * 1024 * 1024 },
});

const MAX_EVIDENCIA_FILES = 5;

// router.use(authMiddleware);

router.post(
  "/resultados/:id/evidencias/files",
  upload.array("files", MAX_EVIDENCIA_FILES),
  controller.uploadFiles,
);

router.post("/resultados/:id/evidencias/link", controller.createLink);

router.get("/evidencias/:id", controller.getFile);

router.post(
  "/aprendizajes/:id/evidencias/files",
  upload.array("files", MAX_EVIDENCIA_FILES),
  controller.uploadFilesAprendizaje,
);

router.post(
  "/aprendizajes/:id/evidencias/link",
  controller.createLinkAprendizaje,
);

router.post(
  "/prioridades/:id/evidencias/files",
  upload.array("files", MAX_EVIDENCIA_FILES),
  controller.uploadFilesPrioridad,
);

router.post("/prioridades/:id/evidencias/link", controller.createLinkPrioridad);

router.delete("/evidencias/:id", controller.delete);

export default router;
