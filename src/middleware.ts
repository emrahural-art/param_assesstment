import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { features } from "@/lib/features-env";

function featureNotFound() {
  return new NextResponse(null, { status: 404 });
}

function featureForbiddenJson() {
  return NextResponse.json({ error: "Bu özellik devre dışı" }, { status: 403 });
}

function isPublicPath(pathname: string, req: NextRequest): boolean {
  if (pathname === "/login" || pathname === "/register") return true;

  if (pathname === "/jobs" || pathname.startsWith("/jobs/")) {
    return features.candidateJobs;
  }
  if (pathname.startsWith("/apply")) {
    return features.candidateApply;
  }
  if (pathname.startsWith("/exam")) return true;

  if (pathname.startsWith("/api/auth")) return true;
  if (pathname.startsWith("/api/exam")) return true;
  if (pathname === "/api/health") return true;
  if (pathname.startsWith("/api/webhooks")) return true;

  if (pathname === "/api/applications" && req.method === "POST") {
    return features.candidateApply;
  }
  if (pathname === "/api/upload/resume") return true;

  const method = req.method;

  if (pathname.match(/^\/api\/listings\/[^/]+$/) && method === "GET") {
    return features.candidateApply;
  }

  if (pathname.match(/^\/api\/assessments\/[^/]+$/) && method === "GET") {
    return true;
  }

  if (
    pathname.match(/^\/api\/assessments\/[^/]+\/submit$/) &&
    method === "POST"
  ) {
    return true;
  }

  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method;

  if ((pathname === "/jobs" || pathname.startsWith("/jobs/")) && !features.candidateJobs) {
    return featureNotFound();
  }
  if (pathname.startsWith("/apply") && !features.candidateApply) {
    return featureNotFound();
  }
  if (pathname.startsWith("/communication") && !features.communication) {
    return featureNotFound();
  }
  if (pathname.startsWith("/pipeline") && !features.pipeline) {
    return featureNotFound();
  }
  if (pathname.startsWith("/listings") && !features.listings) {
    return featureNotFound();
  }

  if (pathname === "/api/applications" && method === "POST" && !features.candidateApply) {
    return featureForbiddenJson();
  }

  if (pathname.startsWith("/api/communication") && !features.communication) {
    return featureForbiddenJson();
  }

  if (pathname.startsWith("/api/pipeline") && !features.pipeline) {
    return featureForbiddenJson();
  }

  if (pathname.startsWith("/api/listings")) {
    const isCollection = pathname === "/api/listings";
    const isSingle = /^\/api\/listings\/[^/]+$/.test(pathname);
    const isShortlist = /^\/api\/listings\/[^/]+\/shortlist$/.test(pathname);

    if (isCollection) {
      if (method === "GET" || method === "POST") {
        if (!features.listings) {
          return featureForbiddenJson();
        }
      }
    } else if (isShortlist) {
      if (!features.listings) {
        return featureForbiddenJson();
      }
    } else if (isSingle) {
      if (method === "GET") {
        if (!features.candidateApply && !features.listings) {
          return featureForbiddenJson();
        }
      } else if (!features.listings) {
        return featureForbiddenJson();
      }
    } else if (!features.listings) {
      return featureForbiddenJson();
    }
  }

  if (isPublicPath(pathname, req)) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  });

  if (!token?.sub) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Oturum gerekli" }, { status: 401 });
    }
    const login = new URL("/login", req.url);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?|ico)$).*)",
  ],
};
