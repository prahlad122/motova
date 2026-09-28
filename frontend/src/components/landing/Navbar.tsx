import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="bg-[#16181d] py-4">
<div className="mx-auto  flex w-full max-w-[1440px] items-center justify-between px-5 sm:px-8 md:px-12 lg:px-8 xl:px-10">        {/* ================= LOGO ================= */}

        <Link
          href="/"
          className="flex items-center"
          aria-label="Motova home"
        >
          <Image
            src="/images/logo.svg"
            alt="Motova"
            width={163}
            height={13}
            priority
            className="h-auto w-[163px]"
          />
        </Link>

        {/* ================= LOGIN ================= */}

        <div className="hidden items-center md:flex">
          <Link
            href="/login"
            className="
              inline-flex
              h-12
              w-[180px]
              items-center
              justify-center
              gap-2
              rounded-md
              bg-[#f9fafb]
              px-4
              text-base
              font-medium
              text-[#0e0e10]
              transition
              hover:bg-white
              hover:opacity-90
            "
          >
            <Image
              src="/images/store.svg"
              alt=""
              width={16}
              height={16}
              className="h-[16px] w-[16px] shrink-0 object-contain"
            />

            <span className="font-semibold">Join here</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
