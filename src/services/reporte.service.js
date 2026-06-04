import { prisma } from "../config/database.js";
import { AppError } from "../utils/AppError.js";

export class ReporteService {
  async getLideres(user) {
    const userRoles = user.roles ?? (user.rol ? [user.rol] : []);

    if (!userRoles.includes("admin")) {
      throw new AppError("No autorizado", 403);
    }

    return prisma.usuario.findMany({
      where: {
        activo: true,
        usuarios_roles: {
          some: {
            rol: {
              nombre: "lider",
            },
          },
        },
      },
      select: {
        id_usuario: true,
        nombre: true,
        email: true,
        cargo: true,
        area: true,
        foto_url: true,
      },
    });
  }

async getFavoritosByLider(user, liderId) {
  const userRoles = user.roles ?? (user.rol ? [user.rol] : []);

  if (!userRoles.includes("admin")) {
    throw new AppError("No autorizado", 403);
  }

  const resultados = await prisma.resultado_clave.findMany({
    where: {
      id_responsable: liderId,
      favorito: true,
    },
    include: {
      estado: true,
      evidencias: true,
    },
  });

  const prioridades = await prisma.prioridad.findMany({
    where: {
      id_responsable: liderId,
      favorito: true,
    },
    include: {
      estado: true,
      evidencias: true,
    },
  });

  const aprendizajes = await prisma.aprendizaje.findMany({
    where: {
      id_responsable: liderId,
      favorito: true,
    },
    include: {
      estado: true,
      evidencias: true,
    },
  });

  return {
    resultados,
    prioridades,
    aprendizajes,
  };
}
}
