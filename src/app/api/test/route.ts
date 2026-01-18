import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const total = await prisma.electricitydata.count();
    return NextResponse.json({ total });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
