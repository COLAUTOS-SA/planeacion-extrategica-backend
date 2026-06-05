import { z } from "zod";
import { successResponse } from "../utils/response.js";
import { TareaService } from "../services/tarea.service.js";

const service =
  new TareaService();

const schema = z.object({
  titulo: z.string().optional(),

  descripcion: z
    .string()
    .min(3),

  fecha_inicio: z
    .string()
    .optional(),

  fecha_fin: z
    .string()
    .optional(),

  porcentaje_avance: z
    .number()
    .optional(),

  prioridad: z.enum([
    "BAJA",
    "MEDIA",
    "ALTA",
  ]),

  id_estado: z.number(),

  id_responsable:
    z.number(),

  id_objetivo_especifico:
    z.number(),

  responsables: z
    .array(z.number())
    .optional(),
});

export class TareaController {
  getAll = async (
    req,
    res,
    next,
  ) => {
    try {
      return successResponse(
        res,
        await service.getAll(),
      );
    } catch (error) {
      next(error);
    }
  };

  getById = async (
    req,
    res,
    next,
  ) => {
    try {
      return successResponse(
        res,
        await service.getById(
          parseInt(req.params.id),
        ),
      );
    } catch (error) {
      next(error);
    }
  };

  create = async (
    req,
    res,
    next,
  ) => {
    try {
      const data =
        schema.parse(req.body);

      return successResponse(
        res,
        await service.create(data),
        "Tarea creada correctamente",
        201,
      );
    } catch (error) {
      next(error);
    }
  };

  update = async (
    req,
    res,
    next,
  ) => {
    try {
      const data =
        schema
          .partial()
          .parse(req.body);

      return successResponse(
        res,
        await service.update(
          parseInt(req.params.id),
          data,
        ),
      );
    } catch (error) {
      next(error);
    }
  };

  delete = async (
    req,
    res,
    next,
  ) => {
    try {
      await service.delete(
        parseInt(req.params.id),
      );

      return successResponse(
        res,
        null,
        "Tarea eliminada correctamente",
      );
    } catch (error) {
      next(error);
    }
  };
}