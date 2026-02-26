// src/services/resultado_clave.service.js

import { EstadoModel } from "../models/estado.model.js";
import { AppError } from "../utils/AppError.js";

const estadoModel = new EstadoModel();

export class ResultadoClaveService {
  constructor(model) {
    this.model = model;
  }

  async create(data, userId) {
    if (!(await estadoModel.exists(data.id_estado))) {
      throw new AppError("Estado no válido", 400);
    }

    return this.model.create({
      ...data,
      fecha_inicio: data.fecha_inicio ? new Date(data.fecha_inicio) : null,
      fecha_fin: data.fecha_fin ? new Date(data.fecha_fin) : null,
      id_responsable: userId,
      fecha_creacion: new Date(),
    });
  }

  async getAll(userId) {
    return this.model.findAllByUser(userId);
  }

  async update(id, data, userId) {
    if (data.id_estado) {
      if (!(await estadoModel.exists(data.id_estado))) {
        throw new AppError("Estado no válido", 400);
      }
    }

    const existing = await this.model.findById(id);

    if (!existing) {
      throw { status: 404, message: "Resultado clave no encontrado" };
    }

    if (existing.id_responsable !== userId) {
      throw { status: 403, message: "No autorizado" };
    }

    return this.model.update(id, data);
  }

  async delete(id, userId) {
    const existing = await this.model.findById(id);

    if (!existing) {
      throw { status: 404, message: "Resultado clave no encontrado" };
    }

    if (existing.id_responsable !== userId) {
      throw { status: 403, message: "No autorizado" };
    }

    return this.model.delete(id);
  }

  async getById(id, userId) {
    const existing = await this.model.findById(id);

    if (!existing) {
      throw new AppError("Resultado clave no encontrado", 404);
    }

    if (existing.id_responsable !== userId) {
      throw new AppError("No autorizado", 403);
    }

    return existing;
  }

  async getAll(userId, query) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;

    if (page < 1 || limit < 1) {
      throw new AppError("Parámetros de paginación inválidos", 400);
    }

    const skip = (page - 1) * limit;

    const where = {};

    if (query.estado) {
      const estadoId = parseInt(query.estado);

      if (isNaN(estadoId)) {
        throw new AppError("Estado inválido", 400);
      }

      where.id_estado = estadoId;
    }

    const data = await this.model.findAllByUser(userId, {
      where,
      skip,
      take: limit,
    });

    const total = await this.model.countByUser(userId, where);

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
}
