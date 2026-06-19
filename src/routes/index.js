import { Router } from "express";
import authRoutes from "./auth.routes.js";
import guestRoutes from "./guest.routes.js";
import userRoutes from "./user.routes.js";
import routerCategory from "./category.routes.js";
import routerMenu from "./menu.routes.js";
import routerTable from "./table.routes.js";
import routerOrder from "./order.routes.js";
import routerPayment from "./payment.routes.js";
import routerInvoice from "./invoice.routes.js";
import routerAudit from "./auditLog.routes.js";



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
router.use("/users", userRoutes);   // Profile + Admin
router.use("/categories", routerCategory);
router.use("/menus", routerMenu);
router.use("/tables", routerTable);
router.use("/orders", routerOrder);
router.use("/payments", routerPayment);
router.use("/invoices", routerInvoice);
router.use("/audit-logs", routerAudit);

// 404 handler
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

export default router;