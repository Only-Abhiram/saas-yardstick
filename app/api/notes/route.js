import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "@/lib/middleware";
import { withCors } from "@/lib/cors";
import { unauthorized } from "next/navigation";
const prisma = new PrismaClient();

export async function GET(req) {
  // const auth = await requireAuth(req);
  // if (auth instanceof NextResponse) return auth; // if unauthorized, return response

  const user = await requireAuth(req);
  if (!user){
    return NextResponse.json({Error:"Unauthorized access", status:401})
  }
  console.log(user)
  // const user = JSON.parse(req.headers.get("x-user"));
  try{
    const notes = await prisma.note.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { createdAt: "desc" },
    });
  
    return NextResponse.json(notes);
  }catch(e){
    return NextResponse.json({
      error:e,
      line:"Error dude..!"
    })
  }
  
}

export async function POST(req) {
  // if (auth instanceof NextResponse) return auth; // if unauthorized, return response
  console.log("got meee...")
  const user = await requireAuth(req);
  if (!user){
    return withCors(NextResponse.json({Error:"Unauthorized access", status:401}));
  }
  console.log( user)
  const data = await req.json();
  console.log(data)
  // Check Free plan limit
  const tenant = await prisma.tenant.findUnique({
    where: { id: user.tenantId },
    include: { notes: true },
  });

  if (tenant.plan === "FREE" && tenant.notes.length >= 3) {
    return withCors(NextResponse.json(
      { error: "Note limit reached. Upgrade to Pro." },
      { status: 403 }
    ));
  }
  
  const note = await prisma.note.create({
    data: {
      title: data.title,
      content: data.content,
      tenantId: user.tenantId,
      userId: user.userId,
    },
  });

  return withCors(NextResponse.json(note));
}
