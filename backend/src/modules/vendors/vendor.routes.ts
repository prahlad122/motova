
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeVendor } from "../../middlewares/authorizeVendor.js";
import { getVendorDashboard } from "./vendor.controller.js";
import productRoutes from "./products/product.routes.js";

const router = Router();

router.get(
  "/dashboard",
  authenticate,
  authorizeVendor,
  getVendorDashboard,
);

router.use("/products", productRoutes);

export default router;
