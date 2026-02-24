// src/routes/auth.routes.js

import { Router } from "express";
import { UserModel } from "../models/user.model.js";
import { AuthService } from "../services/auth.service.js";
import { AuthController } from "../controllers/auth.controller.js";

const router = Router();

const userModel = new UserModel();
const authService = new AuthService(userModel);
const authController = new AuthController(authService);

router.post("/register", authController.register);
router.post("/login", authController.login);

export default router;
