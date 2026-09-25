import Image from "next/image";

const services = [
  {
    title: "Lorem ipsum",
    category: "Lorem Ips",
    description: "Lorem ipsum dolor sit amet consectetur.",
    image: "/images/car1.png",
  },
  {
    title: "Lorem ipsum",
    category: "Lorem Ips",
    description: "Lorem ipsum dolor sit amet consectetur.",
    image: "/images/car2.png",
  },
  {
    title: "Lorem ipsum",
    category: "Lorem Ips",
    description: "Lorem ipsum dolor sit amet consectetur.",
    image: "/images/car3.png",
  },
  {
    title: "Lorem ipsum",
    category: "Lorem Ips",
    description: "Lorem ipsum dolor sit amet consectetur.",
    image: "/images/car4.png",
  },
  {
    title: "Lorem ipsum",
    category: "Lorem Ips",
    description: "Lorem ipsum dolor sit amet consectetur.",
    image: "/images/car5.png",
  },
  {
    title: "Lorem ipsum",
    category: "Lorem Ips",
    description: "Lorem ipsum dolor sit amet consectetur.",
    image: "/images/car6.png",
  },
];

export default function Services() {
  return (
    <section className="bg-[#16181d] py-24">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-16 px-5 md:px-[55px]">
        <div className="mx-auto flex max-w-[800px] flex-col gap-5 text-center">
          <h2 className="text-3xl font-bold text-[#f9fafb] md:text-[40px]">
            Discover our best car services
          </h2>

          <p className="text-base leading-[1.5] text-[#d6d7db] md:text-lg">
            Lorem ipsum dolor sit amet consectetur. Quam sed eu nulla lectus
            aliquet adipiscing. Dignissim risus erat massa.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-[34px] md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <div
              key={`${service.title}-${index}`}
              className="overflow-hidden rounded-[20px] bg-white"
            >
              <div className="relative h-[276px] w-full">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>

              <div className="flex flex-col gap-3 p-[30px]">
                <h3 className="text-2xl font-bold text-[#111827]">
                  {service.title}
                </h3>

                <p className="text-base font-medium text-[#3b82f6]">
                  {service.category}
                </p>

                <p className="text-base text-[#4b5563]">
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}