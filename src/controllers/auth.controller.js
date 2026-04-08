// src/controllers/auth.controller.js

import { z } from "zod";

const registerSchema = z
  .object({
    nombre: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
    cargo: z.string(),
    area: z.string(),
    foto_url: z.string().optional(),
    id_rol: z.number().optional(),
    roles: z.array(z.number()).min(1).optional(),
    sedes: z.array(z.number()).optional().default([]),
  })
  .refine((data) => data.roles?.length || data.id_rol, {
    message: "Se requiere al menos un rol",
    path: ["roles"],
  });

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  register = async (req, res, next) => {
    try {
      const data = registerSchema.parse(req.body);
      const token = await this.authService.register(data, req.file);

      res.status(201).json({ success: true, token });
    } catch (error) {
      next(error);
    }
  };

  login = async (req, res, next) => {
    try {
      const data = loginSchema.parse(req.body);
      const token = await this.authService.login(data);

      console.log(token);

      res.status(200).json({ success: true, token });
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req, res, next) => {
    try {
      const { password } = req.body;

      const result = await this.authService.changePassword(
        req.user.id,
        password,
      );

      res
        .status(200)
        .json({ success: true, message: "Contraseña actualizada" });
    } catch (error) {
      next(error);
    }
  };
}
