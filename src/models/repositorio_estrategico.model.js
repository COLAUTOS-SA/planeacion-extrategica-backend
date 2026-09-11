import { prisma } from "../config/database.js";

export class RepositorioEstrategicoModel {
  async findEventoByFecha(fecha) {
    const start = new Date(fecha);
    const end = new Date(fecha);
    end.setUTCHours(23, 59, 59, 999);

    return prisma.calendario_estrategico.findFirst({
      where: {
        fecha: {
          gte: start,
          lte: end,
        },
        id_objetivo_general: null,
      },
      include: {
        usuario: true,
      },
    });
  }

  async findEventosByRango(desde, hasta) {
    return prisma.calendario_estrategico.findMany({
      where: {
        fecha: {
          gte: desde,
          lte: hasta,
        },
        id_objetivo_general: null,
      },
      include: {
        usuario: true,
      },
      orderBy: {
        fecha: "asc",
      },
    });
  }

  async findDocumentosByFecha(fecha) {
    const start = new Date(fecha);
    const end = new Date(fecha);
    end.setUTCHours(23, 59, 59, 999);

    return prisma.repositorio_estrategico.findMany({
      where: {
        fecha: {
          gte: start,
          lte: end,
        },
        id_objetivo_general: null,
      },
      include: {
        usuario: true,
      },
      orderBy: {
        id_documento: "desc",
      },
    });
  }

  async createEvento(data) {
    return prisma.calendario_estrategico.create({
      data,
      include: {
        usuario: true,
      },
    });
  }

  async updateEvento(idEvento, data) {
    return prisma.calendario_estrategico.update({
      where: { id_evento: idEvento },
      data,
      include: {
        usuario: true,
      },
    });
  }

  async createDocumento(data) {
    return prisma.repositorio_estrategico.create({
      data,
      include: {
        usuario: true,
      },
    });
  }

  async findDocumentoById(idDocumento) {
    return prisma.repositorio_estrategico.findUnique({
      where: { id_documento: idDocumento },
      include: {
        usuario: true,
      },
    });
  }

  async deleteDocumento(idDocumento) {
    return prisma.repositorio_estrategico.delete({
      where: { id_documento: idDocumento },
    });
  }
}
