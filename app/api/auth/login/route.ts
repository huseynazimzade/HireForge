import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { findUserByEmail } from "@/lib/users";
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_CREDENTIALS" }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const user = findUserByEmail(email);

    if (!user) {
      return NextResponse.json({ error: "INVALID_CREDENTIALS" }, { status: 401 });
    }

    const isValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "INVALID_CREDENTIALS" }, { status: 401 });
    }

    const token = await createSessionToken({
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_MAX_AGE_SECONDS,
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Login failed" },
      { status: 500 }
    );
  }
}
