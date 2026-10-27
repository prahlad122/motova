
import type { Request, Response } from "express";

import {
  registerVendor,
  loginVendor,
  loginAdmin,
} from "./auth.service";

export async function vendorRegister(
  req: Request,
  res: Response,
) {
  try {
    const result = await registerVendor(req.body);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error("Vendor registration error:", error);

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
  } catch (error) {
    console.error("Vendor login error:", error);

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
  } catch (error) {
    console.error("Admin login error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while logging in",
    });
  }
}
