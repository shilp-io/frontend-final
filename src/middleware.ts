// src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = [
    '/',
    '/login',
    '/register',
    '/contact',
    '/about',
    '/pricing',
];
const AUTH_ROUTES = ['/login', '/register'];
const PROTECTED_ROUTES = [
    '/dashboard',
    '/projects',
    '/requirements',
    '/collections',
    '/settings',
];

export async function middleware(request: NextRequest) {
    const res = NextResponse.next();

    // Get Firebase token from cookie
    const firebaseToken = request.cookies.get('token')?.value;
    const userRole = request.cookies.get('user-role')?.value || 'user';

    const pathname = request.nextUrl.pathname;

    // Add a longer delay to allow Firebase to initialize (500ms)
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Skip middleware for API routes
    if (
        pathname.startsWith('/api/') ||
        PUBLIC_ROUTES.some((route) => pathname.startsWith(route))
    ) {
        return res;
    }

    // Handle protected routes - require Firebase auth
    if (
        !firebaseToken &&
        PROTECTED_ROUTES.some((route) => pathname.startsWith(route))
    ) {
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(redirectUrl);
    }

    // Handle auth routes when user is already logged in
    if (
        firebaseToken &&
        AUTH_ROUTES.some((route) => pathname.startsWith(route))
    ) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Update headers if user is authenticated
    if (firebaseToken) {
        res.headers.set('x-firebase-token', firebaseToken);
        res.headers.set('x-user-role', userRole);
    }

    return res;
}

export const config = {
    matcher: [
        // Protected routes
        '/dashboard/:path*',
        '/projects/:path*',
        '/requirements/:path*',
        '/collections/:path*',
        '/settings/:path*',
        // Auth routes
        '/login',
        '/register',
        // Public routes that need session info
        '/',
        '/about',
        '/contact',
    ],
};
