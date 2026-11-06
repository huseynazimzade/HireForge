import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose/jwt/verify";
import { SESSION_COOKIE_NAME } from "@/lib/auth";

const getSecretKey = () => {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret === "change_me_to_a_long_random_string") {
    return new TextEncoder().encode("hireforge_super_secure_secret_signing_key_2026_jwt_token_auth");
  }
  return new TextEncoder().encode(secret);
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  let session: { id: string; email: string; role: string; fullName: string } | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, getSecretKey());
      session = payload as any;
    } catch {
      session = null;
    }
  }

  // Check API route protection
  if (pathname.startsWith("/api/analyze")) {
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Check HR & Candidate pages protection
  if (pathname.startsWith("/hr") || pathname.startsWith("/candidate")) {
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-based access redirection
    if (session.role === "HR" && pathname.startsWith("/candidate")) {
      return NextResponse.redirect(new URL("/hr", req.url));
    }

    if (session.role === "Candidate" && pathname.startsWith("/hr")) {
      return NextResponse.redirect(new URL("/candidate", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/hr/:path*", "/candidate/:path*", "/api/analyze"],
};
