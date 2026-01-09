import { PropsWithChildren } from "react";
import clsx from "clsx";

export function Modal({
  children,
  isOpen,
  onClose,
  className
}: PropsWithChildren<{
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}>) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className={clsx("w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl", className)}>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="rounded-full px-2 py-1 text-sm text-slate-500 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
