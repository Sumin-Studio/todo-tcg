import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  type = "button",
  ...props
}: ButtonProps) {
  const base =
    "app-button font-normal tracking-[-0.02em] disabled:pointer-events-none";

  const variants = {
    primary: "",
    secondary:
      "bg-[linear-gradient(to_bottom,_#f8f8f8,_#dddddd)] text-[var(--text-body)]",
    ghost:
      "bg-transparent shadow-none outline-none border border-[var(--border)] text-[var(--text-body)]",
  };

  const sizes = {
    sm: "min-h-11 px-4 text-sm",
    md: "min-h-[52px] px-5 text-base",
    lg: "min-h-[58px] px-7 text-[1.05rem]",
  };

  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
