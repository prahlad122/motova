// import Image from "next/image";
// import Link from "next/link";

// export default function CTA() {
//   return (
//     <section className="overflow-hidden bg-[#16181d]">
//       <div className="mx-auto w-full max-w-[1440px]">
//         {/* =====================================================
//             DESKTOP
//         ====================================================== */}
//         <div
//           className="
//             relative
//             hidden
//             min-h-[640px]
//             overflow-hidden
//             lg:flex
//             lg:flex-row
//             lg:items-center
//             lg:px-[70px]
//             xl:min-h-[700px]
//             xl:px-[80px]
//           "
//         >
//           {/* ================= LEFT CONTENT ================= */}

//           <div
//             className="
//               relative
//               z-30
//               flex
//               w-1/2
//               max-w-[680px]
//               flex-col
//               justify-center
//               gap-14
//             "
//           >
//             {/* Heading + Description */}
//             <div className="flex flex-col gap-2">
//               <h2
//                 className="
//                   text-[42px]
//                   font-bold
//                   leading-[1.2]
//                   tracking-[-1px]
//                   text-[#f9fafb]
//                   xl:text-[52px]
//                 "
//               >
//                 Lorem ipsum dolor sit amet
//               </h2>

//               <p
//                 className="
//                   max-w-[650px]
//                   text-[18px]
//                   leading-[1.55]
//                   text-[#d6d7db]
//                   xl:text-[21px]
//                 "
//               >
//                 Lorem ipsum dolor sit amet consectetur. Odio diam nulla tortor
//                 ornare ultricies egestas tincidunt imperdiet. Purus scelerisque
//                 purus pharetra morbi at massa. Eleifend pretium mauris sit duis
//                 sapien.
//               </p>
//             </div>

//             {/* ================= GET APP ================= */}

//             <div className="flex flex-col gap-4">
//               <h4 className="text-2xl font-semibold text-[#f9fafb]">
//                 Get the App
//               </h4>

//               <div className="flex gap-4">
//                 {/* Google Play */}
//                 <Link
//                   href="#"
//                   className="
//                     flex
//                     h-[50px]
//                     w-[170px]
//                     items-center
//                     gap-3
//                     rounded-lg
//                     border
//                     border-white/80
//                     bg-black
//                     px-3
//                     text-white
//                     transition
//                     hover:bg-[#22252c]
//                   "
//                 >
//                   <span className="text-2xl leading-none text-[#55b8ff]">
//                     ▶
//                   </span>

//                   <span className="flex flex-col leading-none">
//                     <span className="text-[9px] uppercase tracking-wide">
//                       Get it on
//                     </span>

//                     <span className="mt-1 text-lg font-medium">
//                       Google Play
//                     </span>
//                   </span>
//                 </Link>

//                 {/* App Store */}
//                 <Link
//                   href="#"
//                   className="
//                     flex
//                     h-[50px]
//                     w-[170px]
//                     items-center
//                     gap-3
//                     rounded-lg
//                     border
//                     border-white/80
//                     bg-black
//                     px-3
//                     text-white
//                     transition
//                     hover:bg-[#22252c]
//                   "
//                 >
//                   <span className="text-3xl leading-none">●</span>

//                   <span className="flex flex-col leading-none">
//                     <span className="text-[9px] tracking-wide">
//                       Download on the
//                     </span>

//                     <span className="mt-1 text-lg font-medium">App Store</span>
//                   </span>
//                 </Link>
//               </div>
//             </div>
//           </div>

//           {/* =====================================================
//               DESKTOP PHONES
//           ====================================================== */}

//           <div className="absolute inset-0">
//             {/* BACK PHONE */}
//             <div
//               className="
//                 absolute
//                 right-[24%]
//                 top-[-105px]
//                 z-10
//                 h-[540px]
//                 w-[270px]
//                 xl:right-[23%]
//                 xl:h-[580px]
//                 xl:w-[290px]
//               "
//             >
//               <div
//                 className="
//                   relative
//                   h-full
//                   w-full
//                   overflow-hidden
//                   rounded-[32px]
//                   border-[6px]
//                   border-[#2d2d2d]
//                   bg-[#1a1a1a]
//                   shadow-2xl
//                 "
//               >
//                 <Image
//                   src="/images/service-5.png"
//                   alt="Motova car details application screen"
//                   fill
//                   className="object-cover"
//                   sizes="290px"
//                 />
//               </div>
//             </div>

