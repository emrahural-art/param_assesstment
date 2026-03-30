"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-4">
      <h2 className="text-2xl font-bold">Bir hata oluştu</h2>
      <p className="text-muted-foreground max-w-md">
        Beklenmeyen bir sorun yaşandı. Lütfen tekrar deneyin veya sorun devam
        ederse yöneticinize başvurun.
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground font-mono">
          Hata kodu: {error.digest}
        </p>
      )}
      <Button onClick={reset}>Tekrar Dene</Button>
    </div>
  );
}
