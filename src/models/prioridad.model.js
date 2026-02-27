import { prisma } from "../config/database.js";

export class PrioridadModel {
  async create(data) {
    return prisma.prioridad.create({ data });
  }

  async findAllByUser(userId, options) {
    const { where, skip, take } = options;

    return prisma.prioridad.findMany({
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
    return prisma.prioridad.findUnique({
      where: { id_prioridad: id },
    });
  }

  async update(id, data) {
    return prisma.prioridad.update({
      where: { id_prioridad: id },
      data,
    });
  }

  async delete(id) {
    return prisma.prioridad.delete({
      where: { id_prioridad: id },
    });
  }

  async countByUser(userId, where) {
    return prisma.prioridad.count({
      where: {
        id_responsable: userId,
        ...where,
      },
    });
  }
}