//             {/* FRONT PHONE */}
//             <div
//               className="
//                 absolute
//                 bottom-[-170px]
//                 right-[1%]
//                 z-20
//                 h-[540px]
//                 w-[270px]
//                 xl:right-[0%]
//                 xl:h-[580px]
//                 xl:w-[290px]
//               "
//             >
//               <div
//                 className="
//                   relative
//                   h-full
//                   w-full
//                   overflow-hidden
//                   rounded-[32px]
//                   border-[6px]
//                   border-[#2d2d2d]
//                   bg-[#1a1a1a]
//                   shadow-2xl
//                 "
//               >
//                 <Image
//                   src="/images/service-6.png"
//                   alt="Motova mobile application home screen"
//                   fill
//                   className="object-cover"
//                   sizes="290px"
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* =====================================================
//             MOBILE / TABLET
//         ====================================================== */}
//         {/* =====================================================
//             MOBILE / TABLET
//         ====================================================== */}

//         <div
//           className="
//             relative
//             min-h-[760px]
//             overflow-hidden
//             px-5
//             pt-8
//             sm:min-h-[850px]
//             sm:px-8
//             sm:pt-10
//             md:min-h-[920px]
//             md:px-10
//             lg:hidden
//           "
//         >
//           {/* ================= CONTENT ================= */}

//           <div className="relative z-40 w-full max-w-[680px]">
//             {/* Heading + Description */}

//             <div className="flex flex-col gap-3">
//               <h2
//                 className="
//                   max-w-[620px]
//                   text-[30px]
//                   font-bold
//                   leading-[1.15]
//                   tracking-[-0.6px]
//                   text-[#f9fafb]
//                   sm:text-[36px]
//                   sm:leading-[1.2]
//                   md:text-[42px]
//                 "
//               >
//                 Lorem ipsum dolor sit amet
//               </h2>

//               <p
//                 className="
//                   max-w-[620px]
//                   text-[15px]
//                   leading-[1.55]
//                   text-[#d6d7db]
//                   sm:text-[17px]
//                   md:text-[18px]
//                 "
//               >
//                 Lorem ipsum dolor sit amet consectetur. Odio diam nulla tortor
//                 ornare ultricies egestas tincidunt imperdiet. Purus scelerisque
//                 purus pharetra morbi at massa. Eleifend pretium mauris sit duis
//                 sapien.
//               </p>
//             </div>

//             {/* ================= GET APP ================= */}

//             <div className="mt-7 flex flex-col gap-4 sm:mt-8">
//               <h4
//                 className="
//                   text-[21px]
//                   font-semibold
//                   leading-tight
//                   text-[#f9fafb]
//                   sm:text-[23px]
//                   md:text-[25px]
//                 "
//               >
//                 Get the App
//               </h4>

//               <div
//                 className="
//                   flex
//                   flex-wrap
//                   gap-3
//                   sm:gap-4
//                 "
//               >
//                 {/* ================= GOOGLE PLAY ================= */}

//                 <Link
//                   href="#"
//                   className="
//                     flex
//                     h-[48px]
//                     w-[158px]
//                     shrink-0
//                     items-center
//                     gap-2.5
//                     rounded-lg
//                     border
//                     border-white/80
//                     bg-black
//                     px-3
//                     text-white
//                     transition
//                     hover:bg-[#22252c]
//                     sm:h-[50px]
//                     sm:w-[169px]
//                     sm:gap-3
//                   "
//                 >
//                   {/* Google Play Icon */}

//                   <svg
//                     viewBox="0 0 24 24"
//                     className="h-[23px] w-[23px] shrink-0 sm:h-[25px] sm:w-[25px]"
//                     aria-hidden="true"
//                   >
//                     <path
//                       fill="#00A0FF"
//                       d="M3.6 2.9 13.2 12 3.7 21.1c-.4-.4-.7-1-.7-1.7V4.6c0-.7.2-1.3.6-1.7Z"
//                     />

//                     <path
//                       fill="#00D66B"
//                       d="m13.2 12 3.2-3.1 4.1 2.3c.8.4.8 1.2 0 1.6l-4.1 2.3L13.2 12Z"
//                     />

//                     <path
//                       fill="#FFCC00"
//                       d="m3.6 2.9 9.6 9.1 3.2-3.1-11-6.2c-.7-.4-1.3-.2-1.8.2Z"
//                     />

//                     <path
//                       fill="#FF3B30"
//                       d="m3.7 21.1 9.5-9.1 3.2 3.1-11 6.2c-.7.4-1.3.2-1.7-.2Z"
//                     />
//                   </svg>

//                   <span className="flex min-w-0 flex-col leading-none">
//                     <span
//                       className="
//                         text-[7px]
//                         uppercase
//                         tracking-wide
//                         text-white/90
//                         sm:text-[8px]
//                       "
//                     >
//                       Get it on
//                     </span>

