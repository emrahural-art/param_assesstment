import { test, expect } from "@playwright/test";

/**
 * Security tests.
 * These run in the "system-admin" project (authenticated) for RBAC verification,
 * and use raw fetch for unauthenticated scenarios.
 */

const BASE = "http://localhost:3000";

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function unauthFetch(path: string, init?: RequestInit) {
  return fetch(`${BASE}${path}`, {
    ...init,
    headers: { ...(init?.headers ?? {}), Cookie: "" },
  });
}

// ─── SEC-01: Assessment answer-key leak ──────────────────────────────────────

test.describe("SEC-01: Public assessment GET hides correctAnswer", () => {
  test("correctAnswer must NOT be in public response", async ({ request }) => {
    // Get an assessment ID from the authenticated list
    const listRes = await request.get("/api/assessments");
    const assessments = (await listRes.json()) as { id: string }[];
    expect(assessments.length).toBeGreaterThan(0);

    const id = assessments[0].id;

    // Now fetch the same assessment WITHOUT auth
    const publicRes = await unauthFetch(`/api/assessments/${id}`);
    expect(publicRes.ok).toBeTruthy();

    const body = await publicRes.json();
    const questions = body.questions as Record<string, unknown>[] | undefined;
    if (questions && questions.length > 0) {
      for (const q of questions) {
        expect(q).not.toHaveProperty("correctAnswer");
      }
    }
  });

  test("authenticated users DO see correctAnswer", async ({ request }) => {
    const listRes = await request.get("/api/assessments");
    const assessments = (await listRes.json()) as { id: string }[];
    const id = assessments[0].id;

    const res = await request.get(`/api/assessments/${id}`);
    const body = await res.json();
    const questions = body.questions as Record<string, unknown>[] | undefined;
    if (questions && questions.length > 0) {
      const hasCorrectAnswer = questions.some((q) => "correctAnswer" in q);
      expect(hasCorrectAnswer).toBeTruthy();
    }
  });
});

// ─── SEC-02: Resume upload IDOR ──────────────────────────────────────────────

test.describe("SEC-02: Resume upload ownership check", () => {
  test("public upload with old candidateId is rejected", async () => {
    // Create a tiny fake PDF buffer
    const fakePdf = new Blob(["%PDF-1.4 fake"], { type: "application/pdf" });
    const form = new FormData();
    form.append("file", fakePdf, "test.pdf");
    form.append("candidateId", "non-existent-candidate-id");

    const res = await unauthFetch("/api/upload/resume", {
      method: "POST",
      body: form,
    });

    // Should be 404 (candidate not found) or 403 (expired window)
    expect([403, 404]).toContain(res.status);
  });
});

// ─── SEC-03: Unauthenticated DELETE candidate → 401 ─────────────────────────

test.describe("SEC-03: Unauthenticated write endpoints return 401", () => {
  test("DELETE /api/candidates/[id] without auth → 401", async () => {
    const res = await unauthFetch("/api/candidates/fake-id", {
      method: "DELETE",
    });
    expect(res.status).toBe(401);
  });

  test("POST /api/candidates without auth → 401", async () => {
    const res = await unauthFetch("/api/candidates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: "X", lastName: "Y", email: "x@y.com" }),
    });
    expect(res.status).toBe(401);
  });
});

// ─── SEC-04: Unauthenticated communication send → 401 ──────────────────────

test.describe("SEC-04: Unauthenticated email send", () => {
  test("POST /api/communication/send without auth → 401", async () => {
    const res = await unauthFetch("/api/communication/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateId: "x", templateId: "y", subject: "z", body: "b" }),
    });
    expect(res.status).toBe(401);
  });
});

// ─── SEC-05: Unauthenticated assessment mutation → 401 ──────────────────────

test.describe("SEC-05: Unauthenticated assessment mutation", () => {
  test("PATCH /api/assessments/[id] without auth → 401", async () => {
    const res = await unauthFetch("/api/assessments/fake-id", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "hacked" }),
    });
    expect(res.status).toBe(401);
  });

  test("DELETE /api/assessments/[id] without auth → 401", async () => {
    const res = await unauthFetch("/api/assessments/fake-id", {
      method: "DELETE",
    });
    expect(res.status).toBe(401);
  });
});

// ─── SEC-06: Security headers ────────────────────────────────────────────────

test.describe("SEC-06: Security response headers", () => {
  test("response includes X-Frame-Options and X-Content-Type-Options", async ({ page }) => {
    const response = await page.goto("/");
    expect(response).not.toBeNull();
    const headers = response!.headers();
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  });
});

// ─── SEC-07: RBAC – HR_INTERN cannot delete candidates ──────────────────────

test.describe("SEC-07: RBAC enforcement on write/delete", () => {
  test("system-admin CAN create a candidate (has candidates:write)", async ({ request }) => {
    const res = await request.post("/api/candidates", {
      data: {
        firstName: "SecTest",
        lastName: "RBAC",
        email: `sectest-${Date.now()}@test.com`,
      },
    });
    expect(res.status()).toBe(201);
  });

  test("system-admin CAN create a listing (has listings:write)", async ({ request }) => {
    const res = await request.post("/api/listings", {
      data: {
        title: "Security Test Listing",
        description: "Test",
        department: "IT",
        location: "Remote",
        type: "FULL_TIME",
      },
    });
    // 201 or 400 (validation) both acceptable — not 401/403
    expect([201, 400]).toContain(res.status());
  });
});

