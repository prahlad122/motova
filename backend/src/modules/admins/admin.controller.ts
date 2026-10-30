
import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../middlewares/auth.middleware.js";
import {
  getAdminDashboardStats,
  getPendingProductApprovals,
  reviewProductListing,
} from "./admin.service.js";

export async function getAdminDashboard(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const stats = await getAdminDashboardStats();

    res.status(200).json({
      success: true,
      message: "Admin dashboard statistics fetched successfully",
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}

export async function getPendingApprovals(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const products = await getPendingProductApprovals();

    res.status(200).json({
      success: true,
      message: "Pending product approvals fetched successfully",
      data: products,
    });
  } catch (error) {
    next(error);
  }
}

export async function reviewProduct(
  req: AuthenticatedRequest & Request<
    { productId: string },
    unknown,
    { decision?: string; note?: string }
  >,
  res: Response,
  next: NextFunction,
) {
  try {
    const { productId } = req.params;
    const { decision, note } = req.body;

    if (decision !== "APPROVED" && decision !== "REJECTED") {
      res.status(400).json({
        success: false,
        message: "Decision must be APPROVED or REJECTED.",
      });
      return;
    }

    const reviewerId = req.user?.userId;

    if (!reviewerId) {
      res.status(401).json({
        success: false,
        message: "Admin identity was not found.",
      });
      return;
    }

    const product = await reviewProductListing(
      productId,
      reviewerId,
      decision,
      note,
    );

    res.status(200).json({
      success: true,
      message: `Product ${decision.toLowerCase()} successfully.`,
      data: product,
    });
  } catch (error) {
    next(error);
  }
}