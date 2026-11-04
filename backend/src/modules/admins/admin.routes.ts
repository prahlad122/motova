import { Router } from "express";

import {
  getAdminDashboard,
  getPendingApprovals,
  reviewProduct,
  createVendor,
  getVendors,
  getVendorById,
  updateVendorStatus,
} from "./admin.controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeAdmin } from "../../middlewares/admin.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";

import { createVendorSchema , updateVendorStatusSchema, } from "./admin.validation.js";
import adminDocumentRoutes from "./documents/document.routes.js";
import adminCategoryRoutes from "./categories/category.routes.js";
import adminProductRoutes from "./products/product.routes.js";
import adminBrandRoutes from "./brands/brand.routes.js";
import adminAnalyticsRoutes from "./analytics/analytics.routes.js";

const router = Router();

router.use(authenticate, authorizeAdmin);

router.get("/dashboard", getAdminDashboard);
router.get("/approvals", getPendingApprovals);
router.patch("/products/:productId/review", reviewProduct);
router.use("/documents", adminDocumentRoutes);
router.use("/categories", adminCategoryRoutes);
router.use("/products", adminProductRoutes);
router.use("/brands", adminBrandRoutes);
router.use("/analytics", adminAnalyticsRoutes);




//get all the vendors
router.get("/vendors", getVendors);

//get vendor by id
router.get("/vendors/:vendorId", getVendorById);

router.patch(
  "/vendors/:vendorId/status",
  validate(updateVendorStatusSchema),
  updateVendorStatus,
);

router.post( "/vendors", validate(createVendorSchema), createVendor,);


export default router;
