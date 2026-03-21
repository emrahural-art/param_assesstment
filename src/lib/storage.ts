import { writeFile, mkdir } from "fs/promises";
import path from "path";

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");

export async function uploadFile(
  file: File,
  directory: string = "resumes"
): Promise<string> {
  const dir = path.join(UPLOAD_DIR, directory);
  await mkdir(dir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  const uniqueName = `${Date.now()}-${file.name}`;
  const filePath = path.join(dir, uniqueName);

  await writeFile(filePath, buffer);

  return `/uploads/${directory}/${uniqueName}`;
}

export function getUploadUrl(relativePath: string): string {
  return relativePath;
}
