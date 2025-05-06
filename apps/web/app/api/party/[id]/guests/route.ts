import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const guests = await prisma.guests.findMany({
      where: { party_id: Number(id) },
    });
    return NextResponse.json(guests);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch guests' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const data = await req.json();
    if (!Array.isArray(data.guests)) {
      return NextResponse.json({ error: 'Guests must be an array' }, { status: 400 });
    }
    // Insert guests for the party
    const createdGuests = await Promise.all(
      data.guests.map((guest: { name: string; email: string }) =>
        prisma.guests.create({
          data: {
            party_id: Number(id),
            name: guest.name,
            email: guest.email,
          },
        })
      )
    );
    return NextResponse.json(createdGuests);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to add guests' }, { status: 500 });
  }
} 