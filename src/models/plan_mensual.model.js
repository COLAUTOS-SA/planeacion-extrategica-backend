import { prisma } from "../config/database.js";

export class PlanMensualModel {
  async findNegocioById(idNegocio) {
    return prisma.negocio.findUnique({
      where: { id_negocio: idNegocio },
    });
  }

  async findByAnioNegocio(anio, idNegocio) {
    return prisma.plan_mensual.findMany({
      where: {
        anio,
        id_negocio: idNegocio,
      },
      orderBy: {
        mes: "asc",
      },
    });
  }

  async findById(idPlanMensual) {
    return prisma.plan_mensual.findUnique({
      where: { id_plan_mensual: idPlanMensual },
    });
  }

  async create(data) {
    return prisma.plan_mensual.create({
      data,
    });
  }

  async update(idPlanMensual, data) {
    return prisma.plan_mensual.update({
      where: { id_plan_mensual: idPlanMensual },
      data,
    });
  }

  async remove(idPlanMensual) {
    return prisma.plan_mensual.delete({
      where: { id_plan_mensual: idPlanMensual },
    });
  }
}
