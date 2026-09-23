"use client";

import { useState } from "react";

const faqs = [
  {
    question:
      "Lorem ipsum dolor sit amet consectetur. Morbi fringilla ac duis dui amet duis nulla praesent.",
    answer:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Condimentum diam orci pretium a pharetra, feugiat cursus.",
  },
  {
    question:
      "Lorem ipsum dolor sit amet consectetur. Vulputate ac varius non duis etiam aliquam arcu fermentum.",
    answer:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Condimentum diam orci pretium a pharetra, feugiat cursus. Dictumst risus, sem egestas odio cras adipiscing vulputate.",
  },
  {
    question:
      "Lorem ipsum dolor sit amet consectetur. Iaculis vitae tincidunt purus eu euismod quis.",
    answer:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
  },
  {
    question:
      "Lorem ipsum dolor sit amet consectetur. Quisque ut felis dictum gravida purus lacus eros vel.",
    answer:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
  },
  {
    question:
      "Lorem ipsum dolor sit amet consectetur. Lectus velit eu egestas velit nam et aenean habitant.",
    answer:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(1);

  return (
    <section className="bg-[#f9fafb] py-20">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center gap-12 px-5 md:px-[55px]">
        <h2 className="text-center text-3xl font-bold text-[#111827] md:text-[40px]">
          Frequently Asked Questions
        </h2>

        <div className="w-full max-w-[1056px] rounded-2xl bg-white p-4 shadow-[0_30px_40px_rgba(212,217,232,0.2)] md:px-8 md:pb-8">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const answerId = `faq-answer-${index}`;

            return (
              <div
                key={index}
                className={`border-b ${
                  index === faqs.length - 1
                    ? "border-b-0"
                    : isOpen
                      ? "border-[#3b82f6]"
                      : "border-[#9ca3af]"
                }`}
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenIndex(isOpen ? null : index)
                  }
                  className="flex w-full items-center justify-between gap-5 py-7 text-left"
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                >
                  <span className="max-w-[90%] text-base font-bold leading-[1.5] text-[#111827] md:text-lg">
                    {faq.question}
                  </span>

                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className={`h-6 w-6 shrink-0 text-[#111827] transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                <div
                  id={answerId}
                  hidden={!isOpen}
                  className="max-w-[1120px] pb-7 text-base leading-[1.6] text-[#374151] md:text-lg"
                >
                  {faq.answer}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}