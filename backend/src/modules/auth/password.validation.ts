
import { z } from "zod";

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Current password is required."),

    newPassword: z
      .string()
      .min(8, "Password must contain at least 8 characters.")
      .max(128, "Password cannot exceed 128 characters.")
      .regex(/[A-Z]/, "Password must contain an uppercase letter.")
      .regex(/[a-z]/, "Password must contain a lowercase letter.")
      .regex(/[0-9]/, "Password must contain a number.")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain a special character.",
      ),

    confirmPassword: z
      .string()
      .min(1, "Please confirm your new password."),
  })
  .refine(
    (data) => data.newPassword === data.confirmPassword,
    {
      message: "New password and confirm password do not match.",
      path: ["confirmPassword"],
    },
  )
  .refine(
    (data) => data.currentPassword !== data.newPassword,
    {
      message: "New password must be different from current password.",
      path: ["newPassword"],
    },
  );

export type ChangePasswordInput = z.infer<
  typeof changePasswordSchema
>;
