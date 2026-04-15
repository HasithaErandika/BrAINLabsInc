import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "../../lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full";
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full";
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
  full: "max-w-[95vw]",
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth,
  size,
  className,
}: ModalProps & { className?: string }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const effectiveMaxWidth = size || maxWidth || "lg";

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10 transition-all duration-300">
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-zinc-900/40 backdrop-blur-md transition-opacity duration-500"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={cn(
          "relative bg-white w-full shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-full border border-zinc-200 animate-in slide-in-from-bottom-12 zoom-in-95 fade-in duration-500",
          maxWidthClasses[effectiveMaxWidth],
          className
        )}
      >
        <div className="flex items-center justify-between px-10 py-8 border-b border-zinc-100 bg-zinc-50/50">
          <h2 className="text-xl font-black text-zinc-900 tracking-tight uppercase italic">{title}</h2>
          <button 
            onClick={onClose} 
            className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-10 lg:p-12 scroll-hide">
          {children}
        </div>
        {/* Footer */}
        {footer && (
          <div className="px-10 py-8 bg-white border-t border-zinc-100 flex items-center justify-end gap-4 sticky bottom-0 z-20">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
