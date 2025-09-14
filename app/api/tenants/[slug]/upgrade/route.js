import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

import { requireAuth } from "@/lib/middleware";
const prisma = new PrismaClient();

export async function POST(req, { params }) {
  const user = await requireAuth(req);

  if (!user) return withCors(NextResponse.redirect(new URL("/login", req.url)));
  
  


  if (user.role !== "Admin") {
    return withCors(NextResponse.json({ message: "Forbidden" , ok:false}, { status: 403 }));
  }

  const tenant = await prisma.tenant.findUnique({
    where: { slug: user.tenantSlug },
  });

  if (!tenant) {
    return withCors(NextResponse.json({ message: "Tenant not found", ok :false }, { status: 404 }));
  }

  if (tenant.id !== user.tenantId) {
    return withCors(NextResponse.json({ message: "Forbidden" , ok:false}, { status: 403 }));
  }

  const updated = await prisma.tenant.update({
    where: { id: tenant.id },
    data: { plan: "PRO" },
  });

  return withCors(NextResponse.json({ message: "Tenant upgraded", tenant: updated , ok:true}, {status:200}));
}
