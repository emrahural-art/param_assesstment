import Link from "next/link";
import { features } from "@/lib/features-env";

export default function CandidatePortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto max-w-5xl flex h-16 items-center justify-between px-4">
          {features.candidateJobs ? (
            <Link href="/jobs" className="text-lg font-bold">
              Assessment Center
            </Link>
          ) : (
            <span className="text-lg font-bold">Assessment Center</span>
          )}
          <nav className="flex items-center gap-4 text-sm">
            {features.candidateJobs && (
              <Link
                href="/jobs"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Açık Pozisyonlar
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t bg-background py-6">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Assessment Center. Tüm hakları saklıdır.
        </div>
      </footer>
    </div>
  );
}
