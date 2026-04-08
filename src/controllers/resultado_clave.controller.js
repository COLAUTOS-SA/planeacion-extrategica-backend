// src/controllers/resultado_clave.controller.js

import { z } from "zod";
import { successResponse } from "../utils/response.js";

const createSchema = z.object({
  compromiso: z.string().min(3),
  nombre_responsable: z.string().min(3),
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
      const user = req.user;

      const result = await this.service.create(data, user);

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
      const user = req.user;

      const data = {
        compromiso: req.body.compromiso,
        fecha_inicio: req.body.fecha_inicio,
        fecha_fin: req.body.fecha_fin,
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
      const user = req.user;

      await this.service.delete(id, user);

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
      const result = await this.service.getById(id, req.user);

      return successResponse(res, result);
    } catch (error) {
      next(error);
    }
  };
}
