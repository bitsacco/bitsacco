import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextAuthRequest } from "next-auth";
import { Routes } from "@/lib/routes";

export default auth((req: NextAuthRequest) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");

  // Define auth routes (flattened)
  const authRoutes = [
    Routes.LOGIN,
    Routes.SIGNUP,
    Routes.RECOVER,
    Routes.AUTH_ERROR,
  ];
  const isAuthRoute = authRoutes.some((route) => nextUrl.pathname === route);

  // Define protected dashboard routes (flattened)
  const dashboardRoutes = [
    Routes.MEMBERSHIP,
    Routes.PERSONAL,
    Routes.CHAMAS,
    Routes.ACCOUNT,
  ];
  const isDashboardRoute = dashboardRoutes.some(
    (route) =>
      nextUrl.pathname === route || nextUrl.pathname.startsWith(route + "/"),
  );

  // Allow API auth routes
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && isLoggedIn) {
    return Response.redirect(new URL(Routes.MEMBERSHIP, nextUrl));
  }

  // Protect dashboard routes
  if (isDashboardRoute && !isLoggedIn) {
    // Preserve the original URL as callback for redirect after login
    const loginUrl = new URL(Routes.LOGIN, nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return Response.redirect(loginUrl);
  }

  return NextResponse.next();
});

// Configure which routes to run middleware on
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
