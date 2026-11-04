
import {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";

import {
  r2Client,
  R2_BUCKET_NAME,
} from "../config/r2.js";

interface UploadFileInput {
  file: Express.Multer.File;
  vendorProfileId: string;
  documentType: string;
}

interface UploadResult {
  storageKey: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
}

const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(-150);
};

/**
 * Upload a vendor document to private R2 storage.
 */
export const uploadToR2 = async ({
  file,
  vendorProfileId,
  documentType,
}: UploadFileInput): Promise<UploadResult> => {
  const fileName = sanitizeFileName(file.originalname);

  const storageKey = [
    "vendor-documents",
    vendorProfileId,
    documentType,
    `${randomUUID()}-${fileName}`,
  ].join("/");

  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: storageKey,
      Body: file.buffer,
      ContentType: file.mimetype,
      ContentLength: file.size,
    })
  );

  return {
    storageKey,
    fileName: file.originalname,
    mimeType: file.mimetype,
    fileSize: file.size,
  };
};

export const uploadCategoryImageToR2 = async (file: Express.Multer.File): Promise<string> => {
  const fileName = sanitizeFileName(file.originalname);
  const storageKey = `category-images/${randomUUID()}-${fileName}`;
  await r2Client.send(new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: storageKey,
    Body: file.buffer,
    ContentType: file.mimetype,
    ContentLength: file.size,
  }));
  return storageKey;
};

/**
 * Delete a document from R2.
 * Useful for cleaning up if a database operation fails.
 */
export const deleteFromR2 = async (
  storageKey: string
): Promise<void> => {
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: storageKey,
    })
  );
};

/**
 * Generate temporary private access to a document.
 * The URL expires after 5 minutes.
 */
export const generateR2SignedUrl = async (
  storageKey: string,
  expiresIn = 300,
): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: storageKey,
  });

  return getSignedUrl(r2Client, command, {
    expiresIn,
  });
};
