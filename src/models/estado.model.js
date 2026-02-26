import { prisma } from "../config/database.js";

export class EstadoModel {
  async exists(id) {
    const estado = await prisma.estado.findUnique({
      where: { id_estado: id },
    });

    return !!estado;
  }
}
