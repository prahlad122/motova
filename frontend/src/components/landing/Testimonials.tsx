// "use client";

// import Image from "next/image";
// import { useEffect, useState } from "react";

// const testimonials = [
//   {
//     name: "Lauren M.",
//     role: "UI Designer @Boo",
//     text: "Lorem ipsum dolor sit amet consectetur. Ullamcorper felis eu arcu turpis lectus eget. Semper nullam in condimentum amet quam tempus vel.",
//     image: "/images/service-2.png",
//   },
//   {
//     name: "David B.",
//     role: "Lead Designer @Creative",
//     text: "Lorem ipsum dolor sit amet consectetur. Tortor adipiscing ullamcorper velit sed semper neque lacus blandit maecenas. A purus orci.",
//     image: "/images/service-3.png",
//   },
//   {
//     name: "Sarah K.",
//     role: "Product Designer @Flow",
//     text: "Lorem ipsum dolor sit amet consectetur. Ullamcorper felis eu arcu turpis lectus eget. Semper nullam in condimentum amet quam tempus vel.",
//     image: "/images/service-2.png",
//   },
//   {
//     name: "Michael R.",
//     role: "UX Designer @Vision",
//     text: "Lorem ipsum dolor sit amet consectetur. Tortor adipiscing ullamcorper velit sed semper neque lacus blandit maecenas. A purus orci.",
//     image: "/images/service-3.png",
//   },
//   {
//     name: "Emma T.",
//     role: "Creative Lead @Studio",
//     text: "Lorem ipsum dolor sit amet consectetur. Amet quis tortor placerat diam donec viverra viverra urna at.",
//     image: "/images/service-2.png",
//   },
//   {
//     name: "James W.",
//     role: "Product Manager @Build",
//     text: "Lorem ipsum dolor sit amet consectetur. Ullamcorper felis eu arcu turpis lectus eget. Semper nullam in condimentum amet quam tempus vel.",
//     image: "/images/service-3.png",
//   },
// ];

// export default function Testimonials() {
//   const [currentIndex, setCurrentIndex] = useState(0);

//   // Move exactly one card every 5 seconds
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentIndex((prev) => {
//         if (prev >= testimonials.length - 2) {
//           return 0;
//         }

//         return prev + 1;
//       });
//     }, 5000);

//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <section className="overflow-hidden bg-[#eaecf0] py-24">
//       <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-16 px-5 md:px-[55px]">

//         {/* ================= HEADER ================= */}
//         <div className="flex flex-col items-center gap-5 text-center">
//           <h2 className="text-3xl font-bold text-[#111827] md:text-[40px]">
//             Real Stories from Satisfied Customers
//           </h2>

//           <p className="max-w-[800px] text-base leading-[1.5] text-[#374151] md:text-lg">
//             Lorem ipsum dolor sit amet consectetur. Amet quis tortor placerat
//             diam donec viverra viverra urna at.
//           </p>
//         </div>

//         {/* ================= CAROUSEL ================= */}
//         <div className="overflow-hidden">
//           <div
//             className="flex gap-[30px] transition-transform duration-700 ease-in-out"
//             style={{
//               transform:
//                 typeof window !== "undefined" && window.innerWidth < 1024
//                   ? `translateX(calc(-${currentIndex} * (100% + 30px)))`
//                   : `translateX(calc(-${currentIndex} * (50% + 15px)))`,
//             }}
//           >
//             {testimonials.map((testimonial) => (
//               <div
//                 key={testimonial.name}
//                 className="flex min-w-full flex-col items-center gap-8 rounded-[20px] bg-white px-8 py-10 lg:min-w-[calc((100%-30px)/2)] lg:flex-row lg:items-start lg:gap-[30px] lg:px-8"
//               >
//                 {/* ================= AVATAR ================= */}
//                 <div className="flex min-w-[180px] flex-col items-center gap-4">
//                   <Image
//                     src={testimonial.image}
//                     alt={testimonial.name}
//                     width={150}
//                     height={150}
//                     className="h-[150px] w-[150px] rounded-full object-cover"
//                   />

//                   <div className="text-center">
//                     <h4 className="mb-1.5 text-lg font-bold text-[#111827]">
//                       {testimonial.name}
//                     </h4>

//                     <p className="text-sm text-[#374151]">
//                       {testimonial.role}
//                     </p>
//                   </div>
//                 </div>

//                 {/* ================= TESTIMONIAL ================= */}
//                 <div className="flex flex-col gap-6 text-center lg:pt-1 lg:text-left">

//                   {/* Stars */}
//                   <div className="flex justify-center gap-1 lg:justify-start">
//                     {Array.from({ length: 5 }).map((_, index) => (
//                       <span key={index} className="text-2xl text-[#f59e0b]">
//                         ★
//                       </span>
//                     ))}
//                   </div>

//                   {/* Text */}
//                   <p className="text-base leading-[1.6] text-[#4b5563]">
//                     &ldquo;{testimonial.text}&rdquo;
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* ================= DOTS ================= */}
//         <div className="flex justify-center gap-2">
//           {testimonials.map((_, index) => (
//             <button
//               key={index}
//               type="button"
//               onClick={() => {
//                 if (index <= testimonials.length - 2) {
//                   setCurrentIndex(index);
//                 }
//               }}
//               aria-label={`Go to testimonial ${index + 1}`}
//               className={`h-2.5 rounded-full transition-all ${
//                 currentIndex === index
//                   ? "w-7 bg-[#111827]"
//                   : "w-2.5 bg-[#9ca3af]"
//               }`}
//             />
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }


