import { z } from "zod";
import { PlanMensualModel } from "../models/plan_mensual.model.js";
import { PlanMensualService } from "../services/plan_mensual.service.js";
import { successResponse } from "../utils/response.js";

const service = new PlanMensualService(new PlanMensualModel());

const createBodySchema = z.object({
  mes: z.number().int().min(1).max(12),
  indicador: z.union([z.number(), z.string()]).optional().default(0),
  ejecutado: z.union([z.number(), z.string(), z.null()]).optional(),
});

const updateBodySchema = z
  .object({
    mes: z.number().int().min(1).max(12).optional(),
    indicador: z.union([z.number(), z.string()]).optional(),
    ejecutado: z.union([z.number(), z.string(), z.null()]).optional(),
  })
  .refine((body) => Object.keys(body).length > 0, {
    message: "Debes enviar al menos un campo para actualizar",
  });

export class PlanMensualController {
  getByAnioNegocio = async (req, res, next) => {
    try {
      const data = await service.getByAnioNegocio(req.params.anio, req.params.idNegocio);
      return successResponse(res, data);
    } catch (error) {
      next(error);
    }
  };

  create = async (req, res, next) => {
    try {
      const payload = createBodySchema.parse(req.body);
      const data = await service.create(req.params.anio, req.params.idNegocio, payload);
      return successResponse(res, data, "Registro mensual creado correctamente", 201);
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const payload = updateBodySchema.parse(req.body);
      const data = await service.update(req.params.id, payload);
      return successResponse(res, data, "Registro mensual actualizado correctamente");
    } catch (error) {
      next(error);
    }
  };

  remove = async (req, res, next) => {
    try {
      const data = await service.remove(req.params.id);
      return successResponse(res, data, "Registro mensual eliminado correctamente");
    } catch (error) {
      next(error);
    }
  };
}
