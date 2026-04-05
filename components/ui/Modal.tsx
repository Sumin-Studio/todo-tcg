"use client";

import { useEffect } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="absolute inset-0 bg-[rgba(32,32,32,0.2)] backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="app-panel relative z-10 w-full max-w-md p-6">
        {title && (
          <h2 className="app-title mb-4 text-2xl leading-[0.9] tracking-[-0.06em]">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
}
