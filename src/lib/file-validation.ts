type FileType = "pdf" | "png" | "jpeg" | "gif" | "webp" | "svg";

interface MagicSignature {
  bytes: number[];
  offset?: number;
}

const SIGNATURES: Record<Exclude<FileType, "svg">, MagicSignature[]> = {
  pdf: [{ bytes: [0x25, 0x50, 0x44, 0x46] }], // %PDF
  png: [{ bytes: [0x89, 0x50, 0x4e, 0x47] }],
  jpeg: [{ bytes: [0xff, 0xd8, 0xff] }],
  gif: [{ bytes: [0x47, 0x49, 0x46, 0x38] }], // GIF8
  webp: [
    { bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 }, // RIFF
    { bytes: [0x57, 0x45, 0x42, 0x50], offset: 8 }, // WEBP
  ],
};

function matchesSignature(buf: Uint8Array, sigs: MagicSignature[]): boolean {
  return sigs.every(({ bytes, offset = 0 }) => {
    if (buf.length < offset + bytes.length) return false;
    return bytes.every((b, i) => buf[offset + i] === b);
  });
}

function isSvg(buf: Uint8Array): boolean {
  const head = new TextDecoder("utf-8", { fatal: false })
    .decode(buf.slice(0, 256))
    .trimStart()
    .toLowerCase();
  return head.startsWith("<svg") || head.startsWith("<?xml");
}

/**
 * Validate the first bytes of a file buffer against known magic signatures.
 * Returns true if the buffer matches the expected file type.
 */
export function validateFileSignature(
  buffer: ArrayBuffer | Uint8Array,
  expectedType: FileType,
): boolean {
  const buf =
    buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);

  if (expectedType === "svg") return isSvg(buf);

  const sigs = SIGNATURES[expectedType];
  return sigs ? matchesSignature(buf, sigs) : false;
}

/**
 * Map a MIME type string to its FileType for magic byte validation.
 * Returns undefined for unsupported types.
 */
export function mimeToFileType(mime: string): FileType | undefined {
  const map: Record<string, FileType> = {
    "application/pdf": "pdf",
    "image/png": "png",
    "image/jpeg": "jpeg",
    "image/jpg": "jpeg",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/svg+xml": "svg",
  };
  return map[mime];
}
