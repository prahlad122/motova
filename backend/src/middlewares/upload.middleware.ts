import multer, { type FileFilterCallback } from "multer";
import path from "node:path";
import type { Request, Response, NextFunction } from "express";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 6;
const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"];

const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback,
) => {
  const allowedFields = ["documents", "GST_CERTIFICATE"];
  if (!allowedFields.includes(file.fieldname)) {
    return callback(new Error(`Unexpected file field: ${file.fieldname}`));
  }

  const extension = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return callback(new Error("Only PDF, JPG, JPEG and PNG files are allowed."));
  }

  if (!["application/pdf", "image/jpeg", "image/png"].includes(file.mimetype)) {
    return callback(new Error(`Unsupported MIME type: ${file.mimetype}`));
  }

  callback(null, true);
};

const multerUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: MAX_FILES },
});

const hasValidFileSignature = (file: Express.Multer.File): boolean => {
  const buffer = file.buffer;
  if (!buffer || buffer.length < 8) return false;

  const extension = path.extname(file.originalname).toLowerCase();
  if (extension === ".pdf") return buffer.subarray(0, 5).toString("ascii") === "%PDF-";
  if (extension === ".jpg" || extension === ".jpeg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (extension === ".png") {
    return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }
  return false;
};

export const uploadVendorDocument = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.is("multipart/form-data")) {
    res.status(400).json({ success: false, message: "Request must use multipart/form-data." });
    return;
  }

  multerUpload.any()(req, res, (error: unknown) => {
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        res.status(413).json({ success: false, message: "Each file must not exceed 5 MB." });
        return;
      }
      if (error.code === "LIMIT_FILE_COUNT") {
        res.status(400).json({ success: false, message: "Maximum 6 documents are allowed per request." });
        return;
      }
      res.status(400).json({ success: false, message: error.message, code: error.code, field: error.field ?? null });
      return;
    }

    if (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "File upload failed.",
      });
      return;
    }

    const files = req.files as Express.Multer.File[] | undefined;
    if (!files?.length) {
      res.status(400).json({ success: false, message: "Please upload at least one document." });
      return;
    }

    for (const file of files) {
      if (!hasValidFileSignature(file)) {
        res.status(400).json({ success: false, message: `Invalid file content: ${file.originalname}` });
        return;
      }
    }

    next();
  });
};
