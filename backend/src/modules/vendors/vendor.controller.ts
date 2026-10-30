
import type { Request, Response, NextFunction } from "express";
import { UserRole } from "../../generated/prisma/client.js";
import { getVendorDashboardStats } from "./vendor.service.js";

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: UserRole;
  };
}

export async function getVendorDashboard(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    if (user.role !== UserRole.VENDOR) {
      res.status(403).json({
        success: false,
        message: "Vendor access required.",
      });
      return;
    }

    const allowedRanges = [7, 30, 90];
    const requestedRange = Number(req.query.rangeDays ?? 30);

    const rangeDays = allowedRanges.includes(requestedRange)
      ? requestedRange
      : 30;

    const dashboard = await getVendorDashboardStats(
      user.userId,
      rangeDays,
    );

    res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Vendor profile not found.") {
      res.status(404).json({
        success: false,
        code: "VENDOR_PROFILE_NOT_FOUND",
        message: "Please complete your vendor profile.",
        data: null,
      });
      return;
    }

    next(error);
  }
}
