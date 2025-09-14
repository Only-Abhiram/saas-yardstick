
import { NextResponse } from "next/server";
import { withCors } from "@/lib/cors";
export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set("token", "", {
    httpOnly: true,
    expires: new Date(0), // expire immediately
    path: "/",
  });
  return withCors(response);
}