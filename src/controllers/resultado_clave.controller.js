// src/controllers/resultado_clave.controller.js

import { z } from "zod";

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

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req, res, next) => {
    try {
      const userId = req.user.id;

      const results = await this.service.getAll(userId);

      res.json({
        success: true,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;

      const result = await this.service.update(id, req.body, userId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;

      await this.service.delete(id, userId);

      res.json({
        success: true,
        message: "Resultado eliminado correctamente",
      });
    } catch (error) {
      next(error);
    }
  };
}
