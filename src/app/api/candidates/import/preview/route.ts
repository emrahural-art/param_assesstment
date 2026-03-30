import { NextResponse } from "next/server";
import {
  parseSheetUrl,
  fetchSheetData,
  autoMapColumns,
} from "@/lib/google-sheets";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sheetUrl } = body as { sheetUrl?: string };

    if (!sheetUrl) {
      return NextResponse.json(
        { error: "sheetUrl zorunludur" },
        { status: 400 },
      );
    }

    const { spreadsheetId, gid } = parseSheetUrl(sheetUrl);
    const { headers, rows, sheetTitle } = await fetchSheetData(spreadsheetId, gid);
    const mappings = autoMapColumns(headers);

    const preview = rows.slice(0, 5).map((row) => {
      const obj: Record<string, string> = {};
      headers.forEach((h: string, i: number) => {
        if (row[i]) obj[h] = row[i];
      });
      return obj;
    });

    return NextResponse.json({
      sheetTitle,
      headers,
      mappings,
      preview,
      totalRows: rows.length,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Sheet okunamadı";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
