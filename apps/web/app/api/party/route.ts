import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log('Incoming party payload:', data);
    if (!data.name || !data.date || !data.location) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const newParty = await prisma.party.create({
      data: {
        name: data.name,
        date: data.date,
        location: data.location,
        description: data.description || '',
      },
    });
    return NextResponse.json(newParty, { status: 201 });
  } catch (err: any) {
    console.error('Party creation error:', err);
    return NextResponse.json({ error: err.message || 'Failed to create party' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const parties = await prisma.party.findMany();
    return NextResponse.json(parties);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch parties' }, { status: 500 });
  }
} 