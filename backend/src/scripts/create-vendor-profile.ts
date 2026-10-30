
import { prisma } from "../config/database.js";
import { UserRole, VendorVerificationStatus } from "../generated/prisma/client.js";

async function main() {
  const email = "khali123@gmail.com";

  // Find the existing vendor account
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      mobile: true,
    },
  });

  if (!user) {
    throw new Error(`User not found: ${email}`);
  }

  if (user.role !== UserRole.VENDOR) {
    throw new Error("This account does not have the VENDOR role.");
  }

  // Reuse an existing profile if one already exists
  const existingProfile = await prisma.vendorProfile.findUnique({
    where: { userId: user.id },
  });

  if (existingProfile) {
    console.log("Vendor profile already exists:", existingProfile.id);
    return;
  }

  // Create a profile linked to the existing user
  const profile = await prisma.vendorProfile.create({
    data: {
      userId: user.id,
      businessName: "Khali Store",
      businessEmail: user.email,
      businessPhone: user.mobile,
      country: "India",
      verificationStatus: VendorVerificationStatus.NOT_SUBMITTED,
    },
  });

  console.log("Vendor profile created successfully:", profile.id);
}

main()
  .catch((error) => {
    console.error("Failed to create vendor profile:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
