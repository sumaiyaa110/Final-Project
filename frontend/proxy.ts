import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PATHS = [
  "/dashboard",
  "/transactions",
  "/alerts",
  "/customers",
  "/devices",
  "/agents",
  "/network",
  "/investigations",
  "/reports",
  "/settings",
  "/profile",
];

export function proxy(request: NextRequest) {
  const session = request.cookies.get("anomalyx_admin_session");

  const isLoggedIn = session?.value === "authenticated";

  const pathname = request.nextUrl.pathname;

  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/login") && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/transactions/:path*",
    "/alerts/:path*",
    "/customers/:path*",
    "/devices/:path*",
    "/agents/:path*",
    "/network/:path*",
    "/investigations/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/login",
  ],
};
