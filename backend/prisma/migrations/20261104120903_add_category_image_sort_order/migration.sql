-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "image" TEXT,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;
