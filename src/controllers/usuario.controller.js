// src/controllers/usuario.controller.js

import { UsuarioService } from "../services/usuario.service.js";

const service = new UsuarioService();

export class UsuarioController {
  async updateNombre(req, res) {
    try {
      const userId = parseInt(req.params.id);
      const { nombre } = req.body;

      const user = await service.updateNombre(userId, nombre);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async updatePassword(req, res) {
    try {
      const userId = parseInt(req.params.id);
      const { password } = req.body;

      await service.updatePassword(userId, password);

      res.json({
        success: true,
        message: "Contraseña actualizada",
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async uploadAvatar(req, res) {
    try {
      const userId = parseInt(req.params.id);
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          message: "Archivo requerido",
        });
      }

      await service.uploadAvatar(userId, file);

      res.json({
        success: true,
        message: "Avatar actualizado",
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getAvatar(req, res) {
    try {
      const userId = parseInt(req.params.id);

      const buffer = await service.getAvatar(userId);

      res.setHeader("Content-Type", "image/webp");

      res.send(buffer);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async getMe(req, res) {
    try {
      const userId = req.user.id;

      const user = await service.getUserById(userId);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getUsuarios(req, res) {
    try {
      const users = await service.getAllUsers();

      res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateUser(req, res) {
    try {
      const userId = parseInt(req.params.id);

      const updatedUser = await service.updateUser(userId, req.body);

      res.json({
        success: true,
        data: updatedUser,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateRoles(req, res) {
    try {
      const userId = parseInt(req.params.id);
      const { roles } = req.body;

      if (!Array.isArray(roles) || roles.length === 0) {
        return res.status(400).json({ message: "Se requiere al menos un rol" });
      }

      const updatedUser = await service.updateRoles(userId, roles);

      res.json({
        success: true,
        data: updatedUser,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}
