import { Router } from "express";
import { getMarketplaceProduct, getMarketplaceProducts } from "./product.controller.js";

const router = Router();
router.get("/", getMarketplaceProducts);
router.get("/:productId", getMarketplaceProduct);
export default router;
