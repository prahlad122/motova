import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

import { prisma } from "../../config/database";
import {
  UserRole,
  UserStatus,
} from "../../generated/prisma/client";

const JWT_ACCESS_SECRET: string =
  process.env.JWT_ACCESS_SECRET ?? "";

if (!JWT_ACCESS_SECRET) {
  throw new Error("JWT_ACCESS_SECRET is not defined");
}

if (!JWT_ACCESS_SECRET) {
  throw new Error("JWT_ACCESS_SECRET is not defined");
}

// ======================================================
// Validation Schemas
// ======================================================

const vendorRegisterSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters"),

  email: z
    .string()
    .email("Invalid email address"),

  mobile: z
    .string()
    .min(10, "Invalid mobile number"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address"),

  password: z
    .string()
    .min(1, "Password is required"),
});

// ======================================================
// Generate JWT Token
// ======================================================

function generateToken(user: {
  id: string;
  role: UserRole;
}) {
  const payload = {
    userId: user.id,
    role: user.role,
  };

  return jwt.sign(
    payload,
    JWT_ACCESS_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

// ======================================================
// Vendor Registration
// ======================================================

/**
 * Vendor does NOT require admin approval.
 *
 * Newly registered vendor:
 * - role = VENDOR
 * - status = ACTIVE
 * - can login immediately
 */
export async function vendorRegister(
  req: Request,
  res: Response
) {
  try {
    // ----------------------------------------------
    // Validate request body
    // ----------------------------------------------

    const result = vendorRegisterSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten(),
      });
    }

    const {
      name,
      email,
      mobile,
      password,
    } = result.data;

    // ----------------------------------------------
    // Check if email/mobile already exists
    // ----------------------------------------------

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          {
            email,
          },
          {
            mobile,
          },
        ],
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          existingUser.email === email
            ? "Email is already registered"
            : "Mobile number is already registered",
      });
    }

    // ----------------------------------------------
    // Hash password
    // ----------------------------------------------

    const passwordHash = await bcrypt.hash(
      password,
      12
    );

    // ----------------------------------------------
    // Create vendor
    // ----------------------------------------------

    const user = await prisma.user.create({
      data: {
        name,
        email,
        mobile,
        passwordHash,

        // Vendor role
        role: UserRole.VENDOR,

        // Vendor can login immediately
        status: UserStatus.ACTIVE,
      },

      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    // ----------------------------------------------
    // Generate JWT
    // ----------------------------------------------

    const token = generateToken({
      id: user.id,
      role: user.role,
    });

    // ----------------------------------------------
    // Response
    // ----------------------------------------------

    return res.status(201).json({
      success: true,
      message: "Vendor registered successfully",
      token,
      user,
    });
  } catch (error) {
    console.error(
      "Vendor registration error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while registering vendor",
    });
  }
}

// ======================================================
// Vendor Login
// ======================================================

/**
 * ACTIVE vendor -> login allowed
 * SUSPENDED vendor -> login rejected
 *
 * No PENDING approval is required.
 */
export async function vendorLogin(
  req: Request,
  res: Response
) {
  try {
    // ----------------------------------------------
    // Validate request body
    // ----------------------------------------------

    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid login data",
        errors: result.error.flatten(),
      });
    }

    const {
      email,
      password,
    } = result.data;

    // ----------------------------------------------
    // Find vendor by email
    // ----------------------------------------------

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    // ----------------------------------------------
    // Check vendor
    // ----------------------------------------------

    if (
      !user ||
      user.role !== UserRole.VENDOR
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // ----------------------------------------------
    // Compare password
    // ----------------------------------------------

    const passwordMatched =
      await bcrypt.compare(
        password,
        user.passwordHash
      );

    if (!passwordMatched) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // ----------------------------------------------
    // Check account status
    // ----------------------------------------------

    if (
      user.status === UserStatus.SUSPENDED
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Your vendor account has been suspended",
      });
    }

    // ----------------------------------------------
    // Generate JWT
    // ----------------------------------------------

    const token = generateToken({
      id: user.id,
      role: user.role,
    });

    // ----------------------------------------------
    // Response
    // ----------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Vendor login successful",
      token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error(
      "Vendor login error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while logging in",
    });
  }
}

// ======================================================
// Admin Login
// ======================================================

export async function adminLogin(
  req: Request,
  res: Response
) {
  try {
    // ----------------------------------------------
    // Validate request body
    // ----------------------------------------------

    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid login data",
        errors: result.error.flatten(),
      });
    }

    const {
      email,
      password,
    } = result.data;

    // ----------------------------------------------
    // Find user
    // ----------------------------------------------

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    // ----------------------------------------------
    // Check admin
    // ----------------------------------------------

    if (
      !user ||
      user.role !== UserRole.ADMIN
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // ----------------------------------------------
    // Compare password
    // ----------------------------------------------

    const passwordMatched =
      await bcrypt.compare(
        password,
        user.passwordHash
      );

    if (!passwordMatched) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // ----------------------------------------------
    // Check account status
    // ----------------------------------------------

    if (
      user.status === UserStatus.SUSPENDED
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Admin account has been suspended",
      });
    }

    // ----------------------------------------------
    // Generate JWT
    // ----------------------------------------------

    const token = generateToken({
      id: user.id,
      role: user.role,
    });

    // ----------------------------------------------
    // Response
    // ----------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error(
      "Admin login error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while logging in",
    });
  }
}