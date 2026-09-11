import { EvidenciaService } from "../services/evidencia.service.js";

const service = new EvidenciaService();

export class EvidenciaController {
  uploadFiles = async (req, res, next) => {
    try {
      const resultadoId = parseInt(req.params.id);

      const evidencias = await service.uploadFiles(resultadoId, req.files);

      res.json({
        success: true,
        data: evidencias,
      });
    } catch (error) {
      next(error);
    }
  };

  createLink = async (req, res, next) => {
    try {
      const resultadoId = parseInt(req.params.id);

      const { url, descripcion } = req.body;

      const evidencia = await service.createLink(resultadoId, url, descripcion);

      res.json({
        success: true,
        data: evidencia,
      });
    } catch (error) {
      next(error);
    }
  };

  async getFile(req, res) {
    const id = parseInt(req.params.id);

    const result = await service.getFile(id);

    if (result.tipo === "link") {
      return res.json({ url: result.url });
    }

    const extension = result.url.split(".").pop();

    const mimeTypes = {
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      webp: "image/webp",
      svg: "image/svg+xml",
      mp4: "video/mp4",
    };

    res.setHeader(
      "Content-Type",
      mimeTypes[extension] || "application/octet-stream",
    );

    res.send(result.buffer);
  }

  delete = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);

      await service.delete(id);

      res.json({
        success: true,
        message: "Evidencia eliminada",
      });
    } catch (error) {
      next(error);
    }
  };

  uploadFilesAprendizaje = async (req, res, next) => {
    try {
      const aprendizajeId = parseInt(req.params.id);

      const evidencias = await service.uploadFilesAprendizaje(
        aprendizajeId,
        req.files,
      );

      res.json({
        success: true,
        data: evidencias,
      });
    } catch (error) {
      next(error);
    }
  };

  createLinkAprendizaje = async (req, res, next) => {
    try {
      const aprendizajeId = parseInt(req.params.id);

      const { url, descripcion } = req.body;

      const evidencia = await service.createLinkAprendizaje(
        aprendizajeId,
        url,
        descripcion,
      );

      res.json({
        success: true,
        data: evidencia,
      });
    } catch (error) {
      next(error);
    }
  };

  uploadFilesPrioridad = async (req, res, next) => {
    try {
      const prioridadId = parseInt(req.params.id);

      const evidencias = await service.uploadFilesPrioridad(
        prioridadId,
        req.files,
      );

      res.json({
        success: true,
        data: evidencias,
      });
    } catch (error) {
      next(error);
    }
  };

  createLinkPrioridad = async (req, res, next) => {
    try {
      const prioridadId = parseInt(req.params.id);

      const { url, descripcion } = req.body;

      const evidencia = await service.createLinkPrioridad(
        prioridadId,
        url,
        descripcion,
      );

      res.json({
        success: true,
        data: evidencia,
      });
    } catch (error) {
      next(error);
    }
  };
}
