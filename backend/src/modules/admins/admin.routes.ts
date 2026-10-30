
import { Router } from "express";
import {
  getAdminDashboard,
  getPendingApprovals,
  reviewProduct,
} from "./admin.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeAdmin } from "../../middlewares/admin.middleware.js";

const router = Router();

router.use(authenticate, authorizeAdmin);

router.get("/dashboard", getAdminDashboard);
router.get("/approvals", getPendingApprovals);
router.patch("/products/:productId/review", reviewProduct);

export default router;
