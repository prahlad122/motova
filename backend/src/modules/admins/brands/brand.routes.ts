import { Router } from "express";
import { getAdminBrands, postAdminBrand } from "./brand.controller.js";

const router = Router();

router.get("/", getAdminBrands);
router.post("/", postAdminBrand);

export default router;
