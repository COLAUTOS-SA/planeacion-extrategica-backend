import { prisma } from "../config/database.js";

export class PlaneacionEstrategicaService {
  async recalcularObjetivoEspecifico(idObjetivoEspecifico) {
    const tareas = await prisma.tarea.findMany({
      where: {
        id_objetivo_especifico: idObjetivoEspecifico,
      },

      select: {
        porcentaje_avance: true,
      },
    });

    let avance = 0;

    if (tareas.length > 0) {
      avance =
        tareas.reduce(
          (acc, tarea) => acc + Number(tarea.porcentaje_avance || 0),
          0,
        ) / tareas.length;
    }

    await prisma.objetivo_especifico.update({
      where: {
        id_objetivo_especifico: idObjetivoEspecifico,
      },

      data: {
        porcentaje_avance: Number(avance.toFixed(2)),
      },
    });

    return avance;
  }

  async recalcularObjetivoGeneral(idObjetivoGeneral) {
    const objetivos = await prisma.objetivo_especifico.findMany({
      where: {
        id_objetivo_general: idObjetivoGeneral,
      },

      select: {
        porcentaje_avance: true,
      },
    });

    let avance = 0;

    if (objetivos.length > 0) {
      avance =
        objetivos.reduce(
          (acc, item) => acc + Number(item.porcentaje_avance || 0),
          0,
        ) / objetivos.length;
    }

    await prisma.objetivo_general.update({
      where: {
        id_objetivo_general: idObjetivoGeneral,
      },

      data: {
        porcentaje_avance: Number(avance.toFixed(2)),
      },
    });

    return avance;
  }

  //   async recalcularPerspectiva(
  //   idPerspectiva,
  // ) {
  //   const objetivos =
  //     await prisma.objetivo_general.findMany({
  //       where: {
  //         id_perspectiva:
  //           idPerspectiva,
  //       },

  //       select: {
  //         porcentaje_avance: true,
  //       },
  //     });

  //   let avance = 0;

  //   if (objetivos.length > 0) {
  //     avance =
  //       objetivos.reduce(
  //         (acc, item) =>
  //           acc +
  //           Number(
  //             item.porcentaje_avance || 0,
  //           ),
  //         0,
  //       ) / objetivos.length;
  //   }

  //   await prisma.perspectiva.update({
  //     where: {
  //       id_perspectiva:
  //         idPerspectiva,
  //     },

  //     data: {
  //       porcentaje_avance:
  //         Number(
  //           avance.toFixed(2),
  //         ),
  //     },
  //   });

  //   return avance;
  // }

  async recalcularCadena(idObjetivoEspecifico) {
    const objetivo = await prisma.objetivo_especifico.findUnique({
      where: {
        id_objetivo_especifico: idObjetivoEspecifico,
      },
    });

    if (!objetivo) {
      return;
    }

    await this.recalcularObjetivoEspecifico(idObjetivoEspecifico);

    await this.recalcularObjetivoGeneral(objetivo.id_objetivo_general);
  }
}
