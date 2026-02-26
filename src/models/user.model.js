// src/models/user.model.js

import { prisma } from "../config/database.js";

export class UserModel {
  async findByEmail(email) {
    return prisma.usuario.findFirst({
      where: { email },
    });
  }

  async create(data) {
    return prisma.usuario.create({
      data,
    });
  }

  async findById(id) {
    return prisma.usuario.findUnique({
      where: { id_usuario: id },
    });
  }
}
