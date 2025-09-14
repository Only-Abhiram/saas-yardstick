import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { withCors } from "@/lib/cors";

export async function requireAuth(req) {
  const token = req.cookies.get("token")?.value;

  
  if (!token) {
    return null;
  }

  
  const decoded = verifyToken(token);

  if (!decoded) {
    return null;
  }

  // Attach user info
  return  decoded ;
}
