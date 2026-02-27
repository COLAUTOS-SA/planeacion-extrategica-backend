import { prisma } from "../config/database.js";
import { AppError } from "../utils/AppError.js";

export class ReporteService {
  async getLideres(user) {
    if (user.rol !== "admin") {
      throw new AppError("No autorizado", 403);
    }

    return prisma.usuario.findMany({
      where: {
        rol: {
          nombre: "lider",
        },
      },
      select: {
        id_usuario: true,
        nombre: true,
        email: true,
        cargo: true,
      },
    });
  }

  async getFavoritosByLider(user, liderId) {
    if (user.rol !== "admin") {
      throw new AppError("No autorizado", 403);
    }

    const resultados = await prisma.resultado_clave.findMany({
      where: {
        id_responsable: liderId,
        favorito: true,
      },
    });

    const prioridades = await prisma.prioridad.findMany({
      where: {
        id_responsable: liderId,
        favorito: true,
      },
    });

    const aprendizajes = await prisma.aprendizaje.findMany({
      where: {
        id_responsable: liderId,
        favorito: true,
      },
    });

    return {
      resultados,
      prioridades,
      aprendizajes,
    };
  }
}
