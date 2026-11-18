import type { Response, NextFunction } from "express";
import { UserStatus, VendorVerificationStatus } from "../generated/prisma/client.js";
import type { AuthenticatedRequest } from "./auth.middleware.js";
import { prisma } from "../config/database.js";

export async function requireVerifiedVendor(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { userId: req.user!.userId },
      select: { verificationStatus: true, user: { select: { status: true } } },
    });
    if (!vendor) return res.status(403).json({ success: false, message: "Vendor profile not found.", code: "VENDOR_VERIFICATION_REQUIRED" });
    if (vendor.user.status !== UserStatus.ACTIVE || vendor.verificationStatus !== VendorVerificationStatus.APPROVED) {
      return res.status(403).json({ success: false, message: "Your business verification must be approved before you can list products.", code: "VENDOR_VERIFICATION_REQUIRED" });
    }
    return next();
  } catch (error) {
    return next(error);
  }
}
