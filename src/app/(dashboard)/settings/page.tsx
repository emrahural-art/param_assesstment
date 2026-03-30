import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { db } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getFeatureFlags, getFeatureFlagRows } from "@/lib/features";
import { logger } from "@/lib/logger";
import { FeatureFlagToggles } from "@/components/settings/feature-flag-toggles";
import { roleLabelsTr as roleLabels } from "@/lib/role-labels";

async function getUsers() {
  try {
    return await db.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

async function getKvkkStats() {
  try {
    const [activeCount, archivedCount, anonymizedCount] = await Promise.all([
      db.candidate.count({ where: { status: "ACTIVE" } }),
      db.candidate.count({ where: { status: "ARCHIVED" } }),
      db.candidate.count({ where: { status: "ANONYMIZED" } }),
    ]);
    return { activeCount, archivedCount, anonymizedCount };
  } catch (err) {
    logger.error("Failed to load candidate stats", "settings.page", { error: String(err) });
    return { activeCount: 0, archivedCount: 0, anonymizedCount: 0 };
  }
}

export default async function SettingsPage() {
  const [session, users, kvkk, featureFlags, flagRows] = await Promise.all([
    auth(),
    getUsers(),
    getKvkkStats(),
    getFeatureFlags(),
    getFeatureFlagRows(),
  ]);
  const role = session?.user?.role;
  const isAdmin = role === "SYSTEM_ADMIN" || role === "ADMIN";
  const isSysAdmin = role === "SYSTEM_ADMIN";

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold">Sistem Ayarları</h2>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Oturum rolünüz:</span>
          <Badge variant={isSysAdmin ? "default" : "secondary"}>
            {roleLabels[role ?? ""] ?? role ?? "—"}
          </Badge>
        </div>
      </div>

      {!isSysAdmin && (
        <Card className="border-amber-200 bg-amber-50/80 dark:bg-amber-950/20 dark:border-amber-900">
          <CardContent className="pt-6 text-sm">
            <p className="font-medium text-amber-950 dark:text-amber-100">
              Modül anahtarları ve sistem logları
            </p>
            <p className="mt-1 text-amber-900/90 dark:text-amber-200/90">
              Sol menüdeki modülleri açıp kapatma ve &quot;Sistem Logları&quot; ekranı yalnızca{" "}
              <strong>Sistem Yöneticisi</strong> rolüne açıktır. Hesabınız veritabanında bu rol ile
              tanımlıysa rol bilgisi oturumda otomatik güncellenir; görmüyorsanız bir kez çıkış yapıp
              yeniden giriş yapın veya yöneticiden rol ataması isteyin.
            </p>
          </CardContent>
        </Card>
      )}

      {/* SYSTEM_ADMIN: Feature Flags */}
      {isSysAdmin && (
        <>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Modül Yönetimi</h3>
            <p className="text-sm text-muted-foreground">
              Aşağıdaki anahtarlar sol menüdeki modülleri (Pipeline, İlanlar, İletişim vb.) ve ilgili
              sayfaları gösterir veya gizler. Kapalı modüllere doğrudan URL ile girildiğinde ortam
              değişkeni (NEXT_PUBLIC_*) da açıksa yine erişilebilir; tam kapatma için env ile birlikte
              kullanın.
            </p>
            {flagRows.length === 0 && (
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Veritabanında özellik bayrağı yok. Yerelde:{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">npx prisma db seed</code>{" "}
                çalıştırın.
              </p>
            )}
            <FeatureFlagToggles
              initialFlags={flagRows.map((f) => ({
                id: f.id,
                key: f.key,
                label: f.label,
                description: f.description,
                enabled: f.enabled,
              }))}
            />
          </div>
          <Separator />
        </>
      )}

      {/* User Management */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Kullanıcı Yönetimi</h3>
          {isAdmin && (
            <Link href="/settings/users/new">
              <Button variant="outline" size="sm">
                Kullanıcı davet et
              </Button>
            </Link>
          )}
        </div>

        {users.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Henüz kullanıcı yok. Yönetici Google ile giriş yaparak veya şifreli
              hesapla oturum açarak kullanıcıları davet edebilir.
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-lg border">
            <div className="divide-y">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4"
                >
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">
                      {roleLabels[user.role] ?? user.role}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* KVKK */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">KVKK Uyumu</h3>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-2xl font-bold">{kvkk.activeCount}</p>
              <p className="text-sm text-muted-foreground">Aktif Kayıt</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-2xl font-bold">{kvkk.archivedCount}</p>
              <p className="text-sm text-muted-foreground">Arşivlenmiş</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-2xl font-bold">{kvkk.anonymizedCount}</p>
              <p className="text-sm text-muted-foreground">Anonimleştirilmiş</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Veri Saklama Politikası</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Otomatik Anonimleştirme</p>
                <p className="text-xs text-muted-foreground">
                  730 gün (2 yıl) sonra kişisel veriler otomatik anonimleştirilir
                </p>
              </div>
              <Badge>Aktif</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Onay Yönetimi</p>
                <p className="text-xs text-muted-foreground">
                  Adaylardan KVKK onayı alınmaktadır
                </p>
              </div>
              <Badge>Aktif</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Veri İhracı</p>
                <p className="text-xs text-muted-foreground">
                  Aday talep ettiğinde kişisel verileri dışa aktarılabilir
                </p>
              </div>
              <Badge variant="secondary">Hazır</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Quick Links */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Hızlı Erişim</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featureFlags.communication && (
            <Link href="/communication">
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="pt-6">
                  <p className="font-medium">E-posta Şablonları</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Şablonları düzenle ve yeni şablonlar oluştur
                  </p>
                </CardContent>
              </Card>
            </Link>
          )}
          {featureFlags.pipeline && (
            <Link href="/pipeline">
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="pt-6">
                  <p className="font-medium">Pipeline Aşamaları</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Aday takip sürecini görüntüle
                  </p>
                </CardContent>
              </Card>
            </Link>
          )}
          {isSysAdmin && (
            <Link href="/settings/logs">
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="pt-6">
                  <p className="font-medium">Sistem Logları</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Kullanıcı işlemleri ve hata loglarını incele
                  </p>
                </CardContent>
              </Card>
            </Link>
          )}
          <Link href="/api/health">
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="pt-6">
                <p className="font-medium">Sistem Durumu</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Veritabanı bağlantısı ve uptime bilgisi
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
