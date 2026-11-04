import { generateR2SignedUrl } from "../../../services/r2Storage.service.js";
import { prisma } from "../../../config/database.js";
import { ReviewStatus, VendorDocumentType, VendorVerificationStatus } from "../../../generated/prisma/client.js";

export async function getAdminDocumentAccess(documentId: string) {
  const document = await prisma.vendorDocument.findUnique({
    where: { id: documentId },
    select: { storageKey: true, fileUrl: true },
  });
  if (!document) return null;
  if (document.storageKey) return generateR2SignedUrl(document.storageKey);

  // Older records may have the R2 key embedded in fileUrl instead of storageKey.
  if (document.fileUrl.startsWith("r2://")) {
    return generateR2SignedUrl(document.fileUrl.slice("r2://".length));
  }

  // Support documents uploaded before the R2 migration.
  if (document.fileUrl.startsWith("https://res.cloudinary.com/")) {
    return document.fileUrl;
  }

  throw Object.assign(
    new Error("This document has no usable storage reference. Ask the vendor to upload it again."),
    { statusCode: 409 },
  );
}

export async function reviewAdminDocument(input: {
  documentId: string;
  adminId: string;
  decision: "APPROVED" | "REJECTED";
  note?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const document = await tx.vendorDocument.findUnique({ where: { id: input.documentId }, select: { id: true, vendorProfileId: true } });
    if (!document) return null;

    await tx.vendorDocument.update({
      where: { id: document.id },
      data: {
        status: input.decision as ReviewStatus,
        rejectionReason: input.decision === "REJECTED" ? input.note?.trim() : null,
        reviewedAt: new Date(),
      },
    });
    await tx.documentReview.create({
      data: {
        documentId: document.id,
        reviewerId: input.adminId,
        status: input.decision as ReviewStatus,
        note: input.note?.trim() || null,
      },
    });

    const requiredDocs = await tx.vendorDocument.findMany({
      where: { vendorProfileId: document.vendorProfileId, type: { in: [VendorDocumentType.GST_CERTIFICATE, VendorDocumentType.PAN_CARD] } },
      select: { status: true },
    });
    const verificationStatus = requiredDocs.some((item) => item.status === ReviewStatus.REJECTED)
      ? VendorVerificationStatus.REJECTED
      : requiredDocs.length > 0 && requiredDocs.every((item) => item.status === ReviewStatus.APPROVED)
        ? VendorVerificationStatus.APPROVED
        : VendorVerificationStatus.PENDING;

    await tx.vendorProfile.update({
      where: { id: document.vendorProfileId },
      data: {
        verificationStatus,
        verifiedAt: verificationStatus === VendorVerificationStatus.APPROVED ? new Date() : null,
        verificationNote: verificationStatus === VendorVerificationStatus.REJECTED ? input.note?.trim() || null : null,
      },
    });

    return tx.vendorDocument.findUnique({
      where: { id: document.id },
      select: { id: true, type: true, fileName: true, status: true, rejectionReason: true, reviewedAt: true },
    });
  });
}
