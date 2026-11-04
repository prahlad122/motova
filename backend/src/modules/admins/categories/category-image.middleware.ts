import multer from "multer";
import type { Request, Response, NextFunction } from "express";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
      callback(new Error("Category images must be JPG, PNG, or WebP files."));
      return;
    }
    callback(null, true);
  },
});

export function uploadCategoryImageFile(req: Request, res: Response, next: NextFunction) {
  upload.single("image")(req, res, (error) => {
    if (!error) { next(); return; }
    const tooLarge = error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE";
    res.status(tooLarge ? 413 : 400).json({ success: false, message: tooLarge ? "Category images must be 5 MB or smaller." : error.message });
  });
}