"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const GAP = 30;
const AUTO_INTERVAL = 5000;

const testimonials = [
  {
    name: "Lauren M.",
    role: "UI Designer @Boo",
    text: "Lorem ipsum dolor sit amet consectetur. Ullamcorper felis eu arcu turpis lectus eget. Semper nullam in condimentum amet quam tempus vel.",
    image: "/images/service-2.png",
  },
  {
    name: "David B.",
    role: "Lead Designer @Creative",
    text: "Lorem ipsum dolor sit amet consectetur. Tortor adipiscing ullamcorper velit sed semper neque lacus blandit maecenas. A purus orci.",
    image: "/images/service-3.png",
  },
  {
    name: "Sarah K.",
    role: "Product Designer @Flow",
    text: "Lorem ipsum dolor sit amet consectetur. Ullamcorper felis eu arcu turpis lectus eget. Semper nullam in condimentum amet quam tempus vel.",
    image: "/images/avtar3.jpg",
  },
  {
    name: "Michael R.",
    role: "UX Designer @Vision",
    text: "Lorem ipsum dolor sit amet consectetur. Tortor adipiscing ullamcorper velit sed semper neque lacus blandit maecenas. A purus orci.",
    image: "/images/avtar1.png",
  },
  {
    name: "Emma T.",
    role: "Creative Lead @Studio",
    text: "Lorem ipsum dolor sit amet consectetur. Amet quis tortor placerat diam donec viverra viverra urna at.",
    image: "/images/avtar2.jpg",
  },
  {
    name: "James W.",
    role: "Product Manager @Build",
    text: "Lorem ipsum dolor sit amet consectetur. Ullamcorper felis eu arcu turpis lectus eget. Semper nullam in condimentum amet quam tempus vel.",
    image: "/images/service-3.png",
  },
];

function getVisible(width: number) {
  if (width < 640) return 1;
  if (width < 1024) return 2;
  return 4;
}

