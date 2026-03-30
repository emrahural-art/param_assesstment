import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-4">
      <h2 className="text-4xl font-bold">404</h2>
      <p className="text-muted-foreground max-w-md">
        Aradığınız sayfa bulunamadı. Adres yanlış olabilir veya sayfa kaldırılmış
        olabilir.
      </p>
      <Link href="/">
        <Button variant="outline">Ana Sayfaya Dön</Button>
      </Link>
    </div>
  );
}
