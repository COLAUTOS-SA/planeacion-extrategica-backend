import { prisma } from "../config/database.js";

export class KpiModel {
  async findAll(where = {}) {
    return prisma.kpi.findMany({
      where,
      orderBy: { created_at: "desc" },
      include: {
        usuario: {
          select: {
            id_usuario: true,
            nombre: true,
            email: true,
          },
        },
        kpi_sede: {
          include: {
            sede: true,
          },
        },
        kpi_indicador: {
          orderBy: { id_indicador: "asc" },
        },
      },
    });
  }

  async findById(idKpi) {
    return prisma.kpi.findUnique({
      where: { id_kpi: idKpi },
      include: {
        usuario: {
          select: {
            id_usuario: true,
            nombre: true,
            email: true,
          },
        },
        kpi_sede: {
          include: {
            sede: true,
          },
        },
        kpi_indicador: {
          include: {
            kpi_valor: {
              include: {
                sede: true,
              },
              orderBy: [{ fecha: "desc" }, { id_valor: "desc" }],
            },
          },
          orderBy: { id_indicador: "asc" },
        },
      },
    });
  }

  async findSedes() {
    return prisma.sede.findMany({
      orderBy: { nombre: "asc" },
    });
  }

  async findUserSedes(idUsuario) {
    return prisma.usuario_sede.findMany({
      where: { id_usuario: idUsuario },
      include: { sede: true },
      orderBy: { id_sede: "asc" },
    });
  }

  async replaceUserSedes(idUsuario, sedes) {
    await prisma.usuario_sede.deleteMany({
      where: { id_usuario: idUsuario },
    });

    if (!sedes.length) return;

    await prisma.usuario_sede.createMany({
      data: sedes.map((idSede) => ({
        id_usuario: idUsuario,
        id_sede: idSede,
      })),
      skipDuplicates: true,
    });
  }

  async create(data) {
    return prisma.kpi.create({ data });
  }

  async update(idKpi, data) {
    return prisma.kpi.update({
      where: { id_kpi: idKpi },
      data,
    });
  }

  async delete(idKpi) {
    return prisma.kpi.delete({
      where: { id_kpi: idKpi },
    });
  }

  async replaceKpiSedes(idKpi, sedes) {
    await prisma.kpi_sede.deleteMany({
      where: { id_kpi: idKpi },
    });

    if (!sedes.length) return;

    await prisma.kpi_sede.createMany({
      data: sedes.map((idSede) => ({
        id_kpi: idKpi,
        id_sede: idSede,
      })),
      skipDuplicates: true,
    });
  }

  async replaceIndicadores(idKpi, indicadores) {
    await prisma.kpi_indicador.deleteMany({
      where: { id_kpi: idKpi },
    });

    if (!indicadores.length) return;

    await prisma.kpi_indicador.createMany({
      data: indicadores.map((nombre) => ({
        id_kpi: idKpi,
        nombre,
      })),
    });
  }

  async findIndicadorById(idIndicador) {
    return prisma.kpi_indicador.findUnique({
      where: { id_indicador: idIndicador },
      include: {
        kpi: {
          include: {
            kpi_sede: true,
          },
        },
      },
    });
  }

  async findValorByUniqueTuple(idIndicador, fecha, idSede) {
    return prisma.kpi_valor.findFirst({
      where: {
        id_indicador: idIndicador,
        fecha,
        id_sede: idSede ?? null,
      },
    });
  }

  async createValor(data) {
    return prisma.kpi_valor.create({ data });
  }

  async updateValor(idValor, data) {
    return prisma.kpi_valor.update({
      where: { id_valor: idValor },
      data,
    });
  }
}
