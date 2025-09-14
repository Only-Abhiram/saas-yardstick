import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withCors } from "@/lib/cors";
import { requireAuth } from "@/lib/middleware";


const prisma = new PrismaClient();

export async function GET(req, { params }) {
  const noteId= await params.id;
  const user = await requireAuth(req);// if unauthorized, return response

  if (!user) return withCors(NextResponse.json({Error:"unauthorized", status:401}));
  

  const note = await prisma.note.findUnique({
    where: { id: noteId },
  });

  if (!note || note.tenantId !== user.tenantId) {
    return withCors(NextResponse.json({ error: "Not found" }, { status: 404 }));
  }
  console.log(note);

  return withCors(NextResponse.json(note));
}

export async function PUT(req, { params }) {
  const noteId= await params.id;
  const user = await requireAuth(req);

  if (!user) return withCors(NextResponse.json({Error:"unauthorized", status:401}));

  const data = await req.json();

  const note = await prisma.note.findUnique({ where: { id: noteId } });
  if (!note || note.tenantId !== user.tenantId) {
    return withCors(NextResponse.json({ error: "Not found" }, { status: 404 }));
  }

  const updated = await prisma.note.update({
    where: { id: noteId },
    data,
  });

  return withCors(NextResponse.json(updated));
}

export async function DELETE(req, { params }) {
  const noteId= await params.id;
  const user = await requireAuth(req);// if unauthorized, return response

  if (!user) return withCors(NextResponse.json({Error:"unauthorized", status:401}));
  // const user = JSON.parse(req.headers.get("x-user"));  

  const note = await prisma.note.findUnique({ where: { id: noteId } });
  if (!note || note.tenantId !== user.tenantId) {
    return withCors(NextResponse.json({ error: "Not found" }, { status: 404 }));
  }

  await prisma.note.delete({ where: { id: noteId } });
  return withCors(NextResponse.json({ success: true }));
}
