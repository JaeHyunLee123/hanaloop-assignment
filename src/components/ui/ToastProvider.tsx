"use client";

// 토스트 메시지를 화면에 렌더링하는 Provider 컴포넌트
import { useToastStore } from "@/store/toast-store";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

export function ToastProvider() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 rounded-lg border p-4 shadow-lg transition-all ${
            toast.type === "success"
              ? "border-primary/20 bg-primary/10 text-primary"
              : toast.type === "error"
              ? "border-danger/20 bg-danger/10 text-danger"
              : toast.type === "warning"
              ? "border-warning/20 bg-warning/10 text-warning"
              : "border-secondary/20 bg-secondary/10 text-secondary"
          }`}
        >
          {toast.type === "success" && <CheckCircle className="h-5 w-5" />}
          {toast.type === "error" && <XCircle className="h-5 w-5" />}
          {toast.type === "info" && <Info className="h-5 w-5" />}
          {toast.type === "warning" && <Info className="h-5 w-5" />}
          
          <p className="text-sm font-medium">{toast.message}</p>
          
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-4 text-foreground/50 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
