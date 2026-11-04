-- AlterTable
ALTER TABLE "VendorDocument" ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "VendorDocument_vendorProfileId_type_idx" ON "VendorDocument"("vendorProfileId", "type");

-- CreateIndex
CREATE INDEX "VendorDocument_type_status_idx" ON "VendorDocument"("type", "status");
