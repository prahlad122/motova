-- Add the existing PAN document type to the vendor document enum.
-- This is additive and preserves all stored documents.
ALTER TYPE "VendorDocumentType" ADD VALUE IF NOT EXISTS 'PAN_CARD';
