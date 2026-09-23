import Image from "next/image";

const features = [
  {
    title: "Fast building",
    icon: "/images/feature-fast.svg",
  },
  {
    title: "Easy to edit",
    icon: "/images/feature-edit.svg",
  },
  {
    title: "Responsiveness",
    icon: "/images/feature-responsive.svg",
  },
  {
    title: "No code needed",
    icon: "/images/feature-code.svg",
  },
];

export default function Features() {
  return (
    <section className="bg-[#16181d] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center gap-12 px-5 sm:gap-16 md:px-[55px] lg:flex-row lg:gap-[60px]">
        {/* ================= VISUAL ================= */}
        <div className="flex w-full flex-1 justify-center">
          <div
            className="
              relative
              flex
              h-[390px]
              w-full
              max-w-[540px]
              items-center
              justify-center

              sm:h-[500px]
            "
          >
            {/* Circle */}
            <Image
              src="/images/features-circle.svg"
              alt=""
              width={378}
              height={378}
              className="
                absolute
                h-[280px]
                w-[280px]
                max-w-[80vw]

                sm:h-[400px]
                sm:w-[400px]
              "
            />

            {/* Star 1 - hidden on mobile */}
            <Image
              src="/images/feature-star-1.svg"
              alt=""
              width={100}
              height={122}
              className="
                absolute
                left-[2%]
                top-[125px]
                z-20
                hidden

                sm:block
                sm:left-2
                sm:top-[145px]
                sm:h-[122px]
                sm:w-[100px]
              "
            />

            {/* Star 2 - hidden on mobile */}
            <Image
              src="/images/feature-star-2.svg"
              alt=""
              width={55}
              height={68}
              className="
                absolute
                bottom-[70px]
                right-[2%]
                z-20
                hidden

                sm:block
                sm:bottom-[105px]
                sm:right-2
                sm:h-[68px]
                sm:w-[55px]
              "
            />

            {/* Phone */}
            <div
              className="
                relative
                z-10
                h-[360px]
                w-[188px]
                overflow-hidden
                rounded-[28px]
                border-[6px]
                border-[#2d2d2d]
                bg-[#1a1a1a]
                shadow-[0_20px_40px_rgba(0,0,0,0.3)]

                sm:h-[500px]
                sm:w-[260px]
                sm:rounded-[36px]
                sm:border-[7px]
              "
            >
              <Image
                src="/images/cta-phone-back.png"
                alt="Motova features"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 188px, 260px"
              />
            </div>
          </div>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="flex w-full flex-1 flex-col gap-10 sm:gap-12">
          <div className="flex flex-col gap-5 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-[#f9fafb] md:text-[40px]">
              Our features
            </h2>

            <p className="text-base leading-[1.5] text-[#d6d7db] md:text-lg">
              Few good reasons why you should use Motova to make your
              experience easier and better.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex items-center gap-5 rounded-xl bg-[#eaecf0] p-5"
              >
                <div className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-xl bg-[#3b82f6]">
                  <Image
                    src={feature.icon}
                    alt=""
                    width={24}
                    height={24}
                  />
                </div>

                <h3 className="text-base font-semibold text-[#2d2d2d]">
                  {feature.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}