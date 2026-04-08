import { prisma } from "../config/database.js";

export class PlanAnualModel {
  async findNegocios() {
    return prisma.negocio.findMany({
      orderBy: { id_negocio: "asc" },
    });
  }

  async findNegocioById(idNegocio) {
    return prisma.negocio.findUnique({
      where: { id_negocio: idNegocio },
    });
  }

  async createNegocio(nombre) {
    return prisma.negocio.create({
      data: { nombre },
    });
  }

  async updateNegocio(idNegocio, nombre) {
    return prisma.negocio.update({
      where: { id_negocio: idNegocio },
      data: { nombre },
    });
  }

  async deleteNegocio(idNegocio) {
    return prisma.negocio.delete({
      where: { id_negocio: idNegocio },
    });
  }

  async findPlanByAnio(anio) {
    return prisma.plan_anual.findMany({
      where: { anio },
      include: {
        negocio: true,
      },
      orderBy: {
        negocio: { id_negocio: "asc" },
      },
    });
  }

  async upsertPlanItems(anio, items) {
    return prisma.$transaction(
      items.map((item) =>
        prisma.plan_anual.upsert({
          where: {
            anio_id_negocio: {
              anio,
              id_negocio: item.id_negocio,
            },
          },
          update: {
            indicador: item.indicador,
            ejecutado: item.ejecutado,
          },
          create: {
            anio,
            id_negocio: item.id_negocio,
            indicador: item.indicador,
            ejecutado: item.ejecutado,
          },
        }),
      ),
    );
  }
}

