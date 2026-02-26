import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFound } from "./middlewares/notFound.js";
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
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
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

/**
 * Routes
 */
app.use("/api", routes);

// Health Check

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "API funcionando correctamente",
    });
});


/**
 * Error Handling
 */
app.use(notFound);
app.use(errorHandler);

export default app;
