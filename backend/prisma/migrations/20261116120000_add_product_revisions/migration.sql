CREATE TYPE "ProductRevisionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE "ProductRevision" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "vendorProfileId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "brandId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sku" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "compareAtPrice" DECIMAL(12,2),
    "stockQuantity" INTEGER NOT NULL,
    "status" "ProductRevisionStatus" NOT NULL DEFAULT 'PENDING',
    "reviewerId" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    CONSTRAINT "ProductRevision_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductRevisionImage" (
    "id" TEXT NOT NULL,
    "revisionId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "storageKey" TEXT,
    "altText" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductRevisionImage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ProductRevision_productId_submittedAt_idx" ON "ProductRevision"("productId", "submittedAt");
CREATE INDEX "ProductRevision_vendorProfileId_status_submittedAt_idx" ON "ProductRevision"("vendorProfileId", "status", "submittedAt");
CREATE INDEX "ProductRevision_status_submittedAt_idx" ON "ProductRevision"("status", "submittedAt");
CREATE INDEX "ProductRevision_reviewerId_idx" ON "ProductRevision"("reviewerId");
CREATE INDEX "ProductRevisionImage_revisionId_sortOrder_idx" ON "ProductRevisionImage"("revisionId", "sortOrder");
CREATE UNIQUE INDEX "ProductRevision_one_pending_per_product_key" ON "ProductRevision"("productId") WHERE "status" = 'PENDING';

ALTER TABLE "ProductRevision" ADD CONSTRAINT "ProductRevision_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProductRevision" ADD CONSTRAINT "ProductRevision_vendorProfileId_fkey" FOREIGN KEY ("vendorProfileId") REFERENCES "VendorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProductRevision" ADD CONSTRAINT "ProductRevision_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProductRevision" ADD CONSTRAINT "ProductRevision_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProductRevision" ADD CONSTRAINT "ProductRevision_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProductRevisionImage" ADD CONSTRAINT "ProductRevisionImage_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "ProductRevision"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
