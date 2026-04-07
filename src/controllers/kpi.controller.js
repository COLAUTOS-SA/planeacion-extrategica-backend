import { z } from "zod";
import { successResponse } from "../utils/response.js";
import { KpiModel } from "../models/kpi.model.js";
import { KpiService } from "../services/kpi.service.js";

const service = new KpiService(new KpiModel());

const createUpdateSchema = z.object({
  titulo: z.string().optional(),
  proceso: z.string().optional().nullable(),
  plan_accion: z.string().optional().nullable(),
  tipo: z.enum(["individual", "regional"]).optional(),
  id_responsable: z.number().int().optional(),
  id_objetivo_general: z.number().int().optional().nullable(),
  meta: z.union([z.number(), z.string()]).optional(),
  valor_actual: z.union([z.number(), z.string()]).optional(),
  sedes: z.array(z.number().int()).optional(),
  indicadores: z
    .array(
      z.union([
        z.string(),
        z.object({
          nombre: z.string(),
        }),
      ]),
    )
    .optional(),
});

const valoresSchema = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  valores: z.array(
    z.object({
      id_indicador: z.number().int(),
      id_sede: z.number().int().nullable().optional(),
      objetivo: z.union([z.number(), z.string(), z.null()]).optional(),
      resultado: z.union([z.number(), z.string(), z.null()]).optional(),
    }),
  ),
});

const usuarioSedesSchema = z.object({
  sedes: z.array(z.number().int()).min(1),
});

export class KpiController {
  getSedes = async (req, res, next) => {
    try {
      const data = await service.getSedes();
      return successResponse(res, data);
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req, res, next) => {
    try {
      const data = await service.getAll(req.user);
      return successResponse(res, data);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const data = await service.getById(id, req.user);
      return successResponse(res, data);
    } catch (error) {
      next(error);
    }
  };

  create = async (req, res, next) => {
    try {
      const payload = createUpdateSchema.parse(req.body);
      const data = await service.create(payload, req.user);
      return successResponse(res, data, "KPI creado correctamente", 201);
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const payload = createUpdateSchema.parse(req.body);
      const data = await service.update(id, payload, req.user);
      return successResponse(res, data, "KPI actualizado correctamente");
    } catch (error) {
      next(error);
    }
  };

  delete = async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const data = await service.delete(id, req.user);
      return successResponse(res, data, "KPI eliminado correctamente");
    } catch (error) {
      next(error);
    }
  };

  saveValores = async (req, res, next) => {
    try {
      const payload = valoresSchema.parse(req.body);
      const data = await service.saveValores(payload, req.user);
      return successResponse(res, data, "Valores registrados correctamente");
    } catch (error) {
      next(error);
    }
  };

  getUsuarioSedes = async (req, res, next) => {
    try {
      const idUsuario = Number(req.params.idUsuario);
      const data = await service.getUsuarioSedes(idUsuario, req.user);
      return successResponse(res, data);
    } catch (error) {
      next(error);
    }
  };

  updateUsuarioSedes = async (req, res, next) => {
    try {
      const idUsuario = Number(req.params.idUsuario);
      const { sedes } = usuarioSedesSchema.parse(req.body);
      const data = await service.updateUsuarioSedes(idUsuario, sedes, req.user);
      return successResponse(res, data, "Sedes del usuario actualizadas correctamente");
    } catch (error) {
      next(error);
    }
  };
}
