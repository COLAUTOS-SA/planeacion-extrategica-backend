// src/services/auth.service.js

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export class AuthService {
  constructor(userModel) {
    this.userModel = userModel;
  }

  async register(data) {
    const existingUser = await this.userModel.findByEmail(data.email);

    if (existingUser) {
      throw { status: 400, message: "User already exists" };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.userModel.create({
      ...data,
      password: hashedPassword,
      id_rol: data.id_rol,
    });

    return this.generateToken(user);
  }

  async login(data) {
    const user = await this.userModel.findByEmail(data.email);

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

    return this.generateToken(user);
  }

  generateToken(user) {
    return jwt.sign(
      {
        id: user.id_usuario,
        email: user.email,
        rol: user.rol.nombre,
      },
      env.JWT_SECRET,
      { expiresIn: "1d" },
    );
  }
}
