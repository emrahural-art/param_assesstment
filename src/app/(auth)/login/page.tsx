"use client";

import { Suspense, useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LockKeyhole, Mail } from "lucide-react";

function loginErrorMessage(code: string | null): string | null {
  if (!code) return null;
  if (code === "AccessDenied") {
    return "Bu e-posta ile giriş yetkiniz yok. Yöneticinizden davet isteyin.";
  }
  if (code === "Configuration") {
    return "Oturum yapılandırması eksik. Yöneticiye bildirin.";
  }
  if (code === "OAuthAccountNotLinked") {
    return "Bu hesap mevcut bir kullanıcıyla eşleştirilemedi.";
  }
  return "Giriş yapılamadı. Lütfen tekrar deneyin.";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const [callbackUrl, setCallbackUrl] = useState("/");

  useEffect(() => {
    setCallbackUrl(searchParams.get("callbackUrl") ?? "/");
    setOauthError(loginErrorMessage(searchParams.get("error")));
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const result = await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("E-posta veya şifre hatalı");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setGoogleLoading(true);
    try {
      const res = await fetch("/api/auth/oauth-providers");
      const data = (await res.json()) as { google?: boolean };
      if (!data.google) {
        setError(
          "Google girişi yapılandırılmamış. Proje kökündeki .env dosyasına GOOGLE_CLIENT_ID ve GOOGLE_CLIENT_SECRET ekleyin, kaydedin ve npm run dev ile sunucuyu yeniden başlatın."
        );
        setGoogleLoading(false);
        return;
      }
      await signIn("google", { callbackUrl });
    } catch {
      setError("Google girişi başlatılamadı. Bağlantınızı deneyin.");
      setGoogleLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left: Image panel */}
      <div className="hidden lg:flex relative overflow-hidden bg-[#4D008C]">
        <Image
          src="/images/login-bg.png"
          alt="Assessment Center"
          fill
          className="object-cover opacity-90"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#4D008C]/80 to-transparent" />
        <div className="relative z-10 flex flex-col justify-end p-10 text-white">
          <Image
            src="/logos/param.svg"
            alt="Param"
            width={120}
            height={40}
            className="brightness-0 invert mb-6"
          />
          <h1 className="text-xl font-bold leading-tight mb-1">
            Assessment Center
          </h1>
          <p className="text-sm text-white/70">
            İnsan kaynakları süreçlerinizi dijitalleştirin, adaylarınızı değerlendirin.
          </p>
        </div>
      </div>

      {/* Right: Login form */}
      <div className="flex flex-col items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold tracking-tight">Hoş geldiniz</h2>
            <p className="text-sm text-muted-foreground">
              Assessment Center&apos;a giriş yapın
            </p>
          </div>

          {(oauthError || error) && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
              <p className="text-sm text-destructive">{oauthError ?? error}</p>
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            className="w-full h-12 text-sm font-medium gap-3 border-border/80 shadow-sm hover:shadow-md transition-shadow"
            disabled={googleLoading}
            onClick={handleGoogleSignIn}
          >
            {googleLoading ? (
              "Yönlendiriliyor..."
            ) : (
              <>
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google ile devam et
              </>
            )}
          </Button>

          {/* E-posta / şifre formu — şu an gizli; ileride gerekirse hidden kaldırılır. */}
          <div className="hidden">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  veya
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="ornek@param.com.tr"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Şifre</Label>
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-sm font-semibold"
                disabled={loading}
              >
                {loading ? "Giriş yapılıyor..." : "E-posta ile giriş"}
              </Button>
            </form>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Giriş yapmak için Google hesabınızı kullanın.
            Yetkiniz yoksa yöneticinizden davet isteyin.
          </p>

          <div className="flex items-center justify-center gap-6 pt-4">
            <Image src="/logos/param.svg" alt="Param" width={80} height={28} className="opacity-40 hover:opacity-70 transition-opacity" />
            <Image src="/logos/finrota.svg" alt="Finrota" width={80} height={28} className="opacity-40 hover:opacity-70 transition-opacity" />
            <Image src="/logos/kredim.svg" alt="Kredim" width={80} height={28} className="opacity-40 hover:opacity-70 transition-opacity" />
            <Image src="/logos/univera.svg" alt="Univera" width={80} height={28} className="opacity-40 hover:opacity-70 transition-opacity" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm">
          Yükleniyor...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
