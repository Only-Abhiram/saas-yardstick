import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
// import bcrypt from "bcryptjs";
import { withCors } from "@/lib/cors";
import { requireAuth } from "@/lib/middleware";
const prisma = new PrismaClient();

export async function POST(req, { params }) {
  const user = await requireAuth(req);
  if (!user) return withCors(NextResponse.redirect(new URL("/login", req.url)));
  // const caller = JSON.parse(req.headers.get("x-user"));

  const data= await req.json();
  
  
  if (user.role !== "Admin") {
    return withCors(NextResponse.json({ message: "Forbidden/ unauthorized",ok:false}, { status: 403 }));
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: user.tenantId },
  });

  if (!tenant || tenant.id !== user.tenantId) {
    return withCors(NextResponse.json({ message: "Tenant not found" ,ok:false}, { status: 404 }));
  }

//   const hashedPassword = await bcrypt.hash("password", 10);

  const newUser = await prisma.user.create({
    data: {
      email :data.email,
      password: "password",
      role:data.role,
      tenantId: tenant.id,
    },
  });

  return withCors(NextResponse.json({
    message: "Added successfully",
    ok:true
  }));
}
