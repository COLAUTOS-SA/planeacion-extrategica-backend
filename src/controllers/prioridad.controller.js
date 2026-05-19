import { z } from "zod";
import { successResponse } from "../utils/response.js";

const createSchema = z.object({
  descripcion: z.string().min(3),
  nombre_responsable: z.string().optional(),
  fecha_inicio: z.string().optional(),
  fecha_fin: z.string().optional(),
  comentarios: z.string().optional(),
  id_estado: z.number(),
});

export class PrioridadController {
  constructor(service) {
    this.service = service;
  }

  create = async (req, res, next) => {
    try {
      const data = createSchema.parse(req.body);
      const result = await this.service.create(data, req.user);

      return successResponse(res, result, "Creado correctamente", 201);
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req, res, next) => {
    try {
      const result = await this.service.getAll(req.user, req.query);

      return successResponse(res, result);
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const data = {
        descripcion: req.body.descripcion,
        fecha_inicio: req.body.fecha_inicio
          ? new Date(req.body.fecha_inicio)
          : null,

        fecha_fin: req.body.fecha_fin ? new Date(req.body.fecha_fin) : null,
        comentarios: req.body.comentarios,
        id_estado: req.body.id_estado,
        nombre_responsable: req.body.nombre_responsable,
      };

      const result = await this.service.update(id, data, req.user);

      return successResponse(res, result);
    } catch (error) {
      next(error);
    }
  };

  toggleFavorito = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const result = await this.service.toggleFavorito(id, req.user);

      return successResponse(res, result);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      await this.service.delete(id, req.user);

      return successResponse(res, null, "Prioridad eliminada", 200);
    } catch (error) {
      next(error);
    }
  };
}
