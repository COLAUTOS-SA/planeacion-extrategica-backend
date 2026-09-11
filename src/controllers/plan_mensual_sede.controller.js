import { z } from "zod";
import { successResponse } from "../utils/response.js";
import { PlanMensualSedeService } from "../services/plan_mensual_sede.service.js";

const service = new PlanMensualSedeService();

const createSchema = z.object({
  id_sede: z.number().int(),
  indicador: z.number().nonnegative(),
  ejecutado: z.number().nonnegative().optional(),
});

const updateSchema = z
  .object({
    indicador: z.number().nonnegative().optional(),
    ejecutado: z.number().nonnegative().optional(),
  })
  .refine(
    (body) => Object.keys(body).length > 0,
    {
      message:
        "Debes enviar al menos un campo",
    },
  );

export class PlanMensualSedeController {
  getByPlanMensual = async (
    req,
    res,
    next,
  ) => {
    try {
      return successResponse(
        res,
        await service.getByPlanMensual(
          parseInt(req.params.idPlanMensual),
        ),
      );
    } catch (error) {
      next(error);
    }
  };

  create = async (req, res, next) => {
    try {
      const body = createSchema.parse(req.body);

      return successResponse(
        res,
        await service.create(
          parseInt(req.params.idPlanMensual),
          body,
        ),
        "Registro creado correctamente",
        201,
      );
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const body = updateSchema.parse(req.body);

      return successResponse(
        res,
        await service.update(
          parseInt(req.params.id),
          body,
        ),
      );
    } catch (error) {
      next(error);
    }
  };

  remove = async (req, res, next) => {
    try {
      await service.delete(
        parseInt(req.params.id),
      );

      return successResponse(
        res,
        null,
        "Registro eliminado correctamente",
      );
    } catch (error) {
      next(error);
    }
  };
}