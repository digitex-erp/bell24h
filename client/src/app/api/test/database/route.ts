import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const total = await prisma.user?.count(); // optional chaining
    return Response.json({ ok: true, total });
  } catch (err) {
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}
