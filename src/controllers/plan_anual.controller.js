import { z } from "zod";
import { PlanAnualModel } from "../models/plan_anual.model.js";
import { PlanAnualService } from "../services/plan_anual.service.js";
import { successResponse } from "../utils/response.js";

const service = new PlanAnualService(new PlanAnualModel());

const negocioBodySchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
});

const planBodySchema = z.object({
  items: z
    .array(
      z.object({
        id_negocio: z.number().int().positive(),
        indicador: z.union([z.number(), z.string()]).optional().default(0),
        ejecutado: z.union([z.number(), z.string(), z.null()]).optional(),
      }),
    )
    .min(1, "Debes enviar al menos un item"),
});

export class PlanAnualController {
  getNegocios = async (req, res, next) => {
    try {
      const data = await service.getNegocios();
      return successResponse(res, data);
    } catch (error) {
      next(error);
    }
  };

  createNegocio = async (req, res, next) => {
    try {
      const { nombre } = negocioBodySchema.parse(req.body);
      const data = await service.createNegocio(nombre);
      return successResponse(res, data, "Negocio creado correctamente", 201);
    } catch (error) {
      next(error);
    }
  };

  updateNegocio = async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const { nombre } = negocioBodySchema.parse(req.body);
      const data = await service.updateNegocio(id, nombre);
      return successResponse(res, data, "Negocio actualizado correctamente");
    } catch (error) {
      next(error);
    }
  };

  deleteNegocio = async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const data = await service.deleteNegocio(id);
      return successResponse(res, data, "Negocio eliminado correctamente");
    } catch (error) {
      next(error);
    }
  };

  getByAnio = async (req, res, next) => {
    try {
      const data = await service.getPlanByAnio(req.params.anio);
      return successResponse(res, data);
    } catch (error) {
      next(error);
    }
  };

  getCompletoByAnio = async (req, res, next) => {
    try {
      const data = await service.getPlanCompletoByAnio(req.params.anio);
      return successResponse(res, data);
    } catch (error) {
      next(error);
    }
  };

  saveByAnio = async (req, res, next) => {
    try {
      const { items } = planBodySchema.parse(req.body);
      const data = await service.savePlanByAnio(req.params.anio, items);
      return successResponse(res, data, "Plan anual guardado correctamente");
    } catch (error) {
      next(error);
    }
  };
}
