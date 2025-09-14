import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { withCors } from "@/lib/cors";
export async function GET(req) {
   
   
  const token = req.headers.get("cookie")?.match(/token=([^;]+)/)?.[1];

  console.log("came to /api/me")
  console.log(token)
  if (!token) {
    console.log("no token")
    return withCors(NextResponse.json({ authenticated: false }, { status: 401 }));
    
  }

  try {
    const data = await verifyToken(token);
    if (!data) {
      console.log("no data")
      return withCors(NextResponse.json({ ok: false }, { status: 401 }));
    }
    return withCors(NextResponse.json({ ok: true, user: data }));
  } catch {
    console.log("data")
    return withCors(NextResponse.json({ ok: false , token:token}, { status: 401 }));
  }
}
