import { prisma } from "../config/database.js";

export class TareaModel {
  async findAll() {
    return prisma.tarea.findMany({
      include: {
        estado: true,

        usuario: true,

        objetivo_especifico: {
          include: {
            objetivo_general: true,
          },
        },

        tarea_responsable: {
          include: {
            usuario: true,
          },
        },
      },

      orderBy: {
        id_tarea: "desc",
      },
    });
  }

  async findById(id) {
    return prisma.tarea.findUnique({
      where: {
        id_tarea: id,
      },

      include: {
        estado: true,

        usuario: true,

        objetivo_especifico: {
          include: {
            objetivo_general: true,
          },
        },

        tarea_responsable: {
          include: {
            usuario: true,
          },
        },
      },
    });
  }

  async create(data) {
    return prisma.tarea.create({
      data,
    });
  }

  async update(id, data) {
    return prisma.tarea.update({
      where: {
        id_tarea: id,
      },
      data,
    });
  }

  async delete(id) {
    return prisma.tarea.delete({
      where: {
        id_tarea: id,
      },
    });
  }

  async replaceResponsables(
    idTarea,
    responsables,
  ) {
    return prisma.$transaction(async (tx) => {
      await tx.tarea_responsable.deleteMany({
        where: {
          id_tarea: idTarea,
        },
      });

      if (!responsables?.length) {
        return;
      }

      await tx.tarea_responsable.createMany({
        data: responsables.map((idUsuario) => ({
          id_tarea: idTarea,
          id_usuario: idUsuario,
        })),
      });
    });
  }
}