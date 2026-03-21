import Link from "next/link";
import { getEmailTemplates } from "@/modules/communication/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const typeLabels: Record<string, string> = {
  POSITIVE: "Olumlu Dönüş",
  NEGATIVE: "Olumsuz Dönüş",
  INVITATION: "Davet",
  TEST_INVITE: "Test Daveti",
  CUSTOM: "Özel",
};

const typeColors: Record<string, "default" | "secondary" | "destructive"> = {
  POSITIVE: "default",
  NEGATIVE: "destructive",
  INVITATION: "secondary",
  TEST_INVITE: "secondary",
  CUSTOM: "secondary",
};

export default async function CommunicationPage() {
  let templates: Awaited<ReturnType<typeof getEmailTemplates>> = [];
  try {
    templates = await getEmailTemplates();
  } catch {
    // DB not available
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">İletişim Merkezi</h2>
        <div className="flex gap-2">
          <Link href="/communication/send">
            <Button>E-posta Gönder</Button>
          </Link>
          <Link href="/communication/logs">
            <Button variant="outline">Gönderim Logları</Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">E-posta Şablonları</h3>
        <Link href="/communication/templates/new">
          <Button variant="outline" size="sm">
            Yeni Şablon
          </Button>
        </Link>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Henüz şablon oluşturulmamış.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Link
              key={template.id}
              href={`/communication/templates/${template.id}`}
            >
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base line-clamp-1">
                      {template.name}
                    </CardTitle>
                    <Badge variant={typeColors[template.type]}>
                      {typeLabels[template.type] ?? template.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Konu: {template.subject}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {template.body.replace(/<[^>]*>/g, "").slice(0, 100)}...
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
