import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ error: 'Invalid party ID' }, { status: 400 });
  }
  try {
    const data = await req.json();
    const { name, email, response } = data;
    if (!name || !email || !response) {
      return NextResponse.json({ error: 'Missing required RSVP fields' }, { status: 400 });
    }
    // Upsert guest RSVP by email for the party
    const guest = await prisma.guests.upsert({
      where: {
        party_id_email: {
          party_id: Number(id),
          email,
        },
      },
      update: {
        name,
        response,
        updated_at: new Date(),
      },
      create: {
        party_id: Number(id),
        name,
        email,
        response,
      },
    });
    return NextResponse.json(guest);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to process RSVP' }, { status: 500 });
  }
} 