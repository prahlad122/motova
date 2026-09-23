"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

import { vendorLogin } from "../auth.api";
import {
  getAuthErrorMessage,
  getDashboardPath,
  saveAuthSession,
} from "../auth.utils";

import { Eye, EyeOff } from "lucide-react";

export default function VendorLoginForm() {
  return <LoginForm submit={vendorLogin} registerLink />;
}

type LoginFormProps = {
  submit: typeof vendorLogin;
  registerLink?: boolean;
};

function LoginForm({ submit, registerLink = false }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      const response = await submit({
        email,
        password,
      });

      saveAuthSession(response);

      window.location.assign(getDashboardPath(response.user.role));
    } catch (submissionError) {
      setError(getAuthErrorMessage(submissionError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="
        mx-auto
        flex
        w-full
        max-w-[420px]
        flex-col
        text-center
      "
    >
      {/* =========================================
          SOCIAL LOGIN
      ========================================== */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
        {/* Apple */}
        <button
          type="button"
          className="
            flex
            h-[48px]
            w-full
            items-center
            justify-center
            gap-3
            rounded-[9px]
            border
            border-[#d9dce1]
            bg-white
            px-3
            text-[15px]
            font-medium
            text-[#080808]
            transition
            hover:bg-[#f8f8f8]
            active:scale-[0.99]
            sm:text-[16px]
          "
        >
          <span className="text-[20px] leading-none"></span>

          <span>Login with Apple</span>
        </button>

        {/* Google */}
        <button
          type="button"
          className="
            flex
            h-[48px]
            w-full
            items-center
            justify-center
            gap-3
            rounded-[9px]
            border
            border-[#d9dce1]
            bg-white
            px-3
            text-[15px]
            font-medium
            text-[#080808]
            transition
            hover:bg-[#f8f8f8]
            active:scale-[0.99]
            sm:text-[16px]
          "
        >
          <span className="text-[20px] font-bold">G</span>

          <span>Google</span>
        </button>
      </div>

      {/* =========================================
          DIVIDER
      ========================================== */}
      <div className="my-6 flex items-center gap-3 sm:my-7">
        <div className="h-px flex-1 bg-[#d9dce1]" />

        <span className="shrink-0 text-[12px] font-normal text-[#667085] sm:text-[14px]">
          OR CONTINUE WITH
        </span>

        <div className="h-px flex-1 bg-[#d9dce1]" />
      </div>

      {/* =========================================
          ERROR
      ========================================== */}
      {error && (
        <p
          role="alert"
          className="
            mb-5
            rounded-lg
            border
            border-red-200
            bg-red-50
            px-4
            py-3
            text-center
            text-sm
            leading-5
            text-red-600
          "
        >
          {error}
        </p>
      )}

      {/* =========================================
          EMAIL
      ========================================== */}
      <div
        className="
          mb-5
          text-left
          [&_label]:text-left
          [&_input]:bg-white
        "
      >
        <Input
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
          placeholder="m@example.com"
        />
      </div>

      {/* =========================================
          PASSWORD
      ========================================== */}
      <div
        className="
          mb-6
          text-left
          [&_label]:text-left
          [&_input]:bg-white
        "
      >
        <div className="relative">
          <Input
            id="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
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
      </div>

      {/* =========================================
          LOGIN BUTTON
      ========================================== */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="
          h-[48px]
          w-full
          rounded-[9px]
          bg-[#17181c]
          text-[15px]
          font-semibold
          text-white
          transition
          hover:bg-[#25262b]
          active:scale-[0.995]
          disabled:cursor-not-allowed
          disabled:opacity-60
          sm:text-[16px]
        "
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>

      {/* =========================================
          REGISTER LINK
      ========================================== */}
      {registerLink && (
        <p className="mt-5 text-center text-[15px] text-[#667085] sm:text-[16px]">
          Don&apos;t have an account?{" "}
          <Link
            href="/vendor/register"
            className="
              font-medium
              text-[#315cff]
              transition
              hover:underline
            "
          >
            Sign up
          </Link>
        </p>
      )}
    </form>
  );
}