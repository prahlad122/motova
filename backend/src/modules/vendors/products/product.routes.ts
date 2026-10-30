
import { Router } from "express";
import { authenticate } from "../../../middlewares/auth.middleware.js";
import { authorizeVendor } from "../../../middlewares/authorizeVendor.js";
import {
  getVendorProducts,
  postVendorProduct,
} from "./product.controller.js";

const router = Router();

router.use(authenticate, authorizeVendor);

router.get("/", getVendorProducts);
router.post("/", postVendorProduct);

export default router;
