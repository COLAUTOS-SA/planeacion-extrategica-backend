import { prisma } from "../config/database.js";

export class PrioridadModel {
  async create(data) {
    return prisma.prioridad.create({ data });
  }

  async findAllByUser(userId) {
    return prisma.prioridad.findMany({
      where: { id_responsable: userId },
      include: { estado: true },
      orderBy: { fecha: "desc" },
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
}
