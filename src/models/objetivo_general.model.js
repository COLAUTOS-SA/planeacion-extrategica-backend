import { prisma } from "../config/database.js";

export class ObjetivoGeneralModel {
  async findAll() {
    return prisma.objetivo_general.findMany({
      include: {
        perspectiva: true,
        objetivo_general_responsable: {
          include: {
            usuario: true,
          },
        },
      },
      orderBy: {
        id_objetivo_general: "desc",
      },
    });
  }

  async findById(id) {
    return prisma.objetivo_general.findUnique({
      where: {
        id_objetivo_general: id,
      },
      include: {
        perspectiva: true,
        objetivo_general_responsable: {
          include: {
            usuario: true,
          },
        },
        objetivos_especificos: true,
      },
    });
  }

  async create(data) {
    return prisma.objetivo_general.create({
      data,
    });
  }

  async update(id, data) {
    return prisma.objetivo_general.update({
      where: {
        id_objetivo_general: id,
      },
      data,
    });
  }

  async delete(id) {
    return prisma.objetivo_general.delete({
      where: {
        id_objetivo_general: id,
      },
    });
  }

  async exists(id) {
    const item = await this.findById(id);
    return !!item;
  }

  async countObjetivosEspecificos(id) {
    return prisma.objetivo_especifico.count({
      where: {
        id_objetivo_general: id,
      },
    });
  }

  async replaceResponsables(
    idObjetivoGeneral,
    responsables,
  ) {
    return prisma.$transaction(async (tx) => {
      await tx.objetivo_general_responsable.deleteMany({
        where: {
          id_objetivo_general: idObjetivoGeneral,
        },
      });

      if (!responsables?.length) {
        return;
      }

      await tx.objetivo_general_responsable.createMany({
        data: responsables.map((idUsuario) => ({
          id_objetivo_general: idObjetivoGeneral,
          id_usuario: idUsuario,
        })),
      });
    });
  }
}