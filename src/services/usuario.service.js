// src/services/usuario.service.js

import bcrypt from "bcryptjs";
import { prisma } from "../config/database.js";
import { CteraService } from "./ctera.service.js";
import { UserModel } from "../models/user.model.js";

export class UsuarioService {
  constructor() {
    this.userModel = new UserModel();
  }

  async updateNombre(userId, nombre) {
    return await this.userModel.updateNombre(userId, nombre);
  }

  async updatePassword(userId, password) {
    const hashedPassword = await bcrypt.hash(password, 10);

    return await this.userModel.updatePassword(userId, hashedPassword);
  }

  async uploadAvatar(userId, file) {
    const relativePath = await CteraService.uploadUserImage(
      userId,
      file.buffer,
    );

    await prisma.usuario.update({
      where: { id_usuario: userId },
      data: { foto_url: relativePath },
    });

    return relativePath;
  }

  async getAvatar(userId) {
    const user = await prisma.usuario.findUnique({
      where: { id_usuario: userId },
    });

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    const relativePath = `Ejepro/Usuarios/${userId}/avatar.webp`;

    return await CteraService.readFile(relativePath);
  }

  async getUserById(userId) {
    const user = await prisma.usuario.findUnique({
      where: { id_usuario: userId },
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

    const roles = (user.usuarios_roles || [])
      .map((ur) => ur.rol?.nombre)
      .filter(Boolean);

    // Backwards compatibility: ensure at least the primary role is returned
    if (roles.length === 0 && user.rol) {
      roles.push(user.rol.nombre);
    }

    return {
      id: user.id_usuario,
      nombre: user.nombre,
      email: user.email,
      cargo: user.cargo,
      area: user.area,
      roles,
      sedes: (user.usuario_sede || []).map((rel) => ({
        id: rel.id_sede,
        nombre: rel.sede?.nombre,
      })),
    };
  }

  async getAllUsers() {
    const users = await prisma.usuario.findMany({
      include: {
        usuario_sede: {
          include: {
            sede: true,
          },
        },
        usuarios_roles: {
          include: {
            rol: true,
          },
        },
      },
    });

    return users.map((user) => {
      const roles = (user.usuarios_roles || []).map((ur) => ({
        id: ur.id_rol,
        nombre: ur.rol?.nombre,
      }));

      return {
        id: user.id_usuario,
        nombre: user.nombre,
        email: user.email,
        cargo: user.cargo,
        area: user.area,
        roles, // ahora es array de objetos
        sedes: (user.usuario_sede || []).map((rel) => ({
          id: rel.id_sede,
          nombre: rel.sede?.nombre,
        })),
      };
    });
  }

  async updateUser(userId, data) {
    const { nombre, email, cargo, area, password, roles, sedes } = data;

    return await prisma.$transaction(async (tx) => {
      // 1. Actualizar datos básicos
      if (nombre || email || cargo || area) {
        await tx.usuario.update({
          where: { id_usuario: userId },
          data: {
            ...(nombre && { nombre }),
            ...(email && { email }),
            ...(cargo && { cargo }),
            ...(area && { area }),
          },
        });
      }

      // 2. Actualizar contraseña (opcional)
      if (password) {
        const hashed = await bcrypt.hash(password, 10);

        await tx.usuario.update({
          where: { id_usuario: userId },
          data: { password: hashed },
        });
      }

      // 3. Actualizar roles (opcional)
      if (Array.isArray(roles)) {
        // limpiar roles actuales
        await tx.usuarios_roles.deleteMany({
          where: { id_usuario: userId },
        });

        // asignar nuevos
        if (roles.length) {
          await tx.usuarios_roles.createMany({
            data: roles.map((idRol) => ({
              id_usuario: userId,
              id_rol: idRol,
            })),
            skipDuplicates: true,
          });

          // actualizar rol principal (compatibilidad)
          await tx.usuario.update({
            where: { id_usuario: userId },
            data: { id_rol: roles[0] },
          });
        }
      }

      if (Array.isArray(sedes)) {
        const parsedSedes = [
          ...new Set(sedes.map((idSede) => Number(idSede)).filter(Number.isInteger)),
        ];

        await tx.usuario_sede.deleteMany({
          where: { id_usuario: userId },
        });

        if (parsedSedes.length) {
          await tx.usuario_sede.createMany({
            data: parsedSedes.map((idSede) => ({
              id_usuario: userId,
              id_sede: idSede,
            })),
            skipDuplicates: true,
          });
        }
      }

      // 4. Retornar usuario actualizado
      return this.getUserById(userId);
    });
  }

  async updateRoles(userId, roles) {
    if (!Array.isArray(roles) || roles.length === 0) {
      throw new Error("Se requiere al menos un rol");
    }

    // Update the primary role and the join table
    await prisma.$transaction([
      prisma.usuarios_roles.deleteMany({ where: { id_usuario: userId } }),
      prisma.usuario.update({
        where: { id_usuario: userId },
        data: { id_rol: roles[0] },
      }),
      prisma.usuarios_roles.createMany({
        data: roles.map((idRol) => ({ id_usuario: userId, id_rol: idRol })),
        skipDuplicates: true,
      }),
    ]);

    return this.getUserById(userId);
  }
}
