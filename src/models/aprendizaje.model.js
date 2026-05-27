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
      include: {
        evidencias: true,
      },
    });
  }

  async count(where) {
    return prisma.aprendizaje.count({
      where,
    });
  }

  async findById(id) {
    return prisma.aprendizaje.findUnique({
      where: {
        id_aprendizaje: id,
      },
      include: {
        evidencias: true,
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

  async updateFavorito(id, favorito) {
    return prisma.aprendizaje.update({
      where: {
        id_aprendizaje: id,
      },
      data: {
        favorito,
      },
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
      where,
    });
  }
}
