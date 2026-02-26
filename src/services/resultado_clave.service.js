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
}
