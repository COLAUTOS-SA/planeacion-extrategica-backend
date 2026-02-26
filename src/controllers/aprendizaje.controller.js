import { z } from "zod";

const createSchema = z.object({
  descripcion: z.string().min(3),
  fecha: z.string().optional(),
  comentarios: z.string().optional(),
  id_estado: z.number(),
});

export class AprendizajeController {
  constructor(service) {
    this.service = service;
  }

  create = async (req, res, next) => {
    try {
      const data = createSchema.parse(req.body);
      const userId = req.user.id;

      const result = await this.service.create(data, userId);

      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req, res, next) => {
    try {
      const results = await this.service.getAll(req.user.id);

      res.json({ success: true, data: results });
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const result = await this.service.update(id, req.body, req.user.id);

      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      await this.service.delete(id, req.user.id);

      res.json({ success: true, message: "Aprendizaje eliminado" });
    } catch (error) {
      next(error);
    }
  };
}
