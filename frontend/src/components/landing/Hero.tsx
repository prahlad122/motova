import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="overflow-hidden bg-[#16181d] pt-10 sm:pt-14 md:pt-20">
      <div
        className="
          mx-auto
          flex
          min-h-0
          w-full
          max-w-[1440px]
          flex-col
          items-center
          gap-3
          px-5
          text-center
          sm:gap-6
          sm:px-8
          md:px-12
          lg:min-h-[650px]
          lg:flex-row
          lg:gap-12
          lg:px-8
          lg:text-left
          xl:px-10
        "
      >
        {/* ================= CONTENT ================= */}
        <div
          className="
            z-10
            flex
            w-full
            max-w-[760px]
            flex-1
            flex-col
            gap-7
            lg:w-1/2
            lg:gap-10
          "
        >
          {/* Heading */}
          <h1
            className="
              mx-auto
              max-w-[650px]
              text-[42px]
              font-bold
              leading-[1.15]
              tracking-tight
              text-[#f9fafb]
              sm:text-5xl
              md:text-6xl
              lg:mx-0
              lg:text-[64px]
              xl:text-[80px]
            "
          >
            Lorem{" "}
            <span className="text-[#3b82f6]">
              ipsum
              <br className="hidden lg:block" />
              dolor
            </span>{" "}
            sit amet
          </h1>

          {/* Description */}
          <p
            className="
              mx-auto
              max-w-[600px]
              text-[16px]
              leading-[1.55]
              text-[#d6d7db]
              sm:text-lg
              md:text-[20px]
              lg:mx-0
              xl:text-[21px]
            "
          >
            Lorem ipsum dolor sit amet consectetur. Ut diam tortor urna et
            viverra vitae pellentesque adipiscing.
          </p>

          {/* Buttons */}
          <div
            className="
              flex
              w-full
              flex-col
              gap-4
              sm:mx-auto
              sm:max-w-[500px]
              lg:mx-0
              lg:max-w-none
              lg:flex-row
              lg:gap-4
            "
          >
            <Link
              href="/admin/login"
              className="
                inline-flex
                h-12
                w-full
                items-center
                justify-center
                rounded-md
                bg-[#f9fafb]
                px-6
                text-base
                font-medium
                text-[#0e0e10]
                transition
                hover:opacity-90
                lg:w-auto
                lg:min-w-[190px]
              "
            >
              Login as Admin
            </Link>

            <Link
              href="/vendor/login"
              className="
                inline-flex
                h-12
                w-full
                items-center
                justify-center
                rounded-md
                bg-[#f9fafb]
                px-6
                text-base
                font-medium
                text-[#0e0e10]
                transition
                hover:opacity-90
                lg:w-auto
                lg:min-w-[190px]
              "
            >
              Login as Vendor
            </Link>
          </div>

          {/* ================= MOBILE PHONE ================= */}
          <div
            className="
              relative
              mx-auto
              mt-0
              flex
              h-[500px]
              w-full
              items-start
              justify-center
              lg:hidden
            "
          >
            {/* Decorative Shape */}
            <Image
              src="/images/hero-shape-1.svg"
              alt=""
              width={100}
              height={100}
              className="
                absolute
                left-[0%]
                top-[32%]
                z-30
                h-[42px]
                w-[34px]
                sm:left-[3%]
                sm:h-[55px]
                sm:w-[44px]
              "
            />

            {/* Decorative Shape */}
            <Image
              src="/images/hero-shape-2.svg"
              alt=""
              width={100}
              height={100}
              className="
                absolute
                bottom-[3%]
                right-[1%]
                z-10
                h-[32px]
                w-[26px]
                sm:right-[3%]
                sm:h-[45px]
                sm:w-[36px]
              "
            />

            {/* Phone */}
            <div
              className="
                relative
                z-20
                h-[500px]
                w-[240px]
                overflow-hidden
                rounded-[30px]
                border-[6px]
                border-[#2d2d2d]
                bg-[#1a1a1a]
                shadow-[0_20px_40px_rgba(0,0,0,0.5)]

                sm:h-[560px]
                sm:w-[270px]
                sm:rounded-[34px]
                sm:border-[7px]
              "
            >
              <Image
                src="/images/feature-phone.png"
                alt="Feature phone"
                fill
                priority
                className="object-cover object-top"
                sizes="(max-width: 640px) 240px, 270px"
              />
            </div>
          </div>
        </div>

        {/* ================= DESKTOP VISUAL ================= */}
        <div
          className="
            relative
            hidden
            h-[650px]
            w-full
            flex-1
            lg:block
            lg:w-1/2
          "
        >
          <div
            className="
              relative
              mx-auto
              h-full
              w-full
              max-w-[620px]
            "
          >
            {/* Decorative Shape 1 */}
            <Image
              src="/images/hero-shape-1.svg"
              alt=""
              width={100}
              height={100}
              className="
                absolute
                left-[3%]
                top-[38%]
                z-30
                h-[80px]
                w-[64px]
              "
            />

            {/* Decorative Shape 2 */}
            <Image
              src="/images/hero-shape-2.svg"
              alt=""
              width={100}
              height={100}
              className="
                absolute
                bottom-[15%]
                right-[2%]
                z-10
                h-[60px]
                w-[48px]
              "
            />

            {/* Desktop Phone */}
            <div
              className="
                absolute
                left-[35%]
                top-1/2
                z-20
                h-[650px]
                w-[300px]
                -translate-y-1/2
                overflow-hidden
                rounded-[36px]
                border-[7px]
                border-[#2d2d2d]
                bg-[#1a1a1a]
                shadow-[0_20px_40px_rgba(0,0,0,0.5)]
              "
            >
              <Image
                src="/images/feature-phone.png"
                alt="Feature phone"
                width={365}
                height={500}
                className="h-full w-full object-cover object-top"
                sizes="300px"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
