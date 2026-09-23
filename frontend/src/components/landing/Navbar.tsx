import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="bg-[#16181d] py-5">
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-5 md:px-[55px]">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo.svg"
            alt="Motova"
            width={130}
            height={40}
            priority
          />
        </Link>

        {/* Desktop actions */}
        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/admin/login"
            className="inline-flex items-center justify-center gap-2 rounded bg-[#f9fafb] px-6 py-3 text-base font-medium text-[#0e0e10] transition hover:opacity-90"
          >
            Login as Admin
          </Link>

          <Link
            href="/vendor/login"
            className="inline-flex items-center justify-center gap-2 rounded bg-[#f9fafb] px-6 py-3 text-base font-medium text-[#0e0e10] transition hover:opacity-90"
          >
            Login as Vendor
          </Link>
        </div>

      </div>
    </header>
  );
}