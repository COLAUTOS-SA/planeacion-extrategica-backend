// src/controllers/resultado_clave.controller.js

import { z } from "zod";
import { successResponse } from "../utils/response.js";

const createSchema = z.object({
  compromiso: z.string().min(3),
  fecha_inicio: z.string().optional(),
  fecha_fin: z.string().optional(),
  comentarios: z.string().optional(),
  favorito: z.boolean().optional(),
  id_estado: z.number(),
});

export class ResultadoClaveController {
  constructor(service) {
    this.service = service;
  }

  create = async (req, res, next) => {
    try {
      const data = createSchema.parse(req.body);
      const userId = req.user.id;

      const result = await this.service.create(data, userId);

      return successResponse(res, result, "Creado correctamente", 201);
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req, res, next) => {
    try {
      const userId = req.user.id;

      const results = await this.service.getAll(userId);

      return successResponse(res, results);
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;

      const result = await this.service.update(id, req.body, userId);

      return successResponse(res, result);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;

      await this.service.delete(id, userId);

      return successResponse(
        res,
        null,
        "Resultado clave eliminado correctamente",
        200,
      );
    } catch (error) {
      next(error);
    }
  };

  getById = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const result = await this.service.getById(id, req.user.id);

      return successResponse(res, result);
    } catch (error) {
      next(error);
    }
  };
}
