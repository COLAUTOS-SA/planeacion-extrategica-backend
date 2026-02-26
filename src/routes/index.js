import { Router } from "express";
import authRoutes from "./auth.routes.js";
import resultadoRoutes from "./resultado_clave.routes.js";

const router = Router();

/**
 * Health Check
 */
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API running correctly",
  });
});

router.use("/auth", authRoutes);

router.use("/resultados", resultadoRoutes);


export default router;
