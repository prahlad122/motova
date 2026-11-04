
import { Router } from "express";

import {
  authenticate,
} from "../../middlewares/auth.middleware.js";

import {
  authorizeVendor,
} from "../../middlewares/authorizeVendor.js";

import { getVendorCategories, getVendorDashboard } from "./vendor.controller.js";
import productRoutes from "./products/product.routes.js";
import documentRoutes from "./documents/document.routes.js";

const router = Router();

router.get("/categories", authenticate, authorizeVendor, getVendorCategories);

router.get(
  "/dashboard",
  authenticate,
  authorizeVendor,
  getVendorDashboard
);

// Vendor product routes
router.use("/products", productRoutes);

// Vendor document routes
router.use("/documents", documentRoutes);

export default router;
