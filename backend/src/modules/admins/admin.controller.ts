
import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../middlewares/auth.middleware.js";
import { getAdminDashboardStats } from "./dashboard/dashboard.service.js";
import { getPendingProductApprovals, reviewProductListing, } from "./products/product-approval.service.js";

import {  createVendorByAdmin,  getAdminVendors, getAdminVendorById, updateAdminVendorStatus, } from "./admin.service.js";
import { getVendorsQuerySchema, updateVendorStatusSchema, } from "./admin.validation.js";
import { UserStatus } from "../../generated/prisma/client.js";


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

export async function createVendor(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await createVendorByAdmin(req.body);

    return res.status(201).json({
      success: true,
      message: "Vendor created successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getVendors(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const validation = getVendorsQuerySchema.safeParse(req.query);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid vendor listing filters.",
        errors: validation.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const result = await getAdminVendors(validation.data);

    return res.status(200).json({
      success: true,
      message: "Vendors fetched successfully.",
      data: result.vendors,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

// GET vendor details
export async function getVendorById(
  req: Request<{ vendorId: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { vendorId } = req.params;

    const vendor = await getAdminVendorById(vendorId);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vendor details fetched successfully.",
      data: vendor,
    });
  } catch (error) {
    next(error);
  }
}

// PATCH vendor status

export async function updateVendorStatus(
  req: Request<
    { vendorId: string },
    unknown,
    { status: "ACTIVE" | "SUSPENDED" }
  >,
  res: Response,
  next: NextFunction,
) {
  try {
    const { vendorId } = req.params;

    const validation = updateVendorStatusSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid vendor status.",
        errors: validation.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const vendor = await updateAdminVendorStatus(
      vendorId,
      validation.data.status === "ACTIVE"
        ? UserStatus.ACTIVE
        : UserStatus.SUSPENDED,
    );

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Vendor ${validation.data.status.toLowerCase()} successfully.`,
      data: vendor,
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
    if (error && typeof error === "object" && "statusCode" in error && typeof error.statusCode === "number") {
      return res.status(error.statusCode).json({ success: false, message: error instanceof Error ? error.message : "Product request failed." });
    }
    return res.status(500).json({ success: false, message: "An unexpected server error occurred." });
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
    if (error && typeof error === "object" && "statusCode" in error && typeof error.statusCode === "number") {
      return res.status(error.statusCode).json({ success: false, message: error instanceof Error ? error.message : "Product review failed." });
    }
    return res.status(500).json({ success: false, message: "An unexpected server error occurred." });
  }
}

//get all the vendors
