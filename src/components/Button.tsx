import type { ButtonHTMLAttributes } from "react";

const variants = {
  primary: "border-teal-700 bg-teal-700 text-white",
  secondary: "border-teal-200 bg-teal-50 text-teal-900",
  ghost: "border-transparent bg-transparent text-teal-900",
} as const;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
};

export function Button({ variant = "secondary", className, type = "button", ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={`h-10 rounded-md border px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${variants[variant]} ${className ?? ""}`}
      {...rest}
    />
  );
}
