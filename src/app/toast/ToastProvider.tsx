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
    }, 2500);
  }, []);

  const api = useMemo<ToastApi>(() => ({
    success: (m: string) => push(m, "success"),
    error: (m: string) => push(m, "error"),
    info: (m: string) => push(m, "info"),
  }), [push]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id}
               className={`pointer-events-auto flex items-center gap-2 rounded-md px-3 py-2 shadow-lg border text-sm
                ${t.kind === "success" ? "bg-green-50 border-green-200 text-green-800" : ""}
                ${t.kind === "error" ? "bg-red-50 border-red-200 text-red-800" : ""}
                ${t.kind === "info" ? "bg-blue-50 border-blue-200 text-blue-800" : ""}
               `}
               aria-live="polite"
               role="status"
          >
            {t.kind === "success" && <CheckCircle2 className="text-green-600" size={18} />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
} 