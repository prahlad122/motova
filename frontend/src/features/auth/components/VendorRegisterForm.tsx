"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

import { vendorRegister } from "../auth.api";
import {
  getAuthErrorMessage,
  getDashboardPath,
  saveAuthSession,
} from "../auth.utils";

export default function VendorRegisterForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function validatePassword(password: string) {
    if (password.length < 8) {
      return "Password must be at least 8 characters long.";
    }

    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one capital letter.";
    }

    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number.";
    }

    if (!/[!@#$%^&*(),.?":{}|<>_\-\\[\]/`~'+;=]/.test(password)) {
      return "Password must contain at least one special character.";
    }

    return "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    // Validate password before sending request
    const passwordError = validatePassword(form.password);

    if (passwordError) {
      setError(passwordError);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await vendorRegister(form);

      saveAuthSession(response);

      window.location.assign(getDashboardPath(response.user.role));
    } catch (submissionError) {
      setError(getAuthErrorMessage(submissionError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input
        id="name"
        label="Full name"
        value={form.name}
        onChange={(event) => updateField("name", event.target.value)}
        required
        autoComplete="name"
      />

      <Input
        id="email"
        label="Email"
        type="email"
        value={form.email}
        onChange={(event) => updateField("email", event.target.value)}
        required
        autoComplete="email"
      />

      <Input
        id="mobile"
        label="Mobile number"
        type="tel"
        value={form.mobile}
        onChange={(event) => updateField("mobile", event.target.value)}
        required
        autoComplete="tel"
      />

      {/* Password */}
      <div className="relative">
        <Input
          id="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          value={form.password}
          onChange={(event) => updateField("password", event.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="
            absolute
            right-3
            top-[38px]
            flex
            h-6
            w-6
            items-center
            justify-center
            text-[#667085]
            transition
            hover:text-[#17181c]
          "
        >
          {showPassword ? (
            <EyeOff size={18} strokeWidth={1.8} />
          ) : (
            <Eye size={18} strokeWidth={1.8} />
          )}
        </button>
      </div>
      {error && (
        <p
          role="alert"
          className="
            rounded-lg
            border
            border-red-200
            bg-red-50
            px-4
            py-3
            text-sm
            leading-5
            text-red-600
          "
        >
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="
          h-12
          rounded-[9px]
          bg-[#17181c]
          text-[16px]
          font-semibold
          hover:bg-[#25262b]
        "
      >
        {isSubmitting ? "Creating account..." : "Create account"}
      </Button>

      <p className="text-center text-[16px] text-[#667085]">
        Already have an account?{" "}
        <Link href="/vendor/login" className="text-[#315cff] hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
