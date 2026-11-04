
import type { Request, Response, NextFunction } from "express";

import {
  registerVendor,
  loginVendor,
  loginAdmin,
} from "./auth.service";

import type { AuthenticatedRequest } from "../../middlewares/auth.middleware.js";
import { changeVendorPassword } from "./auth.service.js";
export async function vendorRegister(
  req: Request,
  res: Response,
) {
  try {
    const result = await registerVendor(req.body);
    return res.status(result.status).json(result.body);
  } catch {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while registering vendor",
    });
  }
}

export async function vendorLogin(
  req: Request,
  res: Response,
) {
  try {
    const result = await loginVendor(req.body);
    return res.status(result.status).json(result.body);
  } catch {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while logging in",
    });
  }
}

export async function adminLogin(
  req: Request,
  res: Response,
) {
  try {
    const result = await loginAdmin(req.body);
    return res.status(result.status).json(result.body);
  } catch {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while logging in",
    });
  }
}


export async function changeVendorPasswordController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const result = await changeVendorPassword(
      req.user.userId,
      req.body,
    );

    return res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
}
