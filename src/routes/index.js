import { Router } from "express";
import authRoutes from "./auth.routes.js";
import resultadoRoutes from "./resultado_clave.routes.js";
import aprendizajeRoutes from "./aprendizaje.routes.js";
import prioridadRoutes from "./prioridad.route.js";
import reporteRoutes from "./reporte.routes.js";
import usuarioRoutes from "./usuario.routes.js";
import repositorioLideresRoutes from "./repositorio_lideres.routes.js";
import planAnualRoutes from "./plan_anual.routes.js";
import kpiRoutes from "./kpi.routes.js";

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

router.use("/aprendizajes", aprendizajeRoutes);

router.use("/informes", reporteRoutes);

router.use("/prioridades", prioridadRoutes);

router.use("/usuarios", usuarioRoutes);
router.use("/repositorio-lideres", repositorioLideresRoutes);
router.use("/plan-anual", planAnualRoutes);
router.use("/kpis", kpiRoutes);

export default router;
