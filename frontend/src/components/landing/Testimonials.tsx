import Image from "next/image";

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
];

export default function Testimonials() {
  return (
    <section className="bg-[#eaecf0] py-24">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-16 px-5 md:px-[55px]">
        <div className="flex flex-col items-center gap-5 text-center">
          <h2 className="text-3xl font-bold text-[#111827] md:text-[40px]">
            Real Stories from Satisfied Customers
          </h2>

          <p className="max-w-[800px] text-base leading-[1.5] text-[#374151] md:text-lg">
            Lorem ipsum dolor sit amet consectetur. Amet quis tortor placerat
            diam donec viverra viverra urna at.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-[30px] lg:grid-cols-2">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="flex flex-col items-center gap-8 rounded-[20px] bg-white px-8 py-10 md:px-10 lg:flex-row lg:items-start lg:gap-[30px] lg:px-8"
            >
              {/* Avatar */}
              <div className="flex min-w-[180px] flex-col items-center gap-4">
                <Image
                  src={testimonial.image}
                  alt={testimonial.name}
                  width={150}
                  height={150}
                  className="h-[150px] w-[150px] rounded-full object-cover"
                />

                <div className="text-center">
                  <h4 className="mb-1.5 text-lg font-bold text-[#111827]">
                    {testimonial.name}
                  </h4>

                  <p className="text-sm text-[#374151]">
                    {testimonial.role}
                  </p>
                </div>
              </div>

              {/* Testimonial */}
              <div className="flex flex-col gap-6 text-center lg:pt-1 lg:text-left">
                <div className="flex justify-center gap-1 lg:justify-start">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <span
                      key={index}
                      className="text-2xl text-[#f59e0b]"
                    >
                      ★
                    </span>
                  ))}
                </div>

                <p className="text-base leading-[1.6] text-[#4b5563]">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}