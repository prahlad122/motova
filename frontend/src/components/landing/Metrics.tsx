const metrics = [
  {
    number: "100+",
    line1: "Happy",
    line2: "customers",
  },
  {
    number: "300+",
    line1: "Products",
    line2: "available",
  },
  {
    number: "100+",
    line1: "Product ",
    line2: "categories",
  },
  {
    number: "80+",
    line1: "Orders",
    line2: "delivered",
  },
];

export default function Metrics() {
  return (
    <section className="bg-[#16181d] py-16">
      <div className="mx-auto flex w-full max-w-[1280px] flex-wrap items-center justify-center gap-10 px-5 md:justify-between md:px-[55px]">
        {metrics.map((metric) => (
          <div
            key={metric.number}
            className="flex w-[45%] items-center justify-center gap-4 md:w-auto md:justify-start"
          >
            <h2 className="text-4xl font-bold text-[#f9fafb] md:text-5xl">
              {metric.number}
            </h2>

            <p className="text-sm leading-[1.4] text-[#d6d7db] md:text-base">
              {metric.line1}
              <br />
              {metric.line2}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}