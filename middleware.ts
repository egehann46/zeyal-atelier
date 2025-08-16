import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const method = request.method.toUpperCase();

	const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");
	const isLogin = pathname === "/admin/login";

	const isUploadApi = pathname === "/api/upload";
	const isProductsApi = pathname === "/api/products" || pathname.startsWith("/api/products/");
	const isProductsWrite = isProductsApi && !["GET", "HEAD", "OPTIONS"].includes(method);

	const needsAuth = (isAdminPath && !isLogin) || isUploadApi || isProductsWrite;
	if (!needsAuth) {
		return NextResponse.next();
	}

	const cookie = request.cookies.get("admin_auth");
	if (!cookie || cookie.value !== "1") {
		const url = new URL("/admin/login", request.url);
		// Sadece admin sayfalarına giderken next parametresi ekleyelim
		if (isAdminPath) url.searchParams.set("next", pathname);
		return NextResponse.redirect(url);
	}
	return NextResponse.next();
}

export const config = {
	matcher: [
		"/admin",
		"/admin/:path*",
		"/api/products",
		"/api/products/:path*",
		"/api/upload",
	],
}; 