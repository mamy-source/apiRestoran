import { Router } from "express";
import authRoutes from "./auth.routes.js";
import guestRoutes from "./guest.routes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API is running",
  });
});

//API routes
router.use("/auth", authRoutes);
router.use("/guest", guestRoutes);

// 404 handler
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

export default router;