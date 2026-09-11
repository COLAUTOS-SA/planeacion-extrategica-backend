import { prisma } from "../config/database.js";

export class EvidenciaModel {
  async create(data) {
    return prisma.evidencia.create({
      data,
    });
  }

  async findById(id) {
    return prisma.evidencia.findUnique({
      where: { id_evidencia: id },
    });
  }

  async delete(id) {
    return prisma.evidencia.delete({
      where: { id_evidencia: id },
    });
  }

  async findByResultado(resultadoId) {
    return prisma.evidencia.findMany({
      where: { id_resultado: resultadoId },
    });
  }

  async findByAprendizaje(aprendizajeId) {
    return prisma.evidencia.findMany({
      where: {
        id_aprendizaje: aprendizajeId,
      },
    });
  }
}
