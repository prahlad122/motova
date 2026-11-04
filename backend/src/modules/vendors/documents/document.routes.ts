
import { Router } from "express";

import { authenticate } from "../../../middlewares/auth.middleware.js";
import { authorizeVendor } from "../../../middlewares/authorizeVendor.js";
import { uploadVendorDocument } from "../../../middlewares/upload.middleware.js";

import { validateVendorDocumentTypes } from "./document.validation.js";

import {
  uploadVendorDocumentController,
  getVendorDocumentAccessController,
} from "./document.controller.js";

const router = Router();

// All routes require an authenticated vendor.
router.use(authenticate, authorizeVendor);

// Upload multiple vendor documents.
router.post(
  "/",
  uploadVendorDocument,
  validateVendorDocumentTypes,
  uploadVendorDocumentController
);

// Generate temporary access to an owned document.
router.get(
  "/:documentId/access",
  getVendorDocumentAccessController
);

export default router;
