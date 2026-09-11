import { z } from "zod";
import { successResponse } from "../utils/response.js";
import { ObjetivoGeneralService } from "../services/objetivo_general.service.js";

const service = new ObjetivoGeneralService();

const schema = z.object({
  titulo: z.string().trim().min(3),

  descripcion: z.string().optional(),

  fecha_inicio: z.string().optional(),

  fecha_fin: z.string().optional(),

  activo: z.boolean().optional(),

  id_perspectiva: z.number(),

  responsables: z.array(z.number()).default([]),
});

export class ObjetivoGeneralController {
  getAll = async (req, res, next) => {
    try {
      return successResponse(res, await service.getAll());
    } catch (error) {
      next(error);
    }
  };

  getById = async (req, res, next) => {
    try {
      return successResponse(
        res,
        await service.getById(parseInt(req.params.id)),
      );
    } catch (error) {
      next(error);
    }
  };

  create = async (req, res, next) => {
    try {
      const data = schema.parse(req.body);

      return successResponse(
        res,
        await service.create(data),
        "Objetivo general creado correctamente",
        201,
      );
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const data = schema.partial().parse(req.body);

      return successResponse(
        res,
        await service.update(parseInt(req.params.id), data),
      );
    } catch (error) {
      next(error);
    }
  };

  delete = async (req, res, next) => {
    try {
      await service.delete(parseInt(req.params.id));

      return successResponse(
        res,
        null,
        "Objetivo general eliminado correctamente",
      );
    } catch (error) {
      next(error);
    }
  };
}
