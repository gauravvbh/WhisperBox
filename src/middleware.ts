import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";



export async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.JWT_SECRET });

    const path = req.nextUrl;

    if (token && (
        path.pathname.startsWith('/sign-up') ||
        path.pathname.startsWith('/sign-in') ||
        path.pathname.startsWith('/verify')
    )) {
        return NextResponse.redirect(new URL(`/dashboard`, req.url))
    }

    if (!token && path.pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/sign-in', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/sign-in', '/sign-up', '/', '/verify/:path*'],
};