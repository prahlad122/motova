import { Router } from "express";
import { getAdminDashboard } from "./admin.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeAdmin } from "../../middlewares/admin.middleware.js";

const router = Router();

router.get(
  "/dashboard",
  authenticate,
  authorizeAdmin,
  getAdminDashboard
);

export default router;