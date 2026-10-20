import type { ComponentPropsWithoutRef } from "react";
import { controlClass } from "@/constants/controlClass";

export type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = {
  id: string;
  label?: string;
  options: readonly SelectOption[];
  onChange: (value: string) => void;
} & Omit<ComponentPropsWithoutRef<"select">, "id" | "onChange" | "children">;

const chevron =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M4 6l4 4 4-4' fill='none' stroke='%2318181b' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")";

export function Select({ id, label, options, onChange, className, ...rest }: SelectProps) {
  return (
    <div className={`flex min-w-64 flex-col gap-1 ${className ?? ""}`}>
      {label ?
        <label className="text-sm font-medium text-zinc-900" htmlFor={id}>
          {label}
        </label> : null}
      <select
        id={id}
        className={`${controlClass} appearance-none bg-[length:1rem] bg-[position:right_0.5rem_center] bg-no-repeat pr-8 ${className ?? ""}`}
        style={{ backgroundImage: chevron }}
        onChange={(event) => onChange(event.target.value)}
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
