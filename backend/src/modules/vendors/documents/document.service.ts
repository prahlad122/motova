
// import { randomUUID } from "node:crypto";
// import path from "node:path";
// import type { UploadApiResponse } from "cloudinary";

// import cloudinary from "../../../config/cloudinary.js";
// import { prisma } from "../../../config/database.js";

// import {
//   VendorDocumentType,
//   ReviewStatus,
//   VendorVerificationStatus,
// } from "../../../generated/prisma/client.js";

// type UploadVendorDocumentsInput = {
//   userId: string;
//   files: Express.Multer.File[];
//   documentTypes: VendorDocumentType[];
// };

// type UploadedAsset = {
//   result: UploadApiResponse;
//   file: Express.Multer.File;
//   documentType: VendorDocumentType;
// };

// const uploadToCloudinary = (
//   file: Express.Multer.File,
//   vendorProfileId: string,
//   documentType: VendorDocumentType
// ): Promise<UploadApiResponse> => {
//   return new Promise((resolve, reject) => {
//     const publicId = randomUUID();

//     const uploadStream = cloudinary.uploader.upload_stream(
//       {
//         resource_type: "auto",
//         type: "authenticated",
//         access_mode: "authenticated",
//         folder: `motova/vendor-documents/${vendorProfileId}/${documentType}`,
//         public_id: publicId,
//         overwrite: false,
//         use_filename: false,
//         unique_filename: false,
//       },
//       (error, result) => {
//         if (error) {
//           reject(error);
//           return;
//         }

//         if (!result) {
//           reject(new Error("Cloudinary did not return an upload result."));
//           return;
//         }

//         resolve(result);
//       }
//     );

//     uploadStream.end(file.buffer);
//   });
// };

// const deleteCloudinaryAsset = async (
//   publicId: string,
//   resourceType: string
// ): Promise<void> => {
//   await cloudinary.uploader.destroy(publicId, {
//     resource_type: resourceType as "image" | "video" | "raw",
//     type: "authenticated",
//     invalidate: true,
//   });
// };

// const cleanupUploadedAssets = async (
//   assets: UploadedAsset[]
// ): Promise<void> => {
//   for (const asset of assets) {
//     try {
//       await deleteCloudinaryAsset(
//         asset.result.public_id,
//         asset.result.resource_type
//       );
//     } catch (error) {
//     }
//   }
// };

// export const uploadVendorDocuments = async ({
//   userId,
//   files,
//   documentTypes,
// }: UploadVendorDocumentsInput) => {
//   if (!files?.length) {
//     throw new Error("Please upload at least one document.");
//   }

//   if (!documentTypes?.length) {
//     throw new Error("Please provide document types.");
//   }

//   if (files.length !== documentTypes.length) {
//     throw new Error(
//       "The number of documents must match the number of document types."
//     );
//   }

//   const vendorProfile = await prisma.vendorProfile.findUnique({
//     where: { userId },
//     select: { id: true },
//   });

//   if (!vendorProfile) {
//     throw new Error("Vendor profile not found.");
//   }

//   const uploadedAssets: UploadedAsset[] = [];

//   try {
//     // Upload each file to Cloudinary and retain its matching document type.
//     for (let index = 0; index < files.length; index++) {
//       const file = files[index];
//       const documentType = documentTypes[index];

//       const result = await uploadToCloudinary(
//         file,
//         vendorProfile.id,
//         documentType
//       );

//       uploadedAssets.push({
//         result,
//         file,
//         documentType,
//       });
//     }

//     // Save all document metadata in one database transaction.
//     const documents = await prisma.$transaction(async (tx) => {
//       const createdDocuments = [];

//       for (const asset of uploadedAssets) {
//         const document = await tx.vendorDocument.create({
//           data: {
//             vendorProfileId: vendorProfile.id,
//             type: asset.documentType,
//             fileName: path.basename(asset.file.originalname),
//             fileUrl: asset.result.secure_url,
//             storageKey: asset.result.public_id,
//             mimeType: asset.file.mimetype,
//             fileSize: asset.file.size,
//             status: ReviewStatus.PENDING,
//           },
//           select: {
//             id: true,
//             type: true,
//             fileName: true,
//             mimeType: true,
//             fileSize: true,
//             status: true,
//             submittedAt: true,
//           },
//         });

//         createdDocuments.push(document);
//       }

