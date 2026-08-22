import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";
import { requireApiPermission } from "@/lib/auth/api";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { getObjectStream } from "@/lib/storage";

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  pdf: "application/pdf",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

export async function GET(_req: NextRequest, { params }: { params: Promise<{ key: string[] }> }) {
  const auth = await requireApiPermission(PERMISSIONS.LEADS_READ);
  if (auth.response) return auth.response;
  const { key: parts } = await params;
  const key = parts.map(decodeURIComponent).join("/");
  if (key.includes("..")) return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  const stream = await getObjectStream(key);
  if (!stream) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const ext = key.split(".").pop()?.toLowerCase() || "";
  const web = Readable.toWeb(stream) as ReadableStream;
  return new NextResponse(web, {
    headers: {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": "private, max-age=60",
    },
  });
}
