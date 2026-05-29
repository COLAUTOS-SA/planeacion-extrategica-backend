import { prisma } from "../config/database.js";

export class SedeModel {
  async findAll() {
    return prisma.sede.findMany({
      orderBy: {
        nombre: "asc",
      },
    });
  }

  async findById(id) {
    return prisma.sede.findUnique({
      where: {
        id_sede: id,
      },
    });
  }

  async create(data) {
    return prisma.sede.create({
      data,
    });
  }

  async update(id, data) {
    return prisma.sede.update({
      where: {
        id_sede: id,
      },
      data,
    });
  }

  async delete(id) {
    return prisma.sede.delete({
      where: {
        id_sede: id,
      },
    });
  }

  async exists(id) {
    const sede = await this.findById(id);
    return !!sede;
  }

  async existsByName(nombre) {
    return prisma.sede.findFirst({
      where: {
        nombre,
      },
    });
  }
}