//       const hasRequiredDocument = documentTypes.some(
//         (type) =>
//           type === VendorDocumentType.GST_CERTIFICATE ||
//           type === VendorDocumentType.PAN_CARD
//       );

//       if (hasRequiredDocument) {
//         await tx.vendorProfile.update({
//           where: { id: vendorProfile.id },
//           data: {
//             verificationStatus: VendorVerificationStatus.PENDING,
//             verifiedAt: null,
//           },
//         });
//       }

//       return createdDocuments;
//     });

//     return documents;
//   } catch (error) {
//     // Remove all uploaded Cloudinary assets if any upload or DB operation fails.
//     await cleanupUploadedAssets(uploadedAssets);
//     throw error;
//   }
// };




import path from "node:path";

import { prisma } from "../../../config/database.js";

import {
  VendorDocumentType,
  ReviewStatus,
  VendorVerificationStatus,
} from "../../../generated/prisma/client.js";

import {
  uploadToR2,
  deleteFromR2,
  generateR2SignedUrl,
} from "../../../services/r2Storage.service.js";

type UploadVendorDocumentsInput = {
  userId: string;
  files: Express.Multer.File[];
  documentTypes: VendorDocumentType[];
};

type UploadedAsset = {
  storageKey: string;
  file: Express.Multer.File;
  documentType: VendorDocumentType;
};

export const uploadVendorDocuments = async ({
  userId,
  files,
  documentTypes,
}: UploadVendorDocumentsInput) => {
  if (!files?.length) {
    throw new Error("Please upload at least one document.");
  }

  if (!documentTypes?.length) {
    throw new Error("Please provide document types.");
  }

  if (files.length !== documentTypes.length) {
    throw new Error(
      "The number of documents must match the number of document types."
    );
  }

  const vendorProfile = await prisma.vendorProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!vendorProfile) {
    throw new Error("Vendor profile not found.");
  }

  const uploadedAssets: UploadedAsset[] = [];

  try {
    // Upload each file to R2 and retain its matching document type.
    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      const documentType = documentTypes[index];

      const result = await uploadToR2({
        file,
        vendorProfileId: vendorProfile.id,
        documentType,
      });

      uploadedAssets.push({
        storageKey: result.storageKey,
        file,
        documentType,
      });
    }

    // Save all document metadata in one database transaction.
    const documents = await prisma.$transaction(async (tx) => {
      const createdDocuments = [];

      for (const asset of uploadedAssets) {
        const document = await tx.vendorDocument.create({
          data: {
            vendorProfileId: vendorProfile.id,
            type: asset.documentType,
            fileName: path.basename(asset.file.originalname),

            // Internal storage reference; never expose as a browser URL.
            fileUrl: `r2://${asset.storageKey}`,
            storageKey: asset.storageKey,

            mimeType: asset.file.mimetype,
            fileSize: asset.file.size,
            status: ReviewStatus.PENDING,
          },
          select: {
            id: true,
            type: true,
            fileName: true,
            mimeType: true,
            fileSize: true,
            status: true,
            submittedAt: true,
          },
        });

        createdDocuments.push(document);
      }

      const hasRequiredDocument = documentTypes.some(
        (type) =>
          type === VendorDocumentType.GST_CERTIFICATE ||
          type === VendorDocumentType.PAN_CARD
      );

      if (hasRequiredDocument) {
        await tx.vendorProfile.update({
          where: { id: vendorProfile.id },
          data: {
            verificationStatus: VendorVerificationStatus.PENDING,
            verifiedAt: null,
          },
        });
      }

      return createdDocuments;
    });

    return documents;
  } catch (error) {
    // Remove successfully uploaded R2 objects if upload or DB operation fails.
    await Promise.all(
      uploadedAssets.map(async (asset) => {
        try {
          await deleteFromR2(asset.storageKey);
        } catch {
          // Keep the original upload or database error if cleanup also fails.
        }
      })
    );

    throw error;
  }
};

/**
 * Generate temporary access to a vendor document.
 * Call only after checking that the requester is authorized
 * to access the requested document.
 */
export const getVendorDocumentSignedUrl = async (
  userId: string,
  documentId: string
): Promise<string> => {
  const document = await prisma.vendorDocument.findFirst({
    where: {
      id: documentId,
      vendor: {
        userId,
      },
    },
    select: {
      storageKey: true,
    },
  });

  if (!document?.storageKey) {
    throw new Error("Document not found or access denied.");
  }

  return generateR2SignedUrl(document.storageKey);
};
