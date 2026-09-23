"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

import { adminLogin } from "../auth.api";
import {
  getAuthErrorMessage,
  getDashboardPath,
  saveAuthSession,
} from "../auth.utils";

export default function AdminLoginForm() {
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
      const response = await adminLogin({ email, password });

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
        id="email"
        label="Email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
        autoComplete="email"
      />

      {/* Password */}
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
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}