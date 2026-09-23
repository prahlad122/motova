import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export default function Input({ label, id, ...props }: InputProps) {
  return (
    <label htmlFor={id} className="flex flex-col gap-2 text-[16px] font-medium leading-5 text-[#101828]">
      {label}
      <input
        id={id}
        {...props}
        className="h-11 rounded-[8px] border border-[#dfe3e8] bg-white px-3.5 text-[16px] text-[#101828] outline-none transition placeholder:text-[#98a2b3] focus:border-[#17181c] focus:ring-1 focus:ring-[#17181c]"
      />
    </label>
  );
}
