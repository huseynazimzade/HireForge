import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { saveUser, findUserByEmail } from "@/lib/users";
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/auth";

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["HR", "Candidate"]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const errorMsg = parsed.error.errors[0]?.message || "Invalid input";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { fullName, email, password, role } = parsed.data;

    const existing = findUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "EMAIL_ALREADY_USED" }, { status: 409 });
    }

    const newUser = saveUser({
      fullName,
      email,
      passwordPlain: password,
      role,
    });

    const token = await createSessionToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      fullName: newUser.fullName,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
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
      { error: error?.message || "Registration failed" },
      { status: 500 }
    );
  }
}
