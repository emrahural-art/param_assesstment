import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isSystemAdmin } from "@/lib/permissions";
import { LogViewer } from "@/components/settings/log-viewer";

export default async function LogsPage() {
  const session = await auth();
  if (!session?.user || !isSystemAdmin(session.user.role)) {
    redirect("/settings");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Sistem Logları</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Kullanıcı işlemleri ve sistem loglarını görüntüleyin
        </p>
      </div>
      <LogViewer />
    </div>
  );
}
