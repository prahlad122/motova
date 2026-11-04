import type { Response, NextFunction, Request } from "express";
import type { AuthenticatedRequest } from "../../../middlewares/auth.middleware.js";
import { getAdminDocumentAccess, reviewAdminDocument } from "./document.service.js";
import { reviewVendorDocumentSchema } from "../admin.validation.js";

export async function getAdminDocumentAccessController(
  req: Request<{ documentId: string }>, res: Response, next: NextFunction,
) {
  try {
    const url = await getAdminDocumentAccess(req.params.documentId);
    if (!url) return res.status(404).json({ success: false, message: "Document not found." });
    return res.status(200).json({ success: true, message: "Document access generated successfully.", data: { url, expiresIn: 300 } });
  } catch (error) { return next(error); }
}

export async function reviewAdminDocumentController(
  req: AuthenticatedRequest & Request<{ documentId: string }>, res: Response, next: NextFunction,
) {
  try {
    const validation = reviewVendorDocumentSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({
      success: false,
      message: "Please correct the document review details.",
      errors: validation.error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message })),
    });
    const adminId = req.user?.userId;
    if (!adminId) return res.status(401).json({ success: false, message: "Admin identity was not found." });
    const document = await reviewAdminDocument({ documentId: req.params.documentId, adminId, ...validation.data });
    if (!document) return res.status(404).json({ success: false, message: "Document not found." });
    return res.status(200).json({ success: true, message: `Document ${validation.data.decision.toLowerCase()} successfully.`, data: document });
  } catch (error) { return next(error); }
}
