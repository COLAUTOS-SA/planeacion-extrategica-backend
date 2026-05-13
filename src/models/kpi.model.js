import { prisma } from "../config/database.js";

export class KpiModel {
  async purgeIndicadoresByKpi(idKpi, tx = prisma) {
    const indicadores = await tx.kpi_indicador.findMany({
      where: { id_kpi: idKpi },
      select: { id_indicador: true },
    });

    const indicadorIds = indicadores.map((item) => item.id_indicador);
    if (!indicadorIds.length) return;

    await tx.kpi_valor_campo.deleteMany({
      where: {
        kpi_valor: {
          id_indicador: { in: indicadorIds },
        },
      },
    });

    await tx.kpi_valor.deleteMany({
      where: {
        id_indicador: { in: indicadorIds },
      },
    });

    await tx.kpi_indicador_campo.deleteMany({
      where: {
        id_indicador: { in: indicadorIds },
      },
    });

    await tx.kpi_indicador.deleteMany({
      where: {
        id_indicador: { in: indicadorIds },
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
      data: sedes.map((idSede) => ({ id_usuario: idUsuario, id_sede: idSede })),
      skipDuplicates: true,
    });
  }

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
          include: { sede: true },
        },
        kpi_indicador: {
          include: {
            kpi_indicador_campo: {
              orderBy: { orden: "asc" },
            },
          },
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
          include: { sede: true },
        },
        kpi_indicador: {
          include: {
            kpi_indicador_campo: {
              orderBy: { orden: "asc" },
            },
            kpi_valor: {
              where: {
                deleted_at: null,
              },
              include: {
                sede: true,
                kpi_valor_campo: {
                  include: {
                    campo: true,
                  },
                },
              },
              orderBy: [{ fecha: "desc" }, { id_valor: "desc" }],
            },
          },
          orderBy: { id_indicador: "asc" },
        },
      },
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
        kpi_indicador_campo: true,
      },
    });
  }

  async findValorById(idValor) {
    return prisma.kpi_valor.findUnique({
      where: { id_valor: idValor },
      include: {
        kpi_indicador: {
          include: {
            kpi_indicador_campo: {
              orderBy: { orden: "asc" },
            },
            kpi: true,
          },
        },
        kpi_valor_campo: true,
      },
    });
  }

  async findValorByUniqueTuple(idIndicador, fecha, idSede) {
    return prisma.kpi_valor.findFirst({
      where: {
        id_indicador: idIndicador,
        fecha,
        id_sede: idSede ?? null,
        deleted_at: null,
      },
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
    return prisma.$transaction(async (tx) => {
      await this.purgeIndicadoresByKpi(idKpi, tx);

      await tx.kpi_sede.deleteMany({
        where: { id_kpi: idKpi },
      });

      return tx.kpi.delete({
        where: { id_kpi: idKpi },
      });
    });
  }

  async replaceKpiSedes(idKpi, sedes) {
    await prisma.kpi_sede.deleteMany({
      where: { id_kpi: idKpi },
    });

    if (!sedes.length) return;

    await prisma.kpi_sede.createMany({
      data: sedes.map((idSede) => ({ id_kpi: idKpi, id_sede: idSede })),
      skipDuplicates: true,
    });
  }

  async replaceIndicadoresWithCampos(idKpi, indicadores) {
    await prisma.$transaction(async (tx) => {
      await this.purgeIndicadoresByKpi(idKpi, tx);

      for (const indicador of indicadores) {
        const created = await tx.kpi_indicador.create({
          data: {
            id_kpi: idKpi,
            nombre: indicador.nombre,
          },
        });

        if (indicador.campos?.length) {
          await tx.kpi_indicador_campo.createMany({
            data: indicador.campos.map((campo, index) => ({
              id_indicador: created.id_indicador,
              nombre: campo.nombre,
              tipo: campo.tipo || "numero",
              orden: campo.orden || index + 1,
              requerido: Boolean(campo.requerido),
              editable: campo.editable !== false,
              es_calculado: Boolean(campo.es_calculado),
              formula: campo.formula || null,
            })),
          });
        }
      }
    });
  }

  async createValor(data, campos = []) {
    return prisma.$transaction(async (tx) => {
      const created = await tx.kpi_valor.create({ data });

      if (campos.length) {
        await tx.kpi_valor_campo.createMany({
          data: campos.map((campo) => ({
            id_valor: created.id_valor,
            id_campo: campo.id_campo,
            valor_decimal: campo.valor_decimal ?? null,
            valor_texto: campo.valor_texto ?? null,
          })),
        });
      }

      return created;
    });
  }

  async updateValor(idValor, data, campos = []) {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.kpi_valor.update({
        where: { id_valor: idValor },
        data,
      });

      if (campos.length) {
        for (const campo of campos) {
          await tx.kpi_valor_campo.upsert({
            where: {
              id_valor_id_campo: {
                id_valor: idValor,
                id_campo: campo.id_campo,
              },
            },
            update: {
              valor_decimal: campo.valor_decimal ?? null,
              valor_texto: campo.valor_texto ?? null,
            },
            create: {
              id_valor: idValor,
              id_campo: campo.id_campo,
              valor_decimal: campo.valor_decimal ?? null,
              valor_texto: campo.valor_texto ?? null,
            },
          });
        }
      }

      return updated;
    });
  }

  async softDeleteValor(idValor, userId) {
    return prisma.kpi_valor.update({
      where: { id_valor: idValor },
      data: {
        deleted_at: new Date(),
        deleted_by: userId,
      },
    });
  }
}
