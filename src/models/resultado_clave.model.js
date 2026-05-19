// src/models/resultado_clave.model.js

import { prisma } from "../config/database.js";

export class ResultadoClaveModel {
  async create(data) {
    return prisma.resultado_clave.create({
      data,
    });
  }

  async findAllByUser(userId, options) {
    const { where, skip, take } = options;

    return prisma.resultado_clave.findMany({
      where,
      skip,
      take,
      orderBy: {
        fecha_creacion: "desc",
      },
      include: {
        evidencias: true,
      },
    });
  }

  async count(where) {
    return prisma.resultado_clave.count({
      where,
    });
  }

  async findById(id) {
    return prisma.resultado_clave.findUnique({
      where: {
        id_resultado: id,
      },
      include: {
        evidencias: true,
      },
    });
  }

  async update(id, data) {
    return prisma.resultado_clave.update({
      where: {
        id_resultado: id,
      },
      data,
    });
  }

  async delete(id) {
    return prisma.resultado_clave.delete({
      where: {
        id_resultado: id,
      },
    });
  }

  async updateFavorito(id, favorito) {
    return prisma.resultado_clave.update({
      where: {
        id_resultado: id,
      },
      data: {
        favorito,
      },
    });
  }

  async countByUser(userId, where) {
    return prisma.resultado_clave.count({
      where: {
        id_responsable: userId,
        ...where,
      },
    });
  }
}
