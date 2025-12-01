import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect admin routes (both v1 and v2)
  if (pathname.startsWith("/admin-v2") || pathname.startsWith("/admin")) {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.redirect(new URL("/sign-in", request.url))
    }

    // Role-based access control - admin only
    if (session.user.role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url))
    }
  }

  // Protect profile route (all authenticated users)
  if (pathname.startsWith("/profile")) {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.redirect(new URL("/sign-in", request.url))
    }
  }

  // Redirect authenticated users away from auth pages
  if (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up")) {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (session) {
      return NextResponse.redirect(new URL("/admin", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  runtime: "nodejs",
  matcher: ["/admin/:path*", "/admin-v2/:path*", "/profile/:path*", "/sign-in", "/sign-up"],
}
