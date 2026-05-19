// src/services/auth.service.js

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import { CteraService } from "./ctera.service.js";
import { prisma } from "../config/database.js";

export class AuthService {
  constructor(userModel) {
    this.userModel = userModel;
  }

  async register(data, file) {
    const existingUser = await this.userModel.findByEmail(data.email);

    if (existingUser) {
      throw { status: 400, message: "User already exists" };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const roles = data.roles?.length
      ? data.roles
      : data.id_rol
        ? [data.id_rol]
        : [];
    const sedes = Array.isArray(data.sedes)
      ? [...new Set(data.sedes.map((id) => Number(id)).filter(Number.isInteger))]
      : [];

    const user = await this.userModel.create({
      ...data,
      password: hashedPassword,
      roles,
      sedes,
      primer_login: true,
    });

    if (file) {
      const relativePath = await CteraService.uploadUserImage(
        user.id_usuario,
        file.buffer,
      );
      await prisma.usuario.update({
        where: { id_usuario: user.id_usuario },
        data: { foto_url: relativePath },
      });
    }

    return this.generateToken(user);
  }

  async login(data) {
    // console.log(data)
    const user = await this.userModel.findByEmail(data.email);

    // console.log("iniciando sesión")
    // console.log(user)

    if (!user) {
      throw new AppError("Credenciales inválidas", 400);
    }

    if (!user.activo) {
      throw new AppError("Usuario inactivo", 403);
    }

    const isMatch = await bcrypt.compare(data.password, user.password);

    if (!isMatch) {
      throw { status: 400, message: "Credenciales inválidas" };
    }

    const token = this.generateToken(user);

    return {
      token,
      primer_login: user.primer_login,
    };
  }

  async changePassword(userId, password) {
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.usuario.update({
      where: { id_usuario: userId },
      data: {
        password: hashedPassword,
        primer_login: false,
      },
    });

    return true;
  }

  generateToken(user) {
    const roles = (user.usuarios_roles || [])
      .map((ur) => ur.rol?.nombre)
      .filter(Boolean);

    // Backwards compatibility: keep `rol` as the primary role
    const primaryRole = roles.length ? roles[0] : user.rol?.nombre;
    const sedes = (user.usuario_sede || [])
      .map((item) => item.id_sede)
      .filter((id) => Number.isInteger(id));

    return jwt.sign(
      {
        id: user.id_usuario,
        nombre: user.nombre,
        email: user.email,
        cargo: user.cargo,
        area: user.area,
        foto: user.foto_url,
        roles,
        rol: primaryRole,
        sedes,
      },
      env.JWT_SECRET,
      { expiresIn: "4h" },
    );
  }
}
