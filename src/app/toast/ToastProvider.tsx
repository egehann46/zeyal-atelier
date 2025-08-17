"use client";

import { CheckCircle2 } from "lucide-react";
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

type ToastKind = "success" | "error" | "info";

type ToastItem = {
  id: number;
  message: string;
  kind: ToastKind;
};

export type ToastApi = {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(1);

  const push = useCallback((message: string, kind: ToastKind) => {
    const id = idRef.current++;
    setToasts(prev => [...prev, { id, message, kind }]);
    // otomatik kaldır
    window.setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 1500);
  }, []);

  const api = useMemo<ToastApi>(() => ({
    success: (m: string) => push(m, "success"),
    error: (m: string) => push(m, "error"),
    info: (m: string) => push(m, "info"),
  }), [push]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
        {toasts.length > 0 && <div className="absolute inset-0 bg-black/20" />}
        <div className="flex flex-col items-center gap-3">
          {toasts.map(t => (
            <div key={t.id}
                 className={`pointer-events-auto relative flex items-center gap-2 rounded-lg px-4 py-3 shadow-2xl border text-base bg-white transition-all duration-150
                  ${t.kind === "success" ? "border-green-300 text-green-800" : ""}
                  ${t.kind === "error" ? "border-red-300 text-red-800" : ""}
                  ${t.kind === "info" ? "border-blue-300 text-blue-800" : ""}
                 `}
                 aria-live="polite"
                 role="status"
            >
              {t.kind === "success" && <CheckCircle2 className="text-green-600" size={20} />}
              <span className="font-medium">{t.message}</span>
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
} 