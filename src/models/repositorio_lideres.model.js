import { prisma } from "../config/database.js";

export class RepositorioLideresModel {
  async findEventoByFecha(fecha) {
    const start = new Date(fecha);
    const end = new Date(fecha);
    end.setUTCHours(23, 59, 59, 999);

    return prisma.calendario_lideres.findFirst({
      where: {
        fecha: {
          gte: start,
          lte: end,
        },
      },
      include: {
        repositorio_lideres: {
          orderBy: { id_documento: "desc" },
        },
      },
    });
  }

  async findEventosByRango(desde, hasta) {
    return prisma.calendario_lideres.findMany({
      where: {
        fecha: {
          gte: desde,
          lte: hasta,
        },
      },
      include: {
        repositorio_lideres: {
          orderBy: { id_documento: "desc" },
        },
      },
      orderBy: {
        fecha: "asc",
      },
    });
  }

  async createEvento(data) {
    return prisma.calendario_lideres.create({
      data,
      include: {
        repositorio_lideres: true,
      },
    });
  }

  async updateEvento(idEvento, data) {
    return prisma.calendario_lideres.update({
      where: { id_evento: idEvento },
      data,
      include: {
        repositorio_lideres: true,
      },
    });
  }

  async createDocumento(data) {
    return prisma.repositorio_lideres.create({ data });
  }

  async findDocumentoById(idDocumento) {
    return prisma.repositorio_lideres.findUnique({
      where: { id_documento: idDocumento },
    });
  }

  async deleteDocumento(idDocumento) {
    return prisma.repositorio_lideres.delete({
      where: { id_documento: idDocumento },
    });
  }
}
