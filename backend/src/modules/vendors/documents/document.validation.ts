import type { Request, Response, NextFunction } from "express";

import {
  VendorDocumentType,
} from "../../../generated/prisma/client.js";

const ALLOWED_DOCUMENT_TYPES = Object.values(VendorDocumentType);

export const validateVendorDocumentTypes = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    let documentTypes = req.body?.documentTypes;

    if (typeof documentTypes === "string") {
      // Support a JSON array, e.g. ["GST_CERTIFICATE","PAN_CARD"]
      if (documentTypes.trim().startsWith("[")) {
        documentTypes = JSON.parse(documentTypes);
      } else {
        // Support a single value, e.g. OTHER
        documentTypes = [documentTypes];
      }
    }

    if (!Array.isArray(documentTypes) || documentTypes.length === 0) {
      res.status(400).json({
        success: false,
        message: "Please provide at least one document type.",
      });
      return;
    }

    const invalidTypes = documentTypes.filter(
      (type) =>
        typeof type !== "string" ||
        !ALLOWED_DOCUMENT_TYPES.includes(type as VendorDocumentType)
    );

    if (invalidTypes.length > 0) {
      res.status(400).json({
        success: false,
        message: "Invalid document type.",
        invalidTypes,
        allowedTypes: ALLOWED_DOCUMENT_TYPES,
      });
      return;
    }

    const files = req.files as Express.Multer.File[] | undefined;

    if (!files || files.length !== documentTypes.length) {
      res.status(400).json({
        success: false,
        message: "The number of documents must match the number of document types.",
        uploadedFiles: files?.length ?? 0,
        documentTypes: documentTypes.length,
      });
      return;
    }

    req.body.documentTypes = documentTypes;

    next();
  } catch {
    res.status(400).json({
      success: false,
      message: "Invalid documentTypes format. Send a valid JSON array.",
    });
  }
};
