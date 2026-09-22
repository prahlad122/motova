import { Router } from "express";

import {
  vendorRegister,
  vendorLogin,
  adminLogin,
} from "../auth/auth.controller";

const router = Router();

/**
 * Vendor
 */
router.post("/vendor/register", vendorRegister);
router.post("/vendor/login", vendorLogin);

/**
 * Admin
 */
router.post("/admin/login", adminLogin);

export default router;