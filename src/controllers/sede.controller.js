import { z } from "zod";
import { successResponse } from "../utils/response.js";
import { SedeService } from "../services/sede.service.js";

const service = new SedeService();

const schema = z.object({
  nombre: z.string().trim().min(3).max(100),
});

export class SedeController {
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
        "Sede creada correctamente",
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
        "Sede eliminada correctamente",
      );
    } catch (error) {
      next(error);
    }
  };
}