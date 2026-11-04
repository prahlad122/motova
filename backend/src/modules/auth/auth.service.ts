import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

import { prisma } from "../../config/database";
import { UserRole, UserStatus } from "../../generated/prisma/client";
import type { ChangePasswordInput } from "./password.validation.js";

const JWT_ACCESS_SECRET: string = process.env.JWT_ACCESS_SECRET ?? "";

if (!JWT_ACCESS_SECRET) {
  throw new Error("JWT_ACCESS_SECRET is not defined");
}

const vendorRegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  mobile: z.string().min(10, "Invalid mobile number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type AuthResult = {
  status: number;
  body: Record<string, unknown>;
};

function generateToken(user: { id: string; role: UserRole }) {
  return jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    JWT_ACCESS_SECRET,
    {
      expiresIn: "7d",
    },
  );
}

export async function registerVendor(input: unknown): Promise<AuthResult> {
  const result = vendorRegisterSchema.safeParse(input);
  if (!result.success) {
    return {
      status: 400,
      body: {
        success: false,
        message: "Validation failed!",
        errors: result.error.flatten(),
      },
    };
  }

  const { name, email, mobile, password } = result.data;
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { mobile }],
    },
  });

  if (existingUser) {
    return {
      status: 409,
      body: {
        success: false,
        message:
          existingUser.email === email
            ? "Email is already exist in DB!"
            : "Mobile number is already registered!",
      },
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  // create the user and vendor profile automatically
  // if either operation fails , Prisma rolls back both.

  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        name,
        email,
        mobile,
        passwordHash,
        role: UserRole.VENDOR,
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

    await tx.vendorProfile.create({
      data: {
        userId: createdUser.id,
        verificationStatus: "NOT_SUBMITTED",
      },
    });

    return createdUser;
  });

  const token = generateToken({
    id: user.id,
    role: user.role,
  });

  return {
    status: 201,
    body: {
      success: true,
      message: "Vendor registered successfully.",
      token,
      user,
    },
  };
}
export async function loginVendor(input: unknown): Promise<AuthResult> {
  const result = loginSchema.safeParse(input);

  if (!result.success) {
    return {
      status: 400,
      body: {
        success: false,
        message: "Invalid login data",
        errors: result.error.flatten(),
      },
    };
  }

  const { email, password } = result.data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || user.role !== UserRole.VENDOR) {
    return {
      status: 401,
      body: {
        success: false,
        message: "Invalid email or password",
      },
    };
  }

  const passwordMatched = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatched) {
    return {
      status: 401,
      body: {
        success: false,
        message: "Invalid email or password",
      },
    };
  }

  if (user.status === UserStatus.SUSPENDED) {
    return {
      status: 403,
      body: {
        success: false,
        message: "Your vendor account has been suspended",
      },
    };
  }

  const token = generateToken({
    id: user.id,
    role: user.role,
  });

  return {
    status: 200,
    body: {
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
    },
  };
}

export async function loginAdmin(input: unknown): Promise<AuthResult> {
  const result = loginSchema.safeParse(input);

  if (!result.success) {
    return {
      status: 400,
      body: {
        success: false,
        message: "Invalid login data",
        errors: result.error.flatten(),
      },
    };
  }

  const { email, password } = result.data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || user.role !== UserRole.ADMIN) {
    return {
      status: 401,
      body: {
        success: false,
        message: "Invalid email or password",
      },
    };
  }

  const passwordMatched = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatched) {
    return {
      status: 401,
      body: {
        success: false,
        message: "Invalid email or password",
      },
    };
  }

  if (user.status === UserStatus.SUSPENDED) {
    return {
      status: 403,
      body: {
        success: false,
        message: "Admin account has been suspended",
      },
    };
  }

  const token = generateToken({
    id: user.id,
    role: user.role,
  });

  return {
    status: 200,
    body: {
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
    },
  };
}

export async function changeVendorPassword(
  userId: string,
  input: ChangePasswordInput,
): Promise<AuthResult> {
  const { currentPassword, newPassword } = input;

  // 1. Find the authenticated vendor
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      status: true,
      passwordHash: true,
    },
  });

  if (!user || user.role !== UserRole.VENDOR) {
    return {
      status: 404,
      body: {
        success: false,
        message: "Vendor account not found.",
      },
    };
  }

  // 2. Prevent suspended vendors from changing passwords
  if (user.status === UserStatus.SUSPENDED) {
    return {
      status: 403,
      body: {
        success: false,
        message: "Your vendor account has been suspended.",
      },
    };
  }

  // 3. Verify the current password
  const passwordMatched = await bcrypt.compare(
    currentPassword,
    user.passwordHash,
  );

  if (!passwordMatched) {
    return {
      status: 400,
      body: {
        success: false,
        message: "Current password is incorrect.",
      },
    };
  }

  // 4. Prevent setting the same password again
  const samePassword = await bcrypt.compare(newPassword, user.passwordHash);

  if (samePassword) {
    return {
      status: 400,
      body: {
        success: false,
        message: "New password must be different from the current password.",
      },
    };
  }

  // 5. Hash the new password
  const passwordHash = await bcrypt.hash(newPassword, 12);

  // 6. Update the password
  const updateResult = await prisma.user.updateMany({
    where: {
      id: userId,
      role: UserRole.VENDOR,
      status: { not: UserStatus.SUSPENDED },
    },
    data: {
      passwordHash,
      mustChangePassword: false,
    },
  });

  if (updateResult.count === 0) {
    return {
      status: 409,
      body: {
        success: false,
        message: "Unable to update password. Please try again.",
      },
    };
  }

  return {
    status: 200,
    body: {
      success: true,
      message: "Password changed successfully.",
    },
  };
}
