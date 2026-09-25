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
    <section className="bg-[#16181d] py-16 sm:py-20 lg:py-[90px]">
      <div
        className="
          mx-auto
          flex
          w-full
          max-w-[1280px]
          flex-col
          items-center
          gap-12
          px-5
          sm:px-8
          lg:flex-row
          lg:items-center
          lg:gap-[70px]
          lg:px-[55px]
        "
      >
        {/* ================= LEFT VISUAL ================= */}
<div className="flex w-full flex-1 justify-center lg:justify-start">
  <div
    className="
      relative
      flex
      h-[390px]
      w-full
      max-w-[500px]
      items-center
      justify-center

      sm:h-[470px]

      lg:h-[500px]
      lg:max-w-[500px]
    "
  >
    {/* ================= CIRCLE + SHAPES ================= */}
    <div
  className="
    relative
    h-[90vw]
    w-[90vw]
    max-h-[400px]
    max-w-[400px]

    sm:h-[370px]
    sm:w-[370px]

    lg:h-[400px]
    lg:w-[400px]
  "
>
      {/* Background Circle */}
      <Image
        src="/images/features-circle.svg"
        alt=""
        fill
        className="object-contain"
      />

      {/* ================= STAR 1 ================= */}
      <Image
        src="/images/hero-shape-1.svg"
        alt=""
        width={100}
        height={122}
        className="
          absolute
          left-[-30px]
          top-[95px]
          z-20
          h-[75px]
          w-[62px]

          sm:left-[-40px]
          sm:top-[115px]
          sm:h-[95px]
          sm:w-[78px]

          lg:left-[-50px]
          lg:top-[125px]
          lg:h-[122px]
          lg:w-[100px]
        "
      />

     {/* ================= STAR 2 ================= */}
<Image
  src="/images/hero-shape-2.svg"
  alt=""
  width={55}
  height={68}
  className="
    absolute
    right-[25px]
    bottom-[22%]
    z-20
    h-[45px]
    w-[36px]

    sm:right-[5px]
    sm:bottom-[65px]
    sm:h-[55px]
    sm:w-[45px]

    lg:right-[5px]
    lg:bottom-[70px]
    lg:h-[68px]
    lg:w-[55px]
  "
/>
    </div>

    {/* ================= PHONE ================= */}
   {/* ================= PHONE ================= */}
<div
  className="
    absolute
    z-30

    h-[390px]
    w-[205px]

    overflow-hidden
    rounded-[30px]
    border-[6px]
    border-[#2d2d2d]
    bg-[#1a1a1a]
    shadow-[0_20px_40px_rgba(0,0,0,0.35)]

    sm:h-[440px]
    sm:w-[230px]
    sm:rounded-[32px]
    sm:border-[7px]

    lg:h-[500px]
    lg:w-[260px]
    lg:rounded-[36px]
  "
>
  <Image
    src="/images/cta-phone-back.png"
    alt="Motova features"
    fill
    className="object-cover"
    sizes="
      (max-width: 639px) 205px,
      (max-width: 1023px) 230px,
      260px
    "
  />
</div>
  </div>
</div>
        {/* ================= RIGHT CONTENT ================= */}
        <div
          className="
            flex
            w-full
            flex-1
            flex-col
            gap-8

            sm:gap-10

            lg:max-w-[560px]
            lg:gap-9
          "
        >
          {/* Heading */}
          <div className="flex flex-col gap-4 text-center lg:text-left">
            <h2
              className="
                text-[30px]
                font-bold
                leading-[1.15]
                tracking-[-0.8px]
                text-[#f9fafb]

                sm:text-[34px]

                lg:text-[38px]
              "
            >
              Our features
            </h2>

            <p
              className="
                mx-auto
                max-w-[520px]
                text-[15px]
                leading-[1.55]
                text-[#d6d7db]

                sm:text-[16px]

                lg:mx-0
                lg:text-[16px]
              "
            >
              Few good reasons why you should use Motova to
              make your experience easier and better.
            </p>
          </div>

          {/* Feature Cards */}
          <div
            className="
              grid
              grid-cols-1
              gap-4

              sm:grid-cols-2
              sm:gap-4
            "
          >
            {features.map((feature) => (
              <div
                key={feature.title}
                className="
                  flex
                  min-h-[62px]
                  items-center
                  gap-4
                  rounded-[6px]
                  bg-[#e9edf2]
                  px-4
                  py-3

                  sm:min-h-[62px]
                  sm:px-4

                  lg:min-h-[62px]
                "
              >
                {/* Icon */}
                <div
                  className="
                    flex
                    h-[36px]
                    w-[36px]
                    shrink-0
                    items-center
                    justify-center
                    rounded-[4px]
                    bg-[#17191d]
                  "
                >
                  <Image
                    src={feature.icon}
                    alt=""
                    width={20}
                    height={20}
                    className="h-5 w-5"
                  />
                </div>

                {/* Title */}
                <h3
                  className="
                    text-[14px]
                    font-medium
                    leading-none
                    text-[#3d4147]

                    sm:text-[15px]
                  "
                >
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