//                     <span
//                       className="
//                         mt-1
//                         whitespace-nowrap
//                         text-[15px]
//                         font-medium
//                         sm:text-[17px]
//                       "
//                     >
//                       Google Play
//                     </span>
//                   </span>
//                 </Link>

//                 {/* ================= APP STORE ================= */}

//                 <Link
//                   href="#"
//                   className="
//                     flex
//                     h-[48px]
//                     w-[158px]
//                     shrink-0
//                     items-center
//                     gap-2.5
//                     rounded-lg
//                     border
//                     border-white/80
//                     bg-black
//                     px-3
//                     text-white
//                     transition
//                     hover:bg-[#22252c]
//                     sm:h-[50px]
//                     sm:w-[169px]
//                     sm:gap-3
//                   "
//                 >
//                   {/* Apple Icon */}

//                   <svg
//                     viewBox="0 0 24 24"
//                     className="h-[22px] w-[22px] shrink-0 fill-white sm:h-[24px] sm:w-[24px]"
//                     aria-hidden="true"
//                   >
//                     <path d="M17.05 12.54c-.02-2.07 1.69-3.07 1.77-3.12a3.82 3.82 0 0 0-3-1.62c-1.27-.13-2.49.76-3.14.76-.66 0-1.67-.74-2.75-.72-1.41.02-2.71.82-3.44 2.08-1.47 2.54-.37 6.28 1.04 8.34.7 1.01 1.52 2.14 2.6 2.1 1.04-.04 1.43-.67 2.69-.67 1.25 0 1.61.67 2.7.65 1.12-.02 1.83-1.02 2.52-2.03a8.32 8.32 0 0 0 1.15-2.36 3.65 3.65 0 0 1-2.14-3.41ZM14.99 6.46a3.59 3.59 0 0 0 .82-2.58 3.66 3.66 0 0 0-2.36 1.22 3.41 3.41 0 0 0-.84 2.48c.9.07 1.8-.46 2.38-1.12Z" />
//                   </svg>
//                   <span className="flex min-w-0 flex-col leading-none">
//                     <span
//                       className="
//                         text-[7px]
//                         tracking-wide
//                         text-white/90
//                         sm:text-[8px]
//                       "
//                     >
//                       Download on the
//                     </span>

//                     <span
//                       className="
//                         mt-1
//                         whitespace-nowrap
//                         text-[15px]
//                         font-medium
//                         sm:text-[17px]
//                       "
//                     >
//                       App Store
//                     </span>
//                   </span>
//                 </Link>
//               </div>
//             </div>
//           </div>

//           {/* =====================================================
//               MOBILE / TABLET PHONE AREA
//           ====================================================== */}

//           <div
//             className="
//               absolute
//               inset-x-0
//               top-[250px]
//               bottom-0
//               sm:top-[270px]
//               md:top-[290px]
//             "
//           >
//             {/* =================================================
//                 BACK PHONE
//             ================================================== */}

//             <div
//               className="
//                 absolute
//                 left-[-155px]
//                 top-[5px]
//                 z-10
//                 h-[500px]
//                 w-[250px]
//                 sm:left-[-125px]
//                 sm:h-[570px]
//                 sm:w-[285px]
//                 md:left-[-95px]
//                 md:h-[640px]
//                 md:w-[320px]
//               "
//             >
//               <div
//                 className="
//                   relative
//                   h-full
//                   w-full
//                   overflow-hidden
//                   rounded-[28px]
//                   border-[6px]
//                   border-[#2d2d2d]
//                   bg-[#1a1a1a]
//                   shadow-2xl
//                   sm:rounded-[32px]
//                 "
//               >
//                 <Image
//                   src="/images/service-5.png"
//                   alt="Motova car details application screen"
//                   fill
//                   className="object-cover"
//                   sizes="
//                     (max-width: 639px) 250px,
//                     (max-width: 767px) 285px,
//                     320px
//                   "
//                 />
//               </div>
//             </div>

//             {/* =================================================
//                 FRONT PHONE
//             ================================================== */}

