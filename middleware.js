import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export default async function middleware(req) {
  const { pathname } = req.nextUrl;
  console.log(pathname);
  if(pathname.includes("/me")) return NextResponse.next();
  const token = req.cookies.get("token")?.value;
  console.log(token);
  
  // protected routes
  const protectedRoutes = ["/dashboard", "/notes"];
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  let user = null;
  if (token) {
    const decoded = await verifyToken(token);
    if (decoded) user = decoded;
  }

  if (isProtected) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Redirect logged-in user away from login
  if (pathname === "/login" && user) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

   const res = NextResponse.next();
   
  // Attach user info in a header as JSON string
  if (user) {
    console.log(user);
    res.headers.set("x-user", JSON.stringify(user));
  }
  
  console.log("middleware called");
  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/notes/:path*", "/login"],
  runtime: "nodejs",
};
