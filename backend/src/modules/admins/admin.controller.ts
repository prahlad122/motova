
import type { Request, Response, NextFunction } from "express";
import { getAdminDashboardStats } from "./admin.service.js";

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
