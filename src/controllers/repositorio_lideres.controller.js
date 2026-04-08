import { z } from "zod";
import { successResponse } from "../utils/response.js";

const fechaSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const rangoSchema = z.object({
  from: fechaSchema,
  to: fechaSchema,
});
const resumenSchema = z.object({
  resumen_reunion: z.string().optional().default(""),
});

const MIME_BY_EXTENSION = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  svg: "image/svg+xml",
  mp4: "video/mp4",
  mov: "video/quicktime",
  avi: "video/x-msvideo",
  mkv: "video/x-matroska",
  webm: "video/webm",
};

export class RepositorioLideresController {
  constructor(service) {
    this.service = service;
  }

  getByRango = async (req, res, next) => {
    try {
      const { from, to } = rangoSchema.parse(req.query);
      const data = await this.service.getEventosByRango(from, to);
      return successResponse(res, data);
    } catch (error) {
      next(error);
    }
  };

  getByFecha = async (req, res, next) => {
    try {
      const fecha = fechaSchema.parse(req.params.fecha);
      const data = await this.service.getEventoByFecha(fecha);
      return successResponse(res, data);
    } catch (error) {
      next(error);
    }
  };

  saveResumen = async (req, res, next) => {
    try {
      const fecha = fechaSchema.parse(req.params.fecha);
      const { resumen_reunion } = resumenSchema.parse(req.body);
      const data = await this.service.saveResumen(fecha, resumen_reunion, req.user);

      return successResponse(res, data, "Resumen guardado correctamente");
    } catch (error) {
      next(error);
    }
  };

  uploadArchivos = async (req, res, next) => {
    try {
      const fecha = fechaSchema.parse(req.params.fecha);
      const data = await this.service.uploadArchivos(fecha, req.files, req.user);

      return successResponse(res, data, "Archivos cargados correctamente", 201);
    } catch (error) {
      next(error);
    }
  };

  deleteDocumento = async (req, res, next) => {
    try {
      const idDocumento = Number(req.params.id);
      const data = await this.service.deleteDocumento(idDocumento, req.user);

      return successResponse(res, data, "Documento eliminado correctamente");
    } catch (error) {
      next(error);
    }
  };

  downloadDocumento = async (req, res, next) => {
    try {
      const idDocumento = Number(req.params.id);
      const { fileName, buffer } = await this.service.downloadDocumento(idDocumento);
      const extension = fileName.split(".").pop()?.toLowerCase() || "";
      const mimeType =
        MIME_BY_EXTENSION[extension] || "application/octet-stream";

      res.setHeader("Content-Type", mimeType);
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${fileName}"`,
      );

      return res.send(buffer);
    } catch (error) {
      next(error);
    }
  };
}
