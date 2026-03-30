"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[DashboardError]", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center px-4">
      <h2 className="text-xl font-bold">Sayfa yüklenemedi</h2>
      <p className="text-muted-foreground max-w-md text-sm">
        Bu sayfayı yüklerken bir sorun oluştu. Lütfen tekrar deneyin.
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground font-mono">
          Hata kodu: {error.digest}
        </p>
      )}
      <Button variant="outline" onClick={reset}>
        Tekrar Dene
      </Button>
    </div>
  );
}
