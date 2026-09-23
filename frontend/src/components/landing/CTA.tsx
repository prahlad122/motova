import Image from "next/image";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="overflow-hidden bg-[#16181d]">
      <div className="mx-auto w-full max-w-[1440px]">
        {/* =====================================================
            DESKTOP
        ====================================================== */}
        <div
          className="
            relative
            hidden
            min-h-[640px]
            overflow-hidden
            lg:flex
            lg:flex-row
            lg:items-center
            lg:px-[70px]
            xl:min-h-[700px]
            xl:px-[80px]
          "
        >
          {/* ================= LEFT CONTENT ================= */}

          <div
            className="
              relative
              z-30
              flex
              w-1/2
              max-w-[680px]
              flex-col
              justify-center
              gap-14
            "
          >
            {/* Heading + Description */}
            <div className="flex flex-col gap-2">
              <h2
                className="
                  text-[42px]
                  font-bold
                  leading-[1.2]
                  tracking-[-1px]
                  text-[#f9fafb]
                  xl:text-[52px]
                "
              >
                Lorem ipsum dolor sit amet
              </h2>

              <p
                className="
                  max-w-[650px]
                  text-[18px]
                  leading-[1.55]
                  text-[#d6d7db]
                  xl:text-[21px]
                "
              >
                Lorem ipsum dolor sit amet consectetur. Odio diam nulla tortor
                ornare ultricies egestas tincidunt imperdiet. Purus scelerisque
                purus pharetra morbi at massa. Eleifend pretium mauris sit duis
                sapien.
              </p>
            </div>

            {/* ================= GET APP ================= */}

            <div className="flex flex-col gap-4">
              <h4 className="text-2xl font-semibold text-[#f9fafb]">
                Get the App
              </h4>

              <div className="flex gap-4">
                {/* Google Play */}
                <Link
                  href="#"
                  className="
                    flex
                    h-[50px]
                    w-[170px]
                    items-center
                    gap-3
                    rounded-lg
                    border
                    border-white/80
                    bg-black
                    px-3
                    text-white
                    transition
                    hover:bg-[#22252c]
                  "
                >
                  <span className="text-2xl leading-none text-[#55b8ff]">
                    ▶
                  </span>

                  <span className="flex flex-col leading-none">
                    <span className="text-[9px] uppercase tracking-wide">
                      Get it on
                    </span>

                    <span className="mt-1 text-lg font-medium">
                      Google Play
                    </span>
                  </span>
                </Link>

                {/* App Store */}
                <Link
                  href="#"
                  className="
                    flex
                    h-[50px]
                    w-[170px]
                    items-center
                    gap-3
                    rounded-lg
                    border
                    border-white/80
                    bg-black
                    px-3
                    text-white
                    transition
                    hover:bg-[#22252c]
                  "
                >
                  <span className="text-3xl leading-none">●</span>

                  <span className="flex flex-col leading-none">
                    <span className="text-[9px] tracking-wide">
                      Download on the
                    </span>

                    <span className="mt-1 text-lg font-medium">App Store</span>
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* =====================================================
              DESKTOP PHONES
          ====================================================== */}

          <div className="absolute inset-0">
            {/* BACK PHONE */}
            <div
              className="
                absolute
                right-[24%]
                top-[-105px]
                z-10
                h-[540px]
                w-[270px]
                xl:right-[23%]
                xl:h-[580px]
                xl:w-[290px]
              "
            >
              <div
                className="
                  relative
                  h-full
                  w-full
                  overflow-hidden
                  rounded-[32px]
                  border-[6px]
                  border-[#2d2d2d]
                  bg-[#1a1a1a]
                  shadow-2xl
                "
              >
                <Image
                  src="/images/service-5.png"
                  alt="Motova car details application screen"
                  fill
                  className="object-cover"
                  sizes="290px"
                />
              </div>
            </div>

            {/* FRONT PHONE */}
            <div
              className="
                absolute
                bottom-[-170px]
                right-[1%]
                z-20
                h-[540px]
                w-[270px]
                xl:right-[0%]
                xl:h-[580px]
                xl:w-[290px]
              "
            >
              <div
                className="
                  relative
                  h-full
                  w-full
                  overflow-hidden
                  rounded-[32px]
                  border-[6px]
                  border-[#2d2d2d]
                  bg-[#1a1a1a]
                  shadow-2xl
                "
              >
                <Image
                  src="/images/service-6.png"
                  alt="Motova mobile application home screen"
                  fill
                  className="object-cover"
                  sizes="290px"
                />
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            MOBILE / TABLET
        ====================================================== */}

        <div
          className="
    relative
    min-h-[850px]
    overflow-hidden
    px-6
    pt-8
    sm:min-h-[930px]
    sm:px-8
    sm:pt-10
    md:min-h-[1000px]
    md:px-10
    lg:hidden
  "
        >
          {/* ================= GET APP ================= */}

          <div className="relative z-40">
            <h4
              className="
                text-[23px]
                font-semibold
                leading-tight
                text-[#f9fafb]
                sm:text-[25px]
              "
            >
              Get the App
            </h4>

            <div
              className="
                mt-5
                flex
                flex-wrap
                gap-3
                sm:gap-4
              "
            >
              {/* Google Play */}
              <Link
                href="#"
                className="
                  flex
                  h-[50px]
                  w-[169px]
                  shrink-0
                  items-center
                  gap-3
                  rounded-lg
                  border
                  border-white/80
                  bg-black
                  px-3
                  text-white
                  transition
                  hover:bg-[#22252c]
                "
              >
                <span className="text-2xl leading-none text-[#55b8ff]">▶</span>

                <span className="flex flex-col leading-none">
                  <span className="text-[8px] uppercase tracking-wide">
                    Get it on
                  </span>

                  <span className="mt-1 text-[17px] font-medium">
                    Google Play
                  </span>
                </span>
              </Link>

              {/* App Store */}
              <Link
                href="#"
                className="
                  flex
                  h-[50px]
                  w-[169px]
                  shrink-0
                  items-center
                  gap-3
                  rounded-lg
                  border
                  border-white/80
                  bg-black
                  px-3
                  text-white
                  transition
                  hover:bg-[#22252c]
                "
              >
                <span className="text-3xl leading-none">●</span>

                <span className="flex flex-col leading-none">
                  <span className="text-[8px] tracking-wide">
                    Download on the
                  </span>

                  <span className="mt-1 text-[17px] font-medium">
                    App Store
                  </span>
                </span>
              </Link>
            </div>
          </div>

          {/* =====================================================
              MOBILE PHONE AREA
          ====================================================== */}

          <div className="absolute inset-x-0 top-[155px] bottom-0">
            {/* =================================================
                BACK PHONE
                Partially outside left side
            ================================================== */}

            <div
              className="
                absolute
                left-[-125px]
                top-[5px]
                z-10
                h-[580px]
                w-[290px]
                sm:left-[-105px]
                sm:top-[10px]
                sm:h-[650px]
                sm:w-[325px]
                md:left-[-80px]
                md:h-[700px]
                md:w-[350px]
              "
            >
              <div
                className="
                  relative
                  h-full
                  w-full
                  overflow-hidden
                  rounded-[32px]
                  border-[6px]
                  border-[#2d2d2d]
                  bg-[#1a1a1a]
                  shadow-2xl
                "
              >
                <Image
                  src="/images/service-5.png"
                  alt="Motova car details application screen"
                  fill
                  className="object-cover"
                  sizes="
                    (max-width: 640px) 290px,
                    (max-width: 768px) 325px,
                    350px
                  "
                />
              </div>
            </div>

            {/* =================================================
                FRONT PHONE
                Lower right with clear space between phones
            ================================================== */}

            <div
              className="
                absolute
                right-[-105px]
                top-[375px]
                z-20
                h-[580px]
                w-[290px]
                sm:right-[-85px]
                sm:top-[425px]
                sm:h-[650px]
                sm:w-[325px]
                md:right-[-60px]
                md:top-[470px]
                md:h-[700px]
                md:w-[350px]
              "
            >
              <div
                className="
                  relative
                  h-full
                  w-full
                  overflow-hidden
                  rounded-[32px]
                  border-[6px]
                  border-[#2d2d2d]
                  bg-[#1a1a1a]
                  shadow-2xl
                "
              >
                <Image
                  src="/images/service-6.png"
                  alt="Motova mobile application home screen"
                  fill
                  className="object-cover"
                  sizes="
                    (max-width: 640px) 290px,
                    (max-width: 768px) 325px,
                    350px
                  "
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
