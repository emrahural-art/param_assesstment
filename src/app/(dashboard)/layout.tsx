import { Sidebar } from "@/components/shared/sidebar";
import { Header } from "@/components/shared/header";
import { Providers } from "@/components/shared/providers";
import { getFeatureFlags } from "@/lib/features";
import { auth } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [featureFlags, session] = await Promise.all([
    getFeatureFlags(),
    auth(),
  ]);

  return (
    <Providers>
      <div className="flex h-screen overflow-hidden">
        <Sidebar featureFlags={featureFlags} userRole={session?.user?.role} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </Providers>
  );
}
