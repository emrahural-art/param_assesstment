import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { db } from "@/lib/prisma";

const roleLabels: Record<string, string> = {
  ADMIN: "Yönetici",
  HR_MANAGER: "İK Müdürü",
  HR_SPECIALIST: "İK Uzmanı",
  HR_INTERN: "İK Stajyeri",
};

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
  } catch {
    return { activeCount: 0, archivedCount: 0, anonymizedCount: 0 };
  }
}

export default async function SettingsPage() {
  const [users, kvkk] = await Promise.all([getUsers(), getKvkkStats()]);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Sistem Ayarları</h2>

      {/* User Management */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Kullanıcı Yönetimi</h3>
          <Link href="/settings/users/new">
            <Button variant="outline" size="sm">
              Kullanıcı Ekle
            </Button>
          </Link>
        </div>

        {users.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Henüz kullanıcı yok. İlk kullanıcıyı kayıt sayfasından
              oluşturabilirsiniz.
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
