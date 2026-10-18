import NextAuth from "next-auth";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthRoute = req.nextUrl.pathname === "/";
  const isDashboardRoute = req.nextUrl.pathname.startsWith("/dashboard");

  // If user is already logged in and tries to access the Login/Signup page
  if (isLoggedIn && isAuthRoute) {
    return Response.redirect(new URL("/dashboard", req.nextUrl));
  }

  // If user is NOT logged in and tries to access ANY dashboard route
  if (!isLoggedIn && isDashboardRoute) {
    return Response.redirect(new URL("/", req.nextUrl));
  }

  // Edge-level RBAC: Only active ADMINs can access /dashboard/users
  if (isLoggedIn && req.nextUrl.pathname.startsWith("/dashboard/users")) {
    const userRole = (req.auth?.user as any)?.role;
    if (userRole !== "ADMIN") {
      return Response.redirect(new URL("/dashboard", req.nextUrl));
    }
  }

  return undefined;
});

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
