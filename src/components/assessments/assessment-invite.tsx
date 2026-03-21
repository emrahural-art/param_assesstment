"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface AssessmentInviteProps {
  assessmentId: string;
}

export function AssessmentInvite({ assessmentId }: AssessmentInviteProps) {
  const [copied, setCopied] = useState(false);

  const examUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/exam/${assessmentId}`
      : `/exam/${assessmentId}`;

  function copyLink() {
    navigator.clipboard.writeText(examUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sınav Linki</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Bu linki adaylara göndererek sınava girmelerini sağlayabilirsiniz.
          </p>
          <div className="flex gap-2">
            <Input value={examUrl} readOnly className="font-mono text-sm" />
            <Button variant="outline" onClick={copyLink}>
              {copied ? "Kopyalandı!" : "Kopyala"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">E-posta ile Davet</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              const email = form.get("email") as string;
              if (!email) return;

              alert(
                `${email} adresine sınav daveti gönderilecek.\n\n(E-posta servisi yapılandırıldığında aktif olacaktır.)`
              );
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="email">Aday E-posta Adresi</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="aday@example.com"
                />
                <Button type="submit">Davet Gönder</Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
