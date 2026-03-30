"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function CandidatePortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[CandidatePortalError]", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-5xl flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center px-4">
      <h2 className="text-xl font-bold">Bir sorun oluştu</h2>
      <p className="text-muted-foreground max-w-md text-sm">
        Sayfa yüklenirken beklenmeyen bir hata meydana geldi. Lütfen sayfayı
        yenileyin veya daha sonra tekrar deneyin.
      </p>
      <Button onClick={reset}>Tekrar Dene</Button>
    </div>
  );
}
