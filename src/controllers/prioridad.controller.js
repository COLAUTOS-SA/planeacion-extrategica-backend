import { z } from "zod";
import { successResponse } from "../utils/response.js";

const createSchema = z.object({
  descripcion: z.string().min(3),
  fecha: z.string().optional(),
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
      const result = await this.service.update(id, req.body, req.user);

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
