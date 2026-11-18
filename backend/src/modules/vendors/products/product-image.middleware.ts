import multer from "multer";
import type { Request, Response, NextFunction } from "express";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 6, fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) return callback(new Error("Product images must be JPG, PNG, or WebP files."));
    callback(null, true);
  },
});

export function uploadProductImageFiles(req: Request, res: Response, next: NextFunction) {
  upload.array("images", 6)(req, res, (error) => {
    if (error) return res.status(error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({ success: false, message: error instanceof Error ? error.message : "Image upload failed." });
    const files = req.files as Express.Multer.File[] | undefined;
    for (const file of files ?? []) {
      const bytes = file.buffer;
      const valid = file.mimetype === "image/jpeg" ? bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
        : file.mimetype === "image/png" ? bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
        : bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP";
      if (!valid) return res.status(400).json({ success: false, message: `Invalid image file: ${file.originalname}` });
    }
    if (!files?.length) return res.status(400).json({ success: false, message: "Choose at least one product image." });
    next();
  });
}
