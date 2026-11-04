/*
  Warnings:

  - A unique constraint covering the columns `[gstNumber]` on the table `VendorProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "VendorDocumentType" ADD VALUE 'PAN_CARD';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "VendorProfile" ADD COLUMN     "authorizedPerson" TEXT,
ADD COLUMN     "gstNumber" TEXT,
ADD COLUMN     "mobileVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shippingAddress" TEXT,
ADD COLUMN     "storeManager" TEXT;

-- CreateTable
CREATE TABLE "MobileOtp" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastSentAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MobileOtp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MobileOtp_userId_idx" ON "MobileOtp"("userId");

-- CreateIndex
CREATE INDEX "MobileOtp_expiresAt_idx" ON "MobileOtp"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "VendorProfile_gstNumber_key" ON "VendorProfile"("gstNumber");

-- AddForeignKey
ALTER TABLE "MobileOtp" ADD CONSTRAINT "MobileOtp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
