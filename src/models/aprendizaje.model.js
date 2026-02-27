import { prisma } from "../config/database.js";

export class AprendizajeModel {
  async create(data) {
    return prisma.aprendizaje.create({
      data,
    });
  }

  async findAllByUser(userId, options) {
    const { where, skip, take } = options;

    return prisma.aprendizaje.findMany({
      where,
      skip,
      take,
      orderBy: {
        fecha: "desc",
      },
    });
  }

  async count(where) {
    return prisma.resultado_clave.count({
      where,
    });
  }

  async findById(id) {
    return prisma.aprendizaje.findUnique({
      where: {
        id_aprendizaje: id,
      },
    });
  }

  async update(id, data) {
    return prisma.aprendizaje.update({
      where: {
        id_aprendizaje: id,
      },
      data,
    });
  }

  async delete(id) {
    return prisma.aprendizaje.delete({
      where: {
        id_aprendizaje: id,
      },
    });
  }

  async countByUser(userId, where) {
    return prisma.aprendizaje.count({
      where: {
        id_responsable: userId,
        ...where,
      },
    });
  }
}
