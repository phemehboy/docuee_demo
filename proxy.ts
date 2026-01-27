// middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const DEMO_USERNAME = "demo_student";

const PUBLIC_PATH_PREFIXES = ["/sign-in", "/sign-up", "/forgot-password"];

export default clerkMiddleware(async (auth, request) => {
  const { userId, sessionClaims } = await auth();
  const pathname = request.nextUrl.pathname;

  const response = NextResponse.next();
  response.headers.set(
    "x-current-path",
    request.nextUrl.pathname + request.nextUrl.search,
  );

  const isPublicPath = PUBLIC_PATH_PREFIXES.some((path) =>
    pathname.startsWith(path),
  );

  // 🔒 Demo-only access (skip auth pages completely)
  if (!isPublicPath && userId && sessionClaims?.username !== DEMO_USERNAME) {
    return NextResponse.redirect(
      new URL("/sign-in?demo_only=true", request.url),
    );
  }

  // 🎯 Redirect /dashboard to user-specific dashboard
  if (pathname === "/dashboard" && userId) {
    return NextResponse.redirect(
      new URL(`/user/${userId}/usertype/student/dashboard`, request.url),
    );
  }

  return response;
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
