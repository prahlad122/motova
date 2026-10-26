"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const GAP = 30;
const AUTO_INTERVAL = 5000;

const testimonials = [
  {
    name: "Lauren M.",
    role: "Mumbai · Hyundai Creta",
    text: "The floor mats fit perfectly in my car and keep the interior clean. The quality is excellent and worth the price.",
    image: "/images/service-2.png",
  },
  {
    name: "David B.",
    role: "Delhi · Tata Nexon",
    text: "My order arrived on time, and the product quality was exactly what I expected. Shopping for car accessories was easy.",
    image: "/images/service-3.png",
  },
  {
    name: "Sarah K.",
    role: "Bengaluru · Maruti Baleno",
    text: "The interior accessories gave my car a fresh look. The fit and finish are great, and the products feel durable.",
    image: "/images/avtar3.jpg",
  },
  {
    name: "Michael R.",
    role: "Pune · Mahindra XUV700",
    text: "I found the lighting accessories I needed without any hassle. The product details were clear, and the buying experience was smooth.",
    image: "/images/avtar1.png",
  },
  {
    name: "Emma T.",
    role: "Hyderabad · Kia Seltos",
    text: "The sunshades are easy to use and help keep the cabin comfortable. A practical accessory that makes a real difference.",
    image: "/images/avtar2.jpg",
  },
  {
    name: "James W.",
    role: "Lucknow · Honda City",
    text: "The charger works well and keeps my devices powered during long drives. Overall, the shopping experience was straightforward.",
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

    const width = (viewportWidth - (visibleCards - 1) * GAP) / visibleCards;

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

  const activeDot = (((currentIndex - total) % total) + total) % total;

  return (
    <section className="overflow-hidden bg-[#eaecf0] py-24">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-16 px-5 md:px-[55px]">
        {/* ================= HEADER ================= */}

        <div className="flex flex-col items-center gap-5 text-center">
          <h2 className="text-3xl font-bold text-[#111827] md:text-[40px]">
            Real Stories from Satisfied Customers
          </h2>

          <p className="max-w-[800px] text-base leading-[1.5] text-[#374151] md:text-lg">
            Car owners across India share how Motova worked for them, from
            finding the right accessories to enjoying quality products and a
            smooth shopping experience.
          </p>
        </div>

        {/* ================= CAROUSEL ================= */}

        <div ref={viewportRef} className="w-full overflow-hidden py-2">
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
                activeDot === index ? "w-7 bg-[#111827]" : "w-2.5 bg-[#9ca3af]"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
