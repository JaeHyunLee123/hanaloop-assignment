"use client";

// 탄소 배출 데이터 입력을 위한 폼 컴포넌트
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToastStore } from "@/store/toast-store";
import { Loader2 } from "lucide-react";

const ACTION_TYPES = [
  { value: "guitar_production", label: "기타 자체 생산 (Kender)" },
  { value: "delivery", label: "국내 배송 거리 (국내배송회사)" },
  { value: "pickup_import", label: "픽업 수입 (인도네시아)" },
  { value: "string_import", label: "기타줄 수입 (중국)" },
];

export default function InputForm() {
  const [actionType, setActionType] = useState(ACTION_TYPES[0].value);
  const [quantity, setQuantity] = useState<number | "">("");
  const [yearMonth, setYearMonth] = useState("");
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  useEffect(() => {
    // Default to current year and month
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    setYearMonth(`${yyyy}-${mm}`);
  }, []);

  const mutation = useMutation({
    mutationFn: async (payload: { actionType: string; quantity: number; yearMonth: string }) => {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error("Failed to submit data");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      addToast("success", "데이터가 성공적으로 등록되었습니다.");
      setQuantity(""); // Reset quantity after success
    },
    onError: (error) => {
      addToast("error", error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quantity || isNaN(Number(quantity))) {
      addToast("warning", "유효한 수량/거리를 입력해주세요.");
      return;
    }
    if (!yearMonth) {
      addToast("warning", "년월을 선택해주세요.");
      return;
    }

    mutation.mutate({
      actionType,
      quantity: Number(quantity),
      yearMonth,
    });
  };

  return (
    <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-foreground">데이터 입력</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/80">활동 유형</label>
          <select
            value={actionType}
            onChange={(e) => setActionType(e.target.value)}
            className="w-full rounded-md border border-border bg-background p-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {ACTION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/80">
            수량 / 거리
            {actionType === "delivery" ? " (km)" : " (단위)"}
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : "")}
            className="w-full rounded-md border border-border bg-background p-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="수치를 입력하세요 (마이너스 값 허용)"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/80">발생 년월</label>
          <input
            type="month"
            value={yearMonth}
            onChange={(e) => setYearMonth(e.target.value)}
            className="w-full rounded-md border border-border bg-background p-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2.5 text-sm font-medium text-background transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-50"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> 처리 중...
            </>
          ) : (
            "등록하기"
          )}
        </button>
      </form>
    </div>
  );
}
