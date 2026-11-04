import { Router } from "express";
import { validate } from "../../../middlewares/validate.middleware.js";
import { approveAdminProduct, deleteAdminProduct, getAdminPendingProducts, getAdminProductById, getAdminProducts, patchAdminProduct, patchAdminProductStatus, rejectAdminProduct } from "./product.controller.js";
import { productStatusSchema, rejectProductSchema, updateProductSchema } from "./product.validation.js";

const router = Router();
router.get("/pending", getAdminPendingProducts);
router.get("/", getAdminProducts);
router.get("/:productId", getAdminProductById);
router.patch("/:productId/approve", approveAdminProduct);
router.patch("/:productId/reject", validate(rejectProductSchema), rejectAdminProduct);
router.patch("/:productId/status", validate(productStatusSchema), patchAdminProductStatus);
router.patch("/:productId", validate(updateProductSchema), patchAdminProduct);
router.delete("/:productId", deleteAdminProduct);
export default router;
