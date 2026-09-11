import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFound } from "./middlewares/notFound.js";
import evidenciaRoutes from "./routes/evidencia.routes.js";
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
});

const app = express();

app.use(limiter);
/**
 * Global Middlewares
 */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(
  cors({
    origin: ["http://localhost:5173", "https://ejepro.colautos.co"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(morgan("dev"));

/**
 * Routes
 */
app.use("/api", routes);
app.use("/api", evidenciaRoutes);

// Health Check

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "API funcionando correctamente",
    });
});

app.get("/", (req, res) =>{

  res.status(200).json({
      succes:true,
      message: "HOLA",
      });
});


/**
 * Error Handling
 */
app.use(notFound);
app.use(errorHandler);

export default app;
