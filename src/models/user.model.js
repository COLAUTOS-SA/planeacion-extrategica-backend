// src/models/user.model.js

import { prisma } from "../config/database.js";

export class UserModel {
  async findByEmail(email) {
    return prisma.usuario.findFirst({
      where: { email },
      include: { rol: true },
    });
  }

  async create(data) {
    return prisma.usuario.create({
      data,
      include: {
        rol: true,
      },
    });
  }

  async findById(id) {
    return prisma.usuario.findUnique({
      where: { id_usuario: id },
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
