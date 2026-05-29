import { prisma } from "../config/database.js";

export class PlanMensualSedeModel {
  async findByPlanMensual(idPlanMensual) {
    return prisma.plan_mensual_sede.findMany({
      where: {
        id_plan_mensual: idPlanMensual,
      },
      include: {
        sede: true,
      },
      orderBy: {
        sede: {
          nombre: "asc",
        },
      },
    });
  }

  async findById(id) {
    return prisma.plan_mensual_sede.findUnique({
      where: {
        id_plan_mensual_sede: id,
      },
      include: {
        sede: true,
      },
    });
  }

  async findByPlanAndSede(idPlanMensual, idSede) {
    return prisma.plan_mensual_sede.findFirst({
      where: {
        id_plan_mensual: idPlanMensual,
        id_sede: idSede,
      },
    });
  }

  async create(data) {
    return prisma.plan_mensual_sede.create({
      data,
    });
  }

  async update(id, data) {
    return prisma.plan_mensual_sede.update({
      where: {
        id_plan_mensual_sede: id,
      },
      data,
    });
  }

  async delete(id) {
    return prisma.plan_mensual_sede.delete({
      where: {
        id_plan_mensual_sede: id,
      },
    });
  }

  async sumByPlanMensual(idPlanMensual) {
    return prisma.plan_mensual_sede.aggregate({
      where: {
        id_plan_mensual: idPlanMensual,
      },
      _sum: {
        indicador: true,
        ejecutado: true,
      },
    });
  }
}