// src/models/user.model.js

import { prisma } from "../config/database.js";

export class UserModel {
  async findByEmail(email) {
    return prisma.usuario.findFirst({
      where: { email },
      include: {
        rol: true,
        usuario_sede: {
          include: {
            sede: true,
          },
        },
        usuarios_roles: {
          include: { rol: true },
        },
      },
    });
  }

  async create(data) {
    const { roles, sedes, ...rest } = data;

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.usuario.create({
        data: {
          ...rest,
          id_rol: roles && roles.length ? roles[0] : rest.id_rol,
        },
        include: {
          rol: true,
        },
      });

      if (roles && roles.length) {
        await tx.usuarios_roles.createMany({
          data: roles.map((idRol) => ({
            id_usuario: created.id_usuario,
            id_rol: idRol,
          })),
          skipDuplicates: true,
        });
      }

      if (Array.isArray(sedes) && sedes.length) {
        await tx.usuario_sede.createMany({
          data: sedes.map((idSede) => ({
            id_usuario: created.id_usuario,
            id_sede: idSede,
          })),
          skipDuplicates: true,
        });
      }

      return tx.usuario.findUnique({
        where: { id_usuario: created.id_usuario },
        include: {
          rol: true,
          usuario_sede: {
            include: {
              sede: true,
            },
          },
          usuarios_roles: {
            include: { rol: true },
          },
        },
      });
    });

    return user;
  }

  async findById(id) {
    return prisma.usuario.findUnique({
      where: { id_usuario: id },
      include: {
        rol: true,
        usuario_sede: {
          include: {
            sede: true,
          },
        },
        usuarios_roles: {
          include: { rol: true },
        },
      },
    });
  }

  async updateNombre(id, nombre) {
    return prisma.usuario.update({
      where: { id_usuario: id },
      data: { nombre },
    });
  }

  async updatePassword(id, password) {
    return prisma.usuario.update({
      where: { id_usuario: id },
      data: { password },
    });
  }

  async findAllByUser(userId, page, limit) {
    return prisma.resultado_clave.findMany({
      where: { id_responsable: userId },
      skip: (page - 1) * limit,
      take: limit,
    });
  }
}
