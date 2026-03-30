const COLUMN_ALIASES: Record<string, string[]> = {
  firstName: ["ad", "isim", "first name", "firstname", "adı", "adi"],
  lastName: ["soyad", "soyadı", "soyadi", "last name", "lastname", "surname"],
  email: ["e-posta", "eposta", "email", "mail", "e-mail"],
  phone: ["telefon", "tel", "phone", "gsm", "cep"],
  company: ["şirket", "sirket", "company", "firma", "kurum"],
  position: ["pozisyon", "ünvan", "unvan", "position", "title", "görev", "gorev"],
  department: ["departman", "bölüm", "bolum", "birim", "department", "dept"],
  note: ["not", "açıklama", "aciklama", "note", "notes", "yorum"],
};

export function parseSheetUrl(url: string): {
  spreadsheetId: string;
  gid?: string;
} {
  const patterns = [
    /\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/,
  ];

  let spreadsheetId = "";
  for (const p of patterns) {
    const m = url.match(p);
    if (m) {
      spreadsheetId = m[1];
      break;
    }
  }

  if (!spreadsheetId) {
    throw new Error("Geçerli bir Google Sheets URL'si giriniz");
  }

  const gidMatch = url.match(/[#&]gid=(\d+)/);
  return { spreadsheetId, gid: gidMatch?.[1] };
}

export function autoMapColumns(
  headers: string[],
): Record<string, string | null> {
  const mappings: Record<string, string | null> = {};

  for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
    mappings[field] = null;
    for (const header of headers) {
      const normalized = header.toLowerCase().trim();
      if (aliases.includes(normalized) || normalized === field.toLowerCase()) {
        mappings[field] = header;
        break;
      }
    }
  }

  return mappings;
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let current = "";
  let inQuotes = false;
  let row: string[] = [];

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(current);
        current = "";
      } else if (ch === "\n" || (ch === "\r" && next === "\n")) {
        row.push(current);
        current = "";
        if (row.some((cell) => cell.trim())) rows.push(row);
        row = [];
        if (ch === "\r") i++;
      } else {
        current += ch;
      }
    }
  }

  if (current || row.length > 0) {
    row.push(current);
    if (row.some((cell) => cell.trim())) rows.push(row);
  }

  return rows;
}

/**
 * Public CSV export — API key gerektirmez.
 * Sheet "Bağlantıya sahip olan herkes görüntüleyebilir" olmalıdır.
 */
export async function fetchSheetData(
  spreadsheetId: string,
  gid?: string,
): Promise<{ headers: string[]; rows: string[][]; sheetTitle: string }> {
  const exportUrl = new URL(
    `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export`,
  );
  exportUrl.searchParams.set("format", "csv");
  if (gid) exportUrl.searchParams.set("gid", gid);

  const res = await fetch(exportUrl.toString(), { redirect: "follow" });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("Sheet bulunamadı. URL'yi kontrol edin.");
    }
    if (res.status === 403 || res.status === 401) {
      throw new Error(
        'Sheet erişilemedi. Paylaşım ayarını "Bağlantıya sahip olan herkes görüntüleyebilir" yapın.',
      );
    }
    throw new Error(`Sheet okunamadı (HTTP ${res.status})`);
  }

  const text = await res.text();
  const allRows = parseCsv(text);

  if (allRows.length < 2) {
    throw new Error("Sheet boş veya sadece başlık satırı var");
  }

  const headers = allRows[0];
  const rows = allRows.slice(1);

  const sheetTitle = gid ? `Sheet (gid=${gid})` : "Sheet1";

  return { headers, rows, sheetTitle };
}

export type ColumnMappings = Record<string, string | null>;

export function mapRowToCandidate(
  row: string[],
  headers: string[],
  mappings: ColumnMappings,
): Record<string, string> {
  const candidate: Record<string, string> = {};

  for (const [field, headerName] of Object.entries(mappings)) {
    if (!headerName) continue;
    const idx = headers.indexOf(headerName);
    if (idx >= 0 && row[idx]) {
      candidate[field] = row[idx].trim();
    }
  }

  return candidate;
}
