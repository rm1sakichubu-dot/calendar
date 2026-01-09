import { ButtonHTMLAttributes, PropsWithChildren } from "react";
import clsx from "clsx";

const variants = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200",
  danger: "bg-rose-600 text-white hover:bg-rose-700"
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
};

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: PropsWithChildren<ButtonProps>) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
