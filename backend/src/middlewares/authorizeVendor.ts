
import type { Request, Response, NextFunction } from "express";
import { UserRole } from "../generated/prisma/client.js";

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: UserRole;
  };
}

export function authorizeVendor(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
    return;
  }

  if (req.user.role !== UserRole.VENDOR) {
    res.status(403).json({
      success: false,
      message: "Vendor access required.",
    });
    return;
  }

  next();
}
