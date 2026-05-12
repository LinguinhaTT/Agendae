"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  currentDate?: string;
  currentStatus?: string;
}

export function AgendaDateFilter({ currentDate, currentStatus }: Props) {
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const params = new URLSearchParams();
    if (currentStatus && currentStatus !== "all") params.set("status", currentStatus);
    if (e.target.value) params.set("date", e.target.value);
    const qs = params.toString();
    router.push(`/admin/agenda${qs ? `?${qs}` : ""}`);
  }

  function handleClear() {
    const params = new URLSearchParams();
    if (currentStatus && currentStatus !== "all") params.set("status", currentStatus);
    const qs = params.toString();
    router.push(`/admin/agenda${qs ? `?${qs}` : ""}`);
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <input
          type="date"
          value={currentDate ?? ""}
          onChange={handleChange}
          className="h-9 rounded-lg border border-white/10 bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors pr-8"
        />
        {currentDate && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
