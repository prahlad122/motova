import Image from "next/image";
import Link from "next/link";

import VendorLoginForm from "@/features/auth/components/VendorLoginForm";

export default function VendorLoginPage() {
  return (
    <main className="min-h-screen bg-[#16181d] px-4 py-8 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[500px] flex-col items-center justify-center">
        {/* =========================
            LOGO
        ========================== */}
        <Link
          href="/"
          className="mb-7 flex items-center justify-center sm:mb-8"
        >
          <Image
            src="/images/logo.svg"
            alt="Motova"
            width={250}
            height={50}
            priority
            className="h-auto w-[190px] sm:w-[220px] md:w-[250px]"
          />
        </Link>

        {/* =========================
            LOGIN CARD
        ========================== */}
        <div
          className="
            w-full
            max-w-[480px]
            rounded-[10px]
            bg-white
            px-5
            py-6
            shadow-[0_10px_30px_rgba(0,0,0,0.12)]
            sm:px-7
            sm:py-7
          "
        >
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-[27px] font-semibold leading-[1.2] tracking-[-0.5px] text-[#050505] sm:text-[29px]">
              Welcome back!
            </h1>

            <p className="mt-1 text-[15px] leading-6 text-[#667085] sm:text-[16px]">
              Login with your Apple or Google account
            </p>
          </div>

          <VendorLoginForm />
        </div>

        {/* =========================
            TERMS
        ========================== */}
        <p className="mt-8 max-w-[380px] px-4 text-center text-[13px] leading-5 text-[#98a2b3] sm:mt-9 sm:text-[14px]">
          By clicking continue, you agree to our{" "}
          <Link
            href="#"
            className="underline underline-offset-2 transition hover:text-white"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="#"
            className="underline underline-offset-2 transition hover:text-white"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </main>
  );
}