//             <div
//               className="
//                 absolute
//                 right-[-125px]
//                 top-[300px]
//                 z-20
//                 h-[500px]
//                 w-[250px]
//                 sm:right-[-105px]
//                 sm:top-[350px]
//                 sm:h-[570px]
//                 sm:w-[285px]
//                 md:right-[-75px]
//                 md:top-[400px]
//                 md:h-[640px]
//                 md:w-[320px]
//               "
//             >
//               <div
//                 className="
//                   relative
//                   h-full
//                   w-full
//                   overflow-hidden
//                   rounded-[28px]
//                   border-[6px]
//                   border-[#2d2d2d]
//                   bg-[#1a1a1a]
//                   shadow-2xl
//                   sm:rounded-[32px]
//                 "
//               >
//                 <Image
//                   src="/images/service-6.png"
//                   alt="Motova mobile application home screen"
//                   fill
//                   className="object-cover"
//                   sizes="
//                     (max-width: 639px) 250px,
//                     (max-width: 767px) 285px,
//                     320px
//                   "
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

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

          <div className="absolute inset-0 pointer-events-none">
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
    min-h-[1150px]
    overflow-hidden
    px-5
    pt-12

    sm:min-h-[1250px]
    sm:px-8
    sm:pt-14

    md:min-h-[1350px]
    md:px-10
    md:pt-16

    lg:hidden
  "
        >
          {/* ================= CONTENT ================= */}

          <div
            className="
              relative
              z-40
              w-full
              max-w-[680px]
            "
          >
            {/* Heading + Description */}

            <div className="flex flex-col gap-4">
              <h2
                className="
                  max-w-[620px]
                  text-[30px]
                  font-bold
                  leading-[1.15]
                  tracking-[-0.6px]
                  text-[#f9fafb]

                  sm:text-[36px]
                  sm:leading-[1.2]

                  md:text-[42px]
                "
              >
                Lorem ipsum dolor sit amet
              </h2>

              <p
                className="
                  max-w-[620px]
                  text-[15px]
                  leading-[1.55]
                  text-[#d6d7db]

                  sm:text-[17px]

                  md:text-[18px]
                "
              >
                Lorem ipsum dolor sit amet consectetur. Odio diam nulla tortor
                ornare ultricies egestas tincidunt imperdiet. Purus scelerisque
                purus pharetra morbi at massa. Eleifend pretium mauris sit duis
                sapien.
              </p>
            </div>

            {/* ================= GET APP ================= */}

            <div
              className="
                mt-8
                flex
                flex-col
                gap-4

                sm:mt-9

                md:mt-10
              "
            >
              <h4
                className="
                  text-[21px]
                  font-semibold
                  leading-tight
                  text-[#f9fafb]

                  sm:text-[23px]

                  md:text-[25px]
                  
                "
              >
                Get the App
              </h4>

              {/* App buttons */}

              <div
                className="
    flex
    flex-row
    items-center
    gap-3
    sm:gap-4
  "
              >
                {/* Google Play */}

                <Link
                  href="#"
                  className="
                    flex
                    h-[48px]
                    w-[158px]
                    shrink-0
                    items-center
                    gap-2.5
                    rounded-lg
                    border
                    border-white/80
                    bg-black
                    px-3
                    text-white
                    transition
                    hover:bg-[#22252c]

                    sm:h-[50px]
                    sm:w-[169px]
                    sm:gap-3
                  "
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="
                      h-[23px]
                      w-[23px]
                      shrink-0

                      sm:h-[25px]
                      sm:w-[25px]
                    "
                    aria-hidden="true"
                  >
                    <path
                      fill="#00A0FF"
                      d="M3.6 2.9 13.2 12 3.7 21.1c-.4-.4-.7-1-.7-1.7V4.6c0-.7.2-1.3.6-1.7Z"
                    />

                    <path
                      fill="#00D66B"
                      d="m13.2 12 3.2-3.1 4.1 2.3c.8.4.8 1.2 0 1.6l-4.1 2.3L13.2 12Z"
                    />

                    <path
                      fill="#FFCC00"
                      d="m3.6 2.9 9.6 9.1 3.2-3.1-11-6.2c-.7-.4-1.3-.2-1.8.2Z"
                    />

                    <path
                      fill="#FF3B30"
                      d="m3.7 21.1 9.5-9.1 3.2 3.1-11 6.2c-.7.4-1.3.2-1.7-.2Z"
                    />
                  </svg>

                  <span className="flex min-w-0 flex-col leading-none">
                    <span
                      className="
                        text-[7px]
                        uppercase
                        tracking-wide
                        text-white/90

                        sm:text-[8px]
                      "
                    >
                      Get it on
                    </span>

                    <span
                      className="
                        mt-1
                        whitespace-nowrap
                        text-[15px]
                        font-medium

                        sm:text-[17px]
                      "
                    >
                      Google Play
                    </span>
                  </span>
                </Link>

                {/* App Store */}

                <Link
                  href="#"
                  className="
                    flex
                    h-[48px]
                    w-[158px]
                    shrink-0
                    items-center
                    gap-2.5
                    rounded-lg
                    border
                    border-white/80
                    bg-black
                    px-3
                    text-white
                    transition
                    hover:bg-[#22252c]

                    sm:h-[50px]
                    sm:w-[169px]
                    sm:gap-3
                  "
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="
                      h-[22px]
                      w-[22px]
                      shrink-0
                      fill-white

                      sm:h-[24px]
                      sm:w-[24px]
                    "
                    aria-hidden="true"
                  >
                    <path d="M17.05 12.54c-.02-2.07 1.69-3.07 1.77-3.12a3.82 3.82 0 0 0-3-1.62c-1.27-.13-2.49.76-3.14.76-.66 0-1.67-.74-2.75-.72-1.41.02-2.71.82-3.44 2.08-1.47 2.54-.37 6.28 1.04 8.34.7 1.01 1.52 2.14 2.6 2.1 1.04-.04 1.43-.67 2.69-.67 1.25 0 1.61.67 2.7.65 1.12-.02 1.83-1.02 2.52-2.03a8.32 8.32 0 0 0 1.15-2.36 3.65 3.65 0 0 1-2.14-3.41ZM14.99 6.46a3.59 3.59 0 0 0 .82-2.58 3.66 3.66 0 0 0-2.36 1.22 3.41 3.41 0 0 0-.84 2.48c.9.07 1.8-.46 2.38-1.12Z" />
                  </svg>

                  <span className="flex min-w-0 flex-col leading-none">
                    <span
                      className="
                        text-[7px]
                        tracking-wide
                        text-white/90

                        sm:text-[8px]
                      "
                    >
                      Download on the
                    </span>

                    <span
                      className="
                        mt-1
                        whitespace-nowrap
                        text-[15px]
                        font-medium

                        sm:text-[17px]
                      "
                    >
                      App Store
                    </span>
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* =====================================================
              MOBILE / TABLET PHONES

              IMPORTANT:
              Phones are deliberately placed BELOW the content.
              They remain decorative and cannot push/overlap text.
          ====================================================== */}

          <div
            className="
              pointer-events-none
              absolute
              inset-x-0
              bottom-0
              top-[390px]

              sm:top-[420px]

              md:top-[480px]
            "
          >
            {/* ================= BACK PHONE ================= */}

            <div
              className="
  absolute
 left-[-20px]
  top-[20px]
  z-10

  h-[430px]
  w-[215px]

  min-[400px]:left-[-10px]
  min-[400px]:h-[450px]
  min-[400px]:w-[225px]

  sm:left-[-90px]
  sm:top-[-20px]
  sm:h-[510px]
  sm:w-[255px]

  md:left-[-60px]
  md:top-[-10px]
  md:h-[580px]
  md:w-[290px]
"
            >
              <div
                className="
                  relative
                  h-full
                  w-full
                  overflow-hidden
                  rounded-[28px]
                  border-[6px]
                  border-[#2d2d2d]
                  bg-[#1a1a1a]
                  shadow-2xl

                  sm:rounded-[32px]
                "
              >
                <Image
                  src="/images/service-5.png"
                  alt="Motova car details application screen"
                  fill
                  className="object-cover"
                  sizes="
                    (max-width: 419px) 250px,
                    (max-width: 639px) 250px,
                    (max-width: 767px) 285px,
                    320px
                  "
                />
              </div>
            </div>

            {/* ================= FRONT PHONE ================= */}

            {/* ================= FRONT PHONE ================= */}

<div
  className="
    absolute
    right-[-60px]
    bottom-0
    z-20

    h-[430px]
    w-[215px]

    min-[400px]:right-[-95px]
    min-[400px]:h-[450px]
    min-[400px]:w-[225px]

    sm:right-[-55px]
    sm:top-[250px]
    sm:bottom-auto
    sm:h-[570px]
    sm:w-[285px]

    md:right-[-30px]
    md:top-[285px]
    md:bottom-auto
    md:h-[640px]
    md:w-[320px]
  "
>
  <div
    className="
      relative
      h-full
      w-full
      overflow-hidden
      rounded-[28px]
      border-[6px]
      border-[#2d2d2d]
      bg-[#1a1a1a]
      shadow-2xl

      sm:rounded-[32px]
    "
  >
    <Image
      src="/images/service-6.png"
      alt="Motova mobile application home screen"
      fill
      className="object-cover"
      sizes="
        (max-width: 419px) 215px,
        (max-width: 639px) 225px,
        (max-width: 767px) 285px,
        320px
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
