import { Router } from "express";
import { getAnalyticsOverviewController, getCustomerAnalyticsController, getInventoryAnalyticsController, getProductAnalyticsController, getSalesAnalyticsController, getVendorAnalyticsController } from "./analytics.controller.js";

const router = Router();
router.get("/overview", getAnalyticsOverviewController);
router.get("/sales", getSalesAnalyticsController);
router.get("/vendors", getVendorAnalyticsController);
router.get("/products", getProductAnalyticsController);
router.get("/customers", getCustomerAnalyticsController);
router.get("/inventory", getInventoryAnalyticsController);
export default router;
