// src/controllers/auth.controller.js

import { z } from "zod";

const registerSchema = z.object({
  nombre: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  id_rol: z.number(),
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
      const token = await this.authService.register(data);

      res.status(201).json({ success: true, token });
    } catch (error) {
      next(error);
    }
  };

  login = async (req, res, next) => {
    try {
      const data = loginSchema.parse(req.body);
      const token = await this.authService.login(data);

      res.status(200).json({ success: true, token });
    } catch (error) {
      next(error);
    }
  };
}
