import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  parseSheetUrl,
  fetchSheetData,
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

    const body = await request.json();
    const { sheetUrl, mappings } = body as {
      sheetUrl?: string;
      mappings?: ColumnMappings;
    };

    if (!sheetUrl || !mappings) {
      return NextResponse.json(
        { error: "sheetUrl ve mappings zorunludur" },
        { status: 400 },
      );
    }

    const { spreadsheetId, gid } = parseSheetUrl(sheetUrl);
    const { headers, rows } = await fetchSheetData(spreadsheetId, gid);

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
        ...parseErrors.map((e) => ({
          row: e.row,
          message: e.message,
        })),
        ...result.errors,
      ],
      totalProcessed: rows.length,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "İçe aktarma başarısız";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
