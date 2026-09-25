// type IconProps = {
//   name: string;
//   className?: string;
// };

// export default function Icon({
//   name,
//   className = "",
// }: IconProps) {
//   return (
//     <span
//       className={`material-symbols-outlined ${className}`}
//       aria-hidden="true"
//     >
//       {name}
//     </span>
//   );
// }



type IconProps = {
  name: string;
  className?: string;
  filled?: boolean;
};

export default function Icon({
  name,
  className = "",
  filled = false,
}: IconProps) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{
        fontVariationSettings: `
          "FILL" ${filled ? 1 : 0},
          "wght" 400,
          "GRAD" 0,
          "opsz" 24
        `,
      }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
