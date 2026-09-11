import { prisma } from "../config/database.js";

export class ObjetivoEspecificoModel {
  async findAll() {
    return prisma.objetivo_especifico.findMany({
      include: {
        objetivo_general: true,

        objetivo_especifico_responsable: {
          include: {
            usuario: true,
          },
        },

        objetivo_interdependencia: {
          include: {
            usuario: true,
          },
        },

        tarea: true,
      },

      orderBy: {
        id_objetivo_especifico: "desc",
      },
    });
  }

  async findById(id) {
    return prisma.objetivo_especifico.findUnique({
      where: {
        id_objetivo_especifico: id,
      },

      include: {
        objetivo_general: true,

        objetivo_especifico_responsable: {
          include: {
            usuario: true,
          },
        },

        objetivo_interdependencia: {
          include: {
            usuario: true,
          },
        },

        tarea: true,
      },
    });
  }

  async create(data) {
    return prisma.objetivo_especifico.create({
      data,
    });
  }

  async update(id, data) {
    return prisma.objetivo_especifico.update({
      where: {
        id_objetivo_especifico: id,
      },
      data,
    });
  }

  async delete(id) {
    return prisma.objetivo_especifico.delete({
      where: {
        id_objetivo_especifico: id,
      },
    });
  }

  async countTareas(id) {
    return prisma.tarea.count({
      where: {
        id_objetivo_especifico: id,
      },
    });
  }

  async replaceResponsables(idObjetivo, responsables) {
    return prisma.$transaction(async (tx) => {
      await tx.objetivo_especifico_responsable.deleteMany({
        where: {
          id_objetivo_especifico: idObjetivo,
        },
      });

      if (!responsables?.length) {
        return;
      }

      await tx.objetivo_especifico_responsable.createMany({
        data: responsables.map((idUsuario) => ({
          id_objetivo_especifico: idObjetivo,
          id_usuario: idUsuario,
        })),
      });
    });
  }

  async replaceInterdependencias(idObjetivo, usuarios) {
    return prisma.$transaction(async (tx) => {
      await tx.objetivo_interdependencia.deleteMany({
        where: {
          id_objetivo_especifico: idObjetivo,
        },
      });

      if (!usuarios?.length) {
        return;
      }

      await tx.objetivo_interdependencia.createMany({
        data: usuarios.map((idUsuario) => ({
          id_objetivo_especifico: idObjetivo,
          id_usuario: idUsuario,
        })),
      });
    });
  }
}
