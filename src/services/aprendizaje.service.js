import { EstadoModel } from "../models/estado.model.js";
import { AppError } from "../utils/AppError.js";

const estadoModel = new EstadoModel();

export class AprendizajeService {
  constructor(model) {
    this.model = model;
  }

  async create(data, user) {
    if (!(await estadoModel.exists(data.id_estado))) {
      throw new AppError("Estado no válido", 400);
    }
    return this.model.create({
      ...data,
      fecha: data.fecha ? new Date(data.fecha) : null,
      id_responsable: user.id,
    });
  }

  async getAll(user, query) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;

    if (page < 1 || limit < 1) {
      throw new AppError("Parámetros de paginación inválidos", 400);
    }

    const skip = (page - 1) * limit;
    const where = {};

    if (user.rol === "lider") {
      where.id_responsable = user.id;
    }

    if (query.estado) {
      const estadoId = parseInt(query.estado);

      if (isNaN(estadoId)) {
        throw new AppError("Estado inválido", 400);
      }

      where.id_estado = estadoId;
    }

    const data = await this.model.findAllByUser(user.id, {
      where,
      skip,
      take: limit,
    });

    const total = await this.model.countByUser(user.id, where);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id, data, user) {
    if (!(await estadoModel.exists(data.id_estado))) {
      throw new AppError("Estado no válido", 400);
    }

    const existing = await this.model.findById(id);

    if (!existing) {
      throw { status: 404, message: "Aprendizaje no encontrado" };
    }

    if (user.rol === "lider" && existing.id_responsable !== user.id) {
      throw new AppError("No autorizado", 403);
    }

    return this.model.update(id, data);
  }

  async delete(id, user) {
    const existing = await this.model.findById(id);

    if (!existing) {
      throw { status: 404, message: "Aprendizaje no encontrado" };
    }

    if (user.rol === "lider" && existing.id_responsable !== user.id) {
      throw new AppError("No autorizado", 403);
    }

    return this.model.delete(id);
  }
}
