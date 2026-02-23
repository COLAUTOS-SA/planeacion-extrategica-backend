import { Router } from "express";

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

export default router;
