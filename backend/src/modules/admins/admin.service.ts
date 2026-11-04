import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";

import { prisma } from "../../config/database.js";

import {
  Prisma,
  UserRole,
  UserStatus,
  VendorVerificationStatus,
} from "../../generated/prisma/client.js";

import type { CreateVendorInput } from "./admin.types.js";
import type { GetVendorsQuery } from "./admin.types.js";

export async function createVendorByAdmin(input: CreateVendorInput) {
  const {
    name,
    email,
    mobile,
    businessName,
    gstNumber,
    businessAddress,
    shippingAddress,
    storeManager,
    authorizedPerson,
  } = input;

  // Normalize input values
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedMobile = mobile.trim();
  const normalizedGst = gstNumber?.trim().toUpperCase() || null;

  // Validate required fields
  if (
    !name.trim() ||
    !normalizedEmail ||
    !normalizedMobile ||
    !businessName.trim() ||
    !businessAddress.trim()
  ) {
    throw Object.assign(
      new Error("Please provide all required vendor details."),
      { statusCode: 400 },
    );
  }

  // Check duplicate email or mobile
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: normalizedEmail }, { mobile: normalizedMobile }],
    },
    select: {
      id: true,
      email: true,
      mobile: true,
    },
  });

  if (existingUser) {
    throw Object.assign(
      new Error("A user with this email or mobile number already exists."),
      { statusCode: 409 },
    );
  }

  // Check duplicate GST number
  if (normalizedGst) {
    const existingVendor = await prisma.vendorProfile.findUnique({
      where: {
        gstNumber: normalizedGst,
      },
      select: {
        id: true,
      },
    });

    if (existingVendor) {
      throw Object.assign(
        new Error("A vendor with this GST number already exists."),
        { statusCode: 409 },
      );
    }
  }

  // Generate temporary password
  const temporaryPassword = `${randomBytes(18).toString("base64url")}A1!`;

  const passwordHash = await bcrypt.hash(temporaryPassword, 12);

  try {
    // Create user and vendor profile together
    const vendor = await prisma.$transaction(async (tx) => {
      return tx.user.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          mobile: normalizedMobile,
          passwordHash,
          role: UserRole.VENDOR,
          status: UserStatus.PENDING,
          mustChangePassword: false,

          vendorProfile: {
            create: {
              businessName: businessName.trim(),
              gstNumber: normalizedGst,
              businessAddress: businessAddress.trim(),
              shippingAddress: shippingAddress?.trim() || null,
              storeManager: storeManager?.trim() || null,
              authorizedPerson: authorizedPerson?.trim() || null,

              mobileVerified: false,
              verificationStatus: VendorVerificationStatus.NOT_SUBMITTED,
            },
          },
        },

        select: {
          id: true,
          name: true,
          email: true,
          mobile: true,
          role: true,
          status: true,
          mustChangePassword: true,
          createdAt: true,

          vendorProfile: {
            select: {
              id: true,
              businessName: true,
              gstNumber: true,
              mobileVerified: true,
              verificationStatus: true,
            },
          },
        },
      });
    });

    // Return temporary password only once to the admin
    return {
      vendor,
      temporaryPassword,
    };
  } catch (error) {
    // Handle unique constraint conflicts
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      throw Object.assign(
        new Error("Email, mobile number, or GST number already exists."),
        { statusCode: 409 },
      );
    }

    throw error;
  }
}

// Get all vendors with search, filters and pagination
export async function getAdminVendors(query: GetVendorsQuery) {
  const { search, status, verificationStatus, page, limit } = query;

  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = {
    role: UserRole.VENDOR,

    ...(status && {
      status: status as UserStatus,
    }),

    ...(verificationStatus && {
      vendorProfile: {
        is: {
          verificationStatus: verificationStatus as VendorVerificationStatus,
        },
      },
    }),

    ...(search && {
      OR: [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          mobile: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          vendorProfile: {
            is: {
              businessName: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        },
      ],
    }),
  };

  const [vendors, totalVendors] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        status: true,
        createdAt: true,

        vendorProfile: {
          select: {
            id: true,
            businessName: true,
            gstNumber: true,
            mobileVerified: true,
            verificationStatus: true,
          },
        },
      },
    }),

    prisma.user.count({ where }),
  ]);

  return {
    vendors,
    pagination: {
      currentPage: page,
      pageSize: limit,
      totalVendors,
      totalPages: Math.ceil(totalVendors / limit),
      hasNextPage: page * limit < totalVendors,
      hasPreviousPage: page > 1,
    },
  };
}


//Get a indivisual vendor details 

export async function getAdminVendorById(vendorId: string) {
  const vendor = await prisma.user.findFirst({
    where: {
      id: vendorId,
      role: UserRole.VENDOR,
    },
    select: {
      id: true,
      name: true,
      email: true,
      mobile: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,

      vendorProfile: {
        select: {
          id: true,
          businessName: true,
          gstNumber: true,
          businessAddress: true,
          shippingAddress: true,
          storeManager: true,
          authorizedPerson: true,
          mobileVerified: true,
          verificationStatus: true,
          verificationNote: true,
          verifiedAt: true,
          documents: {
            select: {
              id: true,
              type: true,
              fileName: true,
              mimeType: true,
              fileSize: true,
              status: true,
              rejectionReason: true,
              submittedAt: true,
            },
            orderBy: { submittedAt: "desc" },
          },
        },
      },
    },
  });

  return vendor;
}

//Update vendor account status

export async function updateAdminVendorStatus(
  vendorId: string,
  status: "ACTIVE" | "SUSPENDED",
) {
  const updateResult = await prisma.user.updateMany({
    where: {
      id: vendorId,
      role: UserRole.VENDOR,
    },
    data: {
      status,
    },
  });

  if (updateResult.count === 0) {
    return null;
  }

  return prisma.user.findFirst({
    where: {
      id: vendorId,
      role: UserRole.VENDOR,
    },
    select: {
      id: true,
      name: true,
      email: true,
      mobile: true,
      role: true,
      status: true,
      updatedAt: true,
      vendorProfile: {
        select: {
          businessName: true,
          verificationStatus: true,
        },
      },
    },
  });
}
