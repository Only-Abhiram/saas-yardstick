import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { signToken } from "@/lib/auth";
import { withCors } from "@/lib/cors";
const prisma = new PrismaClient();
export async function POST(req) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenant: true },
    });

    if (!user || password !== "password") {
      return withCors(
        NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      );
    }

    const token = signToken({
      userId: user.id,
      role: user.role,
      tenantId: user.tenantId,
      tenantSlug: user.tenant.slug,
    });

    // 🟢 set cookie with token
    const res = NextResponse.json({
      user: {
        email: user.email,
        role: user.role,
        tenant: user.tenant.slug,
      },
    });

    res.cookies.set("token", token, {
      httpOnly: true, // prevent JS access
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60, // 1 hour
    });

    return withCors(res);
  } catch (err) {
    console.error(err);
    return withCors(
      NextResponse.json({ error: "Server error" }, { status: 500 })
    );
  }
}

export function OPTIONS() {
  return withCors(NextResponse.json({}));
}
