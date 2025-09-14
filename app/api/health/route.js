import { NextResponse } from "next/server";
import { withCors } from "@/lib/cors";
export async function GET() {
  return withCors(NextResponse.json({ status: "ok" }));
}