// middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// =======================================
// MAIN MIDDLEWARE
// =======================================

const DEMO_USERNAME = "demo_student";

const PUBLIC_PATHS = ["/sign-in", "/sign-up", "/forgot-password"];

export default clerkMiddleware(async (auth, request) => {
  const { userId, sessionClaims } = await auth();
  const pathname = request.nextUrl.pathname;

  const response = NextResponse.next();
  response.headers.set(
    "x-current-path",
    request.nextUrl.pathname + request.nextUrl.search,
  );

  // 🔒 Demo-only access, but skip for public paths like /sign-in
  if (
    !PUBLIC_PATHS.includes(pathname) &&
    (!userId || sessionClaims?.username !== DEMO_USERNAME)
  ) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // 🎯 Redirect /dashboard to user-specific dashboard
  if (pathname === "/dashboard" && userId) {
    const redirectUrl = new URL(
      `/user/${userId}/usertype/student/dashboard`,
      request.url,
    );
    return NextResponse.redirect(redirectUrl);
  }

  return response;
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
