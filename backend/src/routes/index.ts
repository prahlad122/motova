import { Router } from "express";
import healthRoutes from "./health.routes.js";
import authRoutes from "../modules/auth/auth.routes.js";
import adminRoutes from "../modules/admins/admin.routes.js";
import vendorRoutes from "../modules/vendors/vendor.routes.js";
import marketplaceProductRoutes from "../modules/catalog/products/product.routes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/vendor", vendorRoutes);
router.use("/products", marketplaceProductRoutes);

export default router;
