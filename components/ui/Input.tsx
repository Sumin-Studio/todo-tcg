import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  error,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={inputId} className="app-label">
          {label}
        </label>
      )}
      <input id={inputId} className={`app-input ${className}`} {...props} />
      {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
    </div>
  );
}
