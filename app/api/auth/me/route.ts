import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const payload = await verifySessionToken(token);
  if (!payload) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  return NextResponse.json({
    user: {
      id: payload.id,
      email: payload.email,
      fullName: payload.fullName,
      role: payload.role,
    },
  });
}
