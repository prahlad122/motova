"use client";

import { useState } from "react";

const faqs = [
  {
    question: "What is Motova?",
    answer:
      "Motova is an online marketplace where you can buy car accessories from sellers across India, all in one place.",
  },
  {
    question: "How do I place an order?",
    answer:
      "Pick a category, choose your product, add it to your cart and pay online. Available payment methods will be shown at checkout.",
  },
  {
    question: "Are the products genuine?",
    answer:
      "Every seller is reviewed by the Motova team before they can sell, and every new product is checked before it appears on the site. If something is not as described, contact us and we will help.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Delivery times depend on your location, the seller and the courier partner. Once your order is confirmed, check your order details for the estimated delivery date and available tracking information.",
  },
  {
    question: "How do returns and refunds work?",
    answer:
      "Return eligibility depends on the product and the applicable return policy. Please review the return conditions before placing your order or contact our support team for assistance with returns and refunds.",
  },
];
export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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
                  onClick={() => setOpenIndex(isOpen ? null : index)}
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
