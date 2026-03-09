import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protect authenticated areas and admin routes
export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const token = request.cookies.get("token")?.value;
	const userRole = request.cookies.get("userRole")?.value;

	const isAuthRoute =
		pathname.startsWith("/login") || pathname.startsWith("/signup");
	const isProtected = pathname.startsWith("/dashboard");
	const isAdmin = pathname.startsWith("/admin");

	// Redirect authenticated users away from auth pages
	if (isAuthRoute && token) {
		const url = request.nextUrl.clone();
		url.pathname = userRole === "admin" ? "/admin" : "/dashboard";
		return NextResponse.redirect(url);
	}

	// Require auth for protected routes
	if ((isProtected || isAdmin) && !token) {
		const url = request.nextUrl.clone();
		url.pathname = "/login";
		url.searchParams.set("next", pathname);
		return NextResponse.redirect(url);
	}

	// Require admin role for admin routes
	if (isAdmin && userRole !== "admin") {
		const url = request.nextUrl.clone();
		url.pathname = "/";
		return NextResponse.redirect(url);
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/login", "/signup", "/dashboard/:path*", "/admin/:path*"],
};
