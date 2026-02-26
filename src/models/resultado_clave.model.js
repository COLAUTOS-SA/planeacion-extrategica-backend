// src/models/resultado_clave.model.js

import { prisma } from "../config/database.js";

export class ResultadoClaveModel {
  async create(data) {
    return prisma.resultado_clave.create({
      data,
    });
  }

  async findAllByUser(userId) {
    return prisma.resultado_clave.findMany({
      where: {
        id_responsable: userId,
      },
      include: {
        estado: true,
      },
      orderBy: {
        fecha_creacion: "desc",
      },
    });
  }

  async findById(id) {
    return prisma.resultado_clave.findUnique({
      where: {
        id_resultado: id,
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
}
