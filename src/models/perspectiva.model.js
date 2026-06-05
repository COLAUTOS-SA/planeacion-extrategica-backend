import { prisma } from "../config/database.js";

export class PerspectivaModel {
  async findAll() {
    return prisma.perspectiva.findMany({
      orderBy: {
        nombre: "asc",
      },
    });
  }

  async findById(id) {
    return prisma.perspectiva.findUnique({
      where: {
        id_perspectiva: id,
      },
    });
  }

  async findByName(nombre) {
    return prisma.perspectiva.findFirst({
      where: {
        nombre,
      },
    });
  }

  async create(data) {
    return prisma.perspectiva.create({
      data,
    });
  }

  async update(id, data) {
    return prisma.perspectiva.update({
      where: {
        id_perspectiva: id,
      },
      data,
    });
  }

  async delete(id) {
    return prisma.perspectiva.delete({
      where: {
        id_perspectiva: id,
      },
    });
  }

  async countObjetivos(id) {
    return prisma.objetivo_general.count({
      where: {
        id_perspectiva: id,
      },
    });
  }
}