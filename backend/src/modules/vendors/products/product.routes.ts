
import { Router } from "express";
import { authenticate } from "../../../middlewares/auth.middleware.js";
import { authorizeVendor } from "../../../middlewares/authorizeVendor.js";
import { requireVerifiedVendor } from "../../../middlewares/requireVerifiedVendor.js";
import {
  deleteVendorProduct,
  getVendorProductById,
  getVendorProductRevisions,
  getVendorProducts,
  patchVendorProduct,
  postVendorProduct,
  postVendorProductImages,
  patchVendorProductStatus,
} from "./product.controller.js";
import { uploadProductImageFiles } from "./product-image.middleware.js";

const router = Router();

router.use(authenticate, authorizeVendor, requireVerifiedVendor);

router.get("/", getVendorProducts);
router.post("/", postVendorProduct);
router.post("/images", uploadProductImageFiles, postVendorProductImages);
router.get("/:productId/revisions", getVendorProductRevisions);
router.patch("/:productId/status", patchVendorProductStatus);
router.get("/:productId", getVendorProductById);
router.patch("/:productId", patchVendorProduct);
router.delete("/:productId", deleteVendorProduct);

export default router;
