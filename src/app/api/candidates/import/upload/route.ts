import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  parseCsv,
  autoMapColumns,
  mapRowToCandidate,
  type ColumnMappings,
} from "@/lib/google-sheets";
import { bulkCandidateRowSchema } from "@/modules/candidates/schema";
import { bulkCreateCandidates } from "@/modules/candidates/service";
import type { BulkCandidateRow } from "@/modules/candidates/types";

export async function POST(request: Request) {
  try {
    const token = await getToken({ req: request as never, secret: process.env.AUTH_SECRET });
    const userId = token?.sub;

    const contentType = request.headers.get("content-type") ?? "";

    let csvText: string;
    let mappings: ColumnMappings | undefined;
    let previewOnly = false;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      previewOnly = formData.get("preview") === "true";
      const mappingsRaw = formData.get("mappings") as string | null;

      if (!file) {
        return NextResponse.json({ error: "CSV dosyası zorunludur" }, { status: 400 });
      }

      csvText = await file.text();
      if (mappingsRaw) {
        mappings = JSON.parse(mappingsRaw) as ColumnMappings;
      }
    } else {
      const body = await request.json();
      csvText = body.csvText;
      mappings = body.mappings;
      previewOnly = body.preview === true;
    }

    if (!csvText) {
      return NextResponse.json({ error: "CSV verisi boş" }, { status: 400 });
    }

    const allRows = parseCsv(csvText);
    if (allRows.length < 2) {
      return NextResponse.json(
        { error: "CSV boş veya sadece başlık satırı var" },
        { status: 400 },
      );
    }

    const headers = allRows[0];
    const rows = allRows.slice(1);

    if (previewOnly || !mappings) {
      const autoMappings = autoMapColumns(headers);
      const preview = rows.slice(0, 5).map((row) => {
        const obj: Record<string, string> = {};
        headers.forEach((h: string, i: number) => {
          if (row[i]) obj[h] = row[i];
        });
        return obj;
      });

      return NextResponse.json({
        sheetTitle: "CSV Dosyası",
        headers,
        mappings: autoMappings,
        preview,
        totalRows: rows.length,
      });
    }

    const validRows: BulkCandidateRow[] = [];
    const parseErrors: { row: number; message: string }[] = [];

    rows.forEach((row: string[], idx: number) => {
      const mapped = mapRowToCandidate(row, headers, mappings);
      const parsed = bulkCandidateRowSchema.safeParse(mapped);

      if (parsed.success) {
        validRows.push(parsed.data as BulkCandidateRow);
      } else {
        const fieldErrors = parsed.error.flatten().fieldErrors;
        const messages = Object.entries(fieldErrors)
          .map(([k, v]) => `${k}: ${(v as string[]).join(", ")}`)
          .join("; ");
        parseErrors.push({ row: idx + 2, message: messages });
      }
    });

    const result = await bulkCreateCandidates(validRows, userId);

    return NextResponse.json({
      imported: result.imported,
      skipped: result.skipped,
      errors: [
        ...parseErrors.map((e) => ({ row: e.row, message: e.message })),
        ...result.errors,
      ],
      totalProcessed: rows.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "İçe aktarma başarısız";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
