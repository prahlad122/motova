import type { Response, NextFunction } from "express";

import type { AuthenticatedRequest } from "../../../middlewares/auth.middleware.js";

import { VendorDocumentType } from "../../../generated/prisma/client.js";

import {
  uploadVendorDocuments,
  getVendorDocumentSignedUrl,
} from "./document.service.js";

export const uploadVendorDocumentController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[] | undefined;
    const documentTypes = req.body.documentTypes as VendorDocumentType[];

    if (!req.user?.userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }
    if (!files || files.length === 0) {
      res.status(400).json({
        success: false,
        message: "Please upload at least one document.",
      });
      return;
    }

    if (
      !Array.isArray(documentTypes) ||
      files.length !== documentTypes.length
    ) {
      res.status(400).json({
        success: false,
        message: "Files and document types count do not match.",
      });
      return;
    }

    const documents = await uploadVendorDocuments({
      userId: req.user.userId,
      files,
      documentTypes,
    });

    res.status(201).json({
      success: true,
      message: "Documents uploaded successfully.",
      count: documents.length,
      data: documents,
    });
  } catch (error: unknown) {
    next(error);
  }
};

/**
 * Generate temporary access to a vendor's own document.
 */
export const getVendorDocumentAccessController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const documentId = req.params.documentId;

    if (typeof documentId !== "string" || !documentId.trim()) {
      res.status(400).json({
        success: false,
        message: "A valid document ID is required.",
      });
      return;
    }

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    if (!documentId) {
      res.status(400).json({
        success: false,
        message: "Document ID is required.",
      });
      return;
    }

    const signedUrl = await getVendorDocumentSignedUrl(userId, documentId);

    res.status(200).json({
      success: true,
      message: "Document access generated successfully.",
      data: {
        url: signedUrl,
        expiresIn: 300,
      },
    });
  } catch (error: unknown) {
    next(error);
  }
};
