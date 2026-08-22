import { createReadStream, existsSync, readFileSync } from "fs";
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { Readable } from "stream";

const LOCAL_DIR = path.join(process.cwd(), "uploads");

export function localFilePath(key: string) {
  return path.join(LOCAL_DIR, key);
}

export async function putObject(key: string, body: Buffer, _contentType: string) {
  if (process.env.STORAGE_DRIVER === "s3" && process.env.AWS_S3_BUCKET) {
    throw new Error("S3 driver is configured; wire AWS SDK in production.");
  }
  const full = path.join(LOCAL_DIR, key);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, body);
  return key;
}

export async function getObjectStream(key: string): Promise<Readable | null> {
  const full = path.join(LOCAL_DIR, key);
  if (!existsSync(full)) return null;
  return createReadStream(full);
}

export async function getObjectBuffer(key: string): Promise<Buffer | null> {
  const full = path.join(LOCAL_DIR, key);
  if (!existsSync(full)) return null;
  return readFileSync(full);
}

export async function deleteObject(key: string) {
  const full = path.join(LOCAL_DIR, key);
  if (existsSync(full)) await unlink(full);
}

export function publicUploadPath(key: string) {
  return `/api/files/${key.split("/").map(encodeURIComponent).join("/")}`;
}
