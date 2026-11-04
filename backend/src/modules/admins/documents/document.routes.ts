import { Router } from "express";
import { getAdminDocumentAccessController, reviewAdminDocumentController } from "./document.controller.js";

const router = Router();
router.get("/:documentId/access", getAdminDocumentAccessController);
router.patch("/:documentId/review", reviewAdminDocumentController);

export default router;