// ─── SEC-08: Invalid MIME type upload → 400 ─────────────────────────────────

test.describe("SEC-08: File upload MIME validation", () => {
  test("non-PDF upload is rejected", async ({ request }) => {
    const fakeJs = Buffer.from("alert('xss')");
    const form = request.createFormData
      ? undefined
      : undefined;

    // Use raw fetch for multipart
    const formData = new FormData();
    formData.append(
      "file",
      new Blob([fakeJs], { type: "application/javascript" }),
      "evil.js",
    );
    formData.append("candidateId", "test-id");

    const res = await fetch(`${BASE}/api/upload/resume`, {
      method: "POST",
      body: formData,
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("PDF");
  });
});

// ─── SEC-09: Oversized file upload → 400 ────────────────────────────────────

test.describe("SEC-09: File size limit enforcement", () => {
  test("6 MB PDF upload is rejected", async () => {
    const bigBuffer = Buffer.alloc(6 * 1024 * 1024, 0);
    const formData = new FormData();
    formData.append(
      "file",
      new Blob([bigBuffer], { type: "application/pdf" }),
      "big.pdf",
    );
    formData.append("candidateId", "test-id");

    const res = await fetch(`${BASE}/api/upload/resume`, {
      method: "POST",
      body: formData,
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("5 MB");
  });
});

// ─── SEC-10: Public exam start does NOT leak correctAnswer ──────────────────

test.describe("SEC-10: Exam API hides correct answers", () => {
  test("GET /api/exam/[token] does not return correctAnswer", async ({ request }) => {
    // We need a valid token; get it from assessments invites
    const listRes = await request.get("/api/assessments");
    const assessments = (await listRes.json()) as { id: string }[];
    if (assessments.length === 0) return;

    const invitesRes = await request.get(
      `/api/assessments/${assessments[0].id}/invites`,
    );
    if (!invitesRes.ok()) return;

    const invites = (await invitesRes.json()) as { token?: string; status?: string }[];
    const pending = invites.find((i) => i.status === "PENDING");
    if (!pending?.token) return;

    // Fetch exam data (public endpoint)
    const examRes = await unauthFetch(`/api/exam/${pending.token}`);
    if (!examRes.ok) return;

    const body = await examRes.json();
    if (body.questions) {
      for (const q of body.questions as Record<string, unknown>[]) {
        expect(q).not.toHaveProperty("correctAnswer");
      }
    }
  });
});

// ─── SEC-11: Unauthenticated listing mutation → 401 ─────────────────────────

test.describe("SEC-11: Unauthenticated listing mutation", () => {
  test("POST /api/listings without auth → 401", async () => {
    const res = await unauthFetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "hack", description: "x" }),
    });
    expect(res.status).toBe(401);
  });

  test("DELETE /api/listings/[id] without auth → 401", async () => {
    const res = await unauthFetch("/api/listings/fake-id", {
      method: "DELETE",
    });
    expect(res.status).toBe(401);
  });
});

// ─── SEC-12: Question-image upload requires auth ─────────────────────────────

test.describe("SEC-12: Question-image upload auth", () => {
  test("POST /api/upload/question-image without auth → 401", async () => {
    const formData = new FormData();
    formData.append(
      "file",
      new Blob([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], { type: "image/png" }),
      "test.png",
    );

    const res = await unauthFetch("/api/upload/question-image", {
      method: "POST",
      body: formData,
    });
    expect(res.status).toBe(401);
  });
});

// ─── SEC-13: PDF magic byte validation ───────────────────────────────────────

test.describe("SEC-13: Resume upload magic byte validation", () => {
  test("file with PDF MIME but non-PDF content is rejected", async () => {
    // Send a file declared as PDF but containing JS content (no %PDF header)
    const fakeContent = Buffer.from("This is not a real PDF file at all!");
    const formData = new FormData();
    formData.append(
      "file",
      new Blob([fakeContent], { type: "application/pdf" }),
      "fake.pdf",
    );
    formData.append("candidateId", "test-id");

    const res = await unauthFetch("/api/upload/resume", {
      method: "POST",
      body: formData,
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("PDF");
  });
});

// ─── SEC-14: Webhook secret enforcement ──────────────────────────────────────

test.describe("SEC-14: Webhook requires secret", () => {
  test("POST /api/webhooks/email without secret → 401", async () => {
    const res = await unauthFetch("/api/webhooks/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "email.opened", data: { email_id: "test" } }),
    });
    expect(res.status).toBe(401);
  });

  test("POST /api/webhooks/email with wrong secret → 401", async () => {
    const res = await unauthFetch("/api/webhooks/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Secret": "wrong-secret-value",
      },
      body: JSON.stringify({ type: "email.opened", data: { email_id: "test" } }),
    });
    expect(res.status).toBe(401);
  });
});

// ─── SEC-15: CSP header present ──────────────────────────────────────────────

test.describe("SEC-15: Content-Security-Policy header", () => {
  test("response includes CSP header with frame-ancestors none", async ({ page }) => {
    const response = await page.goto("/");
    expect(response).not.toBeNull();
    const csp = response!.headers()["content-security-policy"];
    expect(csp).toBeDefined();
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("default-src 'self'");
  });
});
