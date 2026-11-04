import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeVendor } from "../../middlewares/authorizeVendor.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { changePasswordSchema } from "./password.validation.js";
import { changeVendorPasswordController } from "./auth.controller.js";
import { vendorRegister, vendorLogin, adminLogin, } from "../auth/auth.controller";

const router = Router();

/*Vendor*/  

router.post("/vendor/register", vendorRegister);
router.post("/vendor/login", vendorLogin);
router.patch( "/change-password", authenticate, authorizeVendor, validate(changePasswordSchema), changeVendorPasswordController );
/* Admin  */

router.post("/admin/login", adminLogin);

export default router;