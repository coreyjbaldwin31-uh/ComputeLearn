import { auth } from "@/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (
    pathname === "/" ||
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/api/auth")
  ) {
    return;
  }

  // Protect academy routes — redirect unauthenticated users to sign-in
  if (!req.auth) {
    const signInUrl = new URL("/api/auth/signin", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", req.url);
    return Response.redirect(signInUrl);
  }
});

export const config = {
  matcher: ["/(academy)(.*)", "/api/((?!auth|health).*)"],
};
