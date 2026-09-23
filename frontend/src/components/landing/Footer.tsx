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
    <footer className="bg-[#16181d] pt-16">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col px-5 md:px-[55px]">
        <div className="mb-16 flex flex-wrap justify-between gap-10">
          {columns.map((column) => (
            <div
              key={column.title}
              className="flex min-w-[180px] flex-col gap-6"
            >
              <h4 className="text-lg font-semibold text-[#f3f4f6]">
                {column.title}
              </h4>

              <ul className="flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-base text-[#e5e7eb] transition hover:text-[#3b82f6]"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* App */}
          <div className="flex min-w-[180px] flex-col gap-6">
            <h4 className="text-lg font-semibold text-[#f3f4f6]">
              Install App
            </h4>

            <div className="flex flex-col gap-4">
              <Link
                href="#"
                className="flex h-12 w-[162px] items-center justify-center rounded-lg bg-black text-sm font-medium text-white"
              >
                Google Play
              </Link>

              <Link
                href="#"
                className="flex h-12 w-[162px] items-center justify-center rounded-lg bg-black text-sm font-medium text-white"
              >
                App Store
              </Link>
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-white/20" />
      </div>
    </footer>
  );
}