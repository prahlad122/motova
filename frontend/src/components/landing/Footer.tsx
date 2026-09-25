import Image from "next/image";
import Link from "next/link";

const columns = [
  {
    title: "Company",
    links: ["About Us", "Blog", "Careers", "Contact Us"],
  },
  {
    title: "Support",
    links: ["Help Center", "Safety Center", "Community Guidelines"],
  },
  {
    title: "Legal",
    links: [
      "Cookies Policy",
      "Privacy Policy",
      "Terms of Service",
      "Law Enforcement",
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#16181d] pt-12 sm:pt-14 lg:pt-16">
      <div
        className="
          mx-auto
          flex
          w-full
          max-w-[1280px]
          flex-col
          px-5
          sm:px-8
          md:px-[55px]
        "
      >
        {/* ================= FOOTER CONTENT ================= */}
        <div
          className="
            mb-12
            grid
            grid-cols-2
            gap-x-6
            gap-y-10

            sm:gap-x-10
            sm:gap-y-12

            lg:mb-16
            lg:grid-cols-4
            lg:gap-10
          "
        >
          {/* ================= COMPANY ================= */}
          {columns.map((column) => (
            <div
              key={column.title}
              className="
                flex
                min-w-0
                flex-col
                gap-5

                sm:gap-6
              "
            >
              <h4
                className="
                  text-base
                  font-semibold
                  text-[#f3f4f6]

                  sm:text-lg
                "
              >
                {column.title}
              </h4>

              <ul className="flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="
                        text-sm
                        leading-5
                        text-[#e5e7eb]
                        transition
                        hover:text-[#3b82f6]

                        sm:text-base
                      "
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* ================= INSTALL APP ================= */}
          <div
            className="
              flex
              min-w-0
              flex-col
              gap-5

              sm:gap-6
            "
          >
            <h4
              className="
                text-base
                font-semibold
                text-[#f3f4f6]

                sm:text-lg
                lg:text-[22px]
                lg:font-medium
              "
            >
              Install App
            </h4>

            <div
              className="
                flex
                flex-col
                gap-3

                sm:gap-4
              "
            >
              {/* Google Play */}
              <Link
                href="#"
                aria-label="Get it on Google Play"
                className="
                  block
                  h-[48px]
                  w-full
                  max-w-[160px]
                  overflow-hidden
                  rounded-[7px]
                  border
                  border-white
                  transition
                  hover:opacity-80

                  sm:h-[55px]
                  sm:max-w-[180px]

                  lg:h-[60px]
                  lg:max-w-[198px]
                "
              >
                <Image
                  src="/images/Store badge.svg"
                  alt="Get it on Google Play"
                  width={198}
                  height={60}
                  className="h-full w-full object-contain"
                />
              </Link>

              {/* App Store */}
              <Link
                href="#"
                aria-label="Download on the App Store"
                className="
                  block
                  h-[48px]
                  w-full
                  max-w-[160px]
                  overflow-hidden
                  rounded-[7px]
                  border
                  border-white
                  transition
                  hover:opacity-80

                  sm:h-[55px]
                  sm:max-w-[180px]

                  lg:h-[60px]
                  lg:max-w-[198px]
                "
              >
                <Image
                  src="/images/apple badge.svg"
                  alt="Download on the App Store"
                  width={198}
                  height={60}
                  className="h-full w-full object-contain"
                />
              </Link>
            </div>
          </div>
        </div>

        {/* ================= DIVIDER ================= */}
       
        
      </div>
    </footer>
  );
}
