import { prisma } from "../config/database.js";

export class AprendizajeModel {
  async create(data) {
    return prisma.aprendizaje.create({
      data,
    });
  }

  async findAllByUser(userId) {
    return prisma.aprendizaje.findMany({
      where: {
        id_responsable: userId,
      },
      include: {
        estado: true,
      },
      orderBy: {
        fecha: "desc",
      },
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
}
