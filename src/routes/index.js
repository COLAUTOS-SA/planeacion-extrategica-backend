import { Router } from "express";
import authRoutes from "./auth.routes.js";
import resultadoRoutes from "./resultado_clave.routes.js";
import aprendizajeRoutes from "./aprendizaje.routes.js";
import prioridadRoutes from "./prioridad.route.js";
import reporteRoutes from "./reporte.routes.js";
import usuarioRoutes from "./usuario.routes.js";
import repositorioLideresRoutes from "./repositorio_lideres.routes.js";
import repositorioEstrategicoRoutes from "./repositorio_estrategico.routes.js";
import planAnualRoutes from "./plan_anual.routes.js";
import planMensualRoutes from "./plan_mensual.routes.js";
import kpiRoutes from "./kpi.routes.js";
import sedeRoutes from "./sede.routes.js";
import planMensualSedeRoutes from "./plan_mensual_sede.routes.js";
import perspectivaRoutes from "./perspectiva.routes.js";
import objetivoGeneralRoutes from "./objetivo_general.routes.js";
import objetivoEspecificoRoutes from "./objetivo_especifico.routes.js";
import tareaRoutes from "./tarea.routes.js";

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
router.use("/repositorio-estrategico", repositorioEstrategicoRoutes);
router.use("/plan-anual", planAnualRoutes);
router.use("/plan-mensual", planMensualRoutes);
router.use("/kpis", kpiRoutes);
router.use("/sedes", sedeRoutes);
router.use("/plan-mensual-sede", planMensualSedeRoutes);
router.use(
  "/perspectivas",
  perspectivaRoutes,
);
router.use(
  "/objetivos-generales",
  objetivoGeneralRoutes,
);

router.use(
  "/objetivos-especificos",
  objetivoEspecificoRoutes,
);  
router.use(
  "/tareas",
  tareaRoutes,
);

export default router;