export default function Testimonials() {
  const viewportRef = useRef<HTMLDivElement>(null);

  const [cardWidth, setCardWidth] = useState(0);
  const [visible, setVisible] = useState(4);
  const [currentIndex, setCurrentIndex] = useState(testimonials.length);
  const [animate, setAnimate] = useState(true);

  const total = testimonials.length;

  // Create 3 copies for seamless infinite scrolling
  const tripledTestimonials = [
    ...testimonials,
    ...testimonials,
    ...testimonials,
  ];

  // ============================
  // CALCULATE CARD WIDTH
  // ============================

  const calculateCardWidth = useCallback(() => {
    const viewport = viewportRef.current;

    if (!viewport) return;

    const viewportWidth = viewport.clientWidth;
    const visibleCards = getVisible(viewportWidth);

    setVisible(visibleCards);

    const width =
      (viewportWidth - (visibleCards - 1) * GAP) / visibleCards;

    setCardWidth(width);
  }, []);

  // ============================
  // RESPONSIVE RESIZE
  // ============================

  useEffect(() => {
    calculateCardWidth();

    const resizeObserver = new ResizeObserver(calculateCardWidth);

    if (viewportRef.current) {
      resizeObserver.observe(viewportRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [calculateCardWidth]);

  // ============================
  // RESET POSITION ON BREAKPOINT
  // ============================

  useEffect(() => {
    setAnimate(false);
    setCurrentIndex(total);

    requestAnimationFrame(() => {
      setAnimate(true);
    });
  }, [visible, total]);

  // ============================
  // MOVE ONE CARD
  // ============================

  const moveNext = useCallback(() => {
    setAnimate(true);

    setCurrentIndex((prev) => prev + 1);
  }, []);

  // ============================
  // INFINITE LOOP
  // ============================

  useEffect(() => {
    if (!animate) return;

    let timeout: ReturnType<typeof setTimeout>;

    if (currentIndex >= total * 2) {
      timeout = setTimeout(() => {
        setAnimate(false);

        setCurrentIndex((prev) => prev - total);
      }, 500);
    }

    return () => clearTimeout(timeout);
  }, [currentIndex, animate, total]);

  // Re-enable animation after silent reset
  useEffect(() => {
    if (!animate) {
      const frame = requestAnimationFrame(() => {
        setAnimate(true);
      });

      return () => cancelAnimationFrame(frame);
    }
  }, [animate]);

  // ============================
  // AUTO SLIDE
  // ============================

  useEffect(() => {
    const interval = setInterval(() => {
      moveNext();
    }, AUTO_INTERVAL);

    return () => clearInterval(interval);
  }, [moveNext]);

  // ============================
  // TRANSLATION
  // ============================

  const step = cardWidth + GAP;

  const translateX = currentIndex * step;

  const activeDot =
    ((currentIndex - total) % total + total) % total;

  return (
    <section className="overflow-hidden bg-[#eaecf0] py-24">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-16 px-5 md:px-[55px]">

        {/* ================= HEADER ================= */}

        <div className="flex flex-col items-center gap-5 text-center">
          <h2 className="text-3xl font-bold text-[#111827] md:text-[40px]">
            Real Stories from Satisfied Customers
          </h2>

          <p className="max-w-[800px] text-base leading-[1.5] text-[#374151] md:text-lg">
            Lorem ipsum dolor sit amet consectetur. Amet quis tortor
            placerat diam donec viverra viverra urna at.
          </p>
        </div>

        {/* ================= CAROUSEL ================= */}

        <div
          ref={viewportRef}
          className="w-full overflow-hidden py-2"
        >
          <div
            className="flex"
            style={{
              gap: `${GAP}px`,
              transform: `translateX(-${translateX}px)`,
              transition: animate
                ? "transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)"
                : "none",
              willChange: "transform",
            }}
          >
            {tripledTestimonials.map((testimonial, index) => (
<div
  key={`${testimonial.name}-${index}`}
  style={{
    width: cardWidth > 0 ? `${cardWidth}px` : "100%",
    minWidth: cardWidth > 0 ? `${cardWidth}px` : "100%",
    flex: "0 0 auto",
  }}
  className="
    flex
    min-h-[330px]
    min-w-0
    flex-col
    items-center
    overflow-hidden
    rounded-[20px]
    bg-white
    px-5
    py-8
    shadow-sm
    sm:px-6
  "
>
  {/* ================= AVATAR ================= */}

  <div className="flex w-full min-w-0 flex-col items-center gap-4">
    <Image
      src={testimonial.image}
      alt={testimonial.name}
      width={150}
      height={150}
      className="
        h-[150px]
        w-[150px]
        shrink-0
        rounded-full
        object-cover
      "
    />

    <div className="w-full min-w-0 text-center">
      <h4 className="mb-1.5 truncate text-lg font-bold text-[#111827]">
        {testimonial.name}
      </h4>

      <p className="truncate text-sm text-[#374151]">
        {testimonial.role}
      </p>
    </div>
  </div>

  {/* ================= TESTIMONIAL ================= */}

  <div
    className="
      mt-6
      flex
      w-full
      min-w-0
      flex-1
      flex-col
      items-center
      gap-4
      text-center
    "
  >
    {/* Stars */}

    <div className="flex shrink-0 justify-center gap-1">
      {Array.from({ length: 5 }).map((_, starIndex) => (
        <span
          key={starIndex}
          className="text-xl leading-none text-[#f59e0b]"
        >
          ★
        </span>
      ))}
    </div>

    {/* Text */}

    <p
      className="
        w-full
        min-w-0
        break-words
        text-sm
        leading-[1.6]
        text-[#4b5563]
      "
    >
      &ldquo;{testimonial.text}&rdquo;
    </p>
  </div>
</div>
            ))}
          </div>
        </div>

        {/* ================= DOTS ================= */}

        <div className="flex justify-center gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to testimonial ${index + 1}`}
              onClick={() => {
                setAnimate(true);
                setCurrentIndex(total + index);
              }}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                activeDot === index
                  ? "w-7 bg-[#111827]"
                  : "w-2.5 bg-[#9ca3af]"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}