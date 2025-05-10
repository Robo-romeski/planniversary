import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const party = await prisma.parties.findUnique({
      where: { id: Number(id) },
      include: { guests: true },
    });
    if (!party) {
      return NextResponse.json({ error: 'Party not found' }, { status: 404 });
    }
    return NextResponse.json(party);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch party' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const data = await req.json();
    const updatedParty = await prisma.parties.update({
      where: { id: Number(id) },
      data: {
        name: data.name,
        date: data.date,
        location: data.location,
        description: data.description,
      },
    });
    return NextResponse.json(updatedParty);
  } catch (err: any) {
    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Party not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update party' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    await prisma.parties.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({ message: 'Party deleted' });
  } catch (err: any) {
    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Party not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete party' }, { status: 500 });
  }
} 