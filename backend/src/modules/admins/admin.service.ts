
import { prisma } from "../../config/database.js";
import {
  UserRole,
  UserStatus,
} from "../../generated/prisma/client.js";

export async function getAdminDashboardStats() {
  const now = new Date();

  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    totalVendors,
    activeVendors,
    pendingVendors,
    suspendedVendors,
    newVendorsThisWeek,
  ] = await Promise.all([
    prisma.user.count({
      where: {
        role: UserRole.VENDOR,
      },
    }),

    prisma.user.count({
      where: {
        role: UserRole.VENDOR,
        status: UserStatus.ACTIVE,
      },
    }),

    prisma.user.count({
      where: {
        role: UserRole.VENDOR,
        status: UserStatus.PENDING,
      },
    }),

    prisma.user.count({
      where: {
        role: UserRole.VENDOR,
        status: UserStatus.SUSPENDED,
      },
    }),

    prisma.user.count({
      where: {
        role: UserRole.VENDOR,
        createdAt: {
          gte: sevenDaysAgo,
          lte: now,
        },
      },
    }),
  ]);

  return {
    vendors: {
      total: totalVendors,
      active: activeVendors,
      pending: pendingVendors,
      suspended: suspendedVendors,
      newThisWeek: newVendorsThisWeek,
    },
  };
}
