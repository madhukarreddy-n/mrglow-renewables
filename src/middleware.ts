import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/admin")) return NextResponse.next();
  if (request.nextUrl.pathname.startsWith("/admin/login")) return NextResponse.next();

  const token = request.cookies.get(process.env.AUTH_COOKIE_NAME || "mrglow_session")?.value;
  if (!token || !process.env.AUTH_SECRET) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET));
    return NextResponse.next();
  } catch {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
