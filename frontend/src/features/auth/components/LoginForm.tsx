"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

import { adminLogin, vendorLogin } from "../auth.api";
import {
  getAuthErrorMessage,
  getDashboardPath,
  saveAuthSession,
} from "../auth.utils";

export default function LoginForm() {
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
      let response;

      /*
       * First try ADMIN login.
       * If the credentials are not admin credentials,
       * try VENDOR login.
       */
      try {
        response = await adminLogin({
          email,
          password,
        });
      } catch {
        response = await vendorLogin({
          email,
          password,
        });
      }

      /*
       * Save authenticated user/session
       */
      saveAuthSession(response);

      /*
       * Redirect according to the role returned
       * by the backend.
       */
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
      {/* ================= ERROR ================= */}
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

      {/* ================= EMAIL ================= */}
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

      {/* ================= PASSWORD ================= */}
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

          {/* Show / Hide Password */}
          <button
            type="button"
            onClick={() => setShowPassword((previous) => !previous)}
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

      {/* ================= LOGIN BUTTON ================= */}
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

      {/* ================= VENDOR REGISTER ================= */}
      <p
        className="
          mt-5
          text-center
          text-[15px]
          text-[#667085]
          sm:text-[16px]
        "
      >
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
    </form>
  );
}
