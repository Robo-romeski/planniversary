import { NextResponse } from 'next/server';
import { mockParties } from '../../_mockPartyStore';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const party = mockParties.find((p) => p.id === id);
  if (!party) {
    return NextResponse.json({ error: 'Party not found' }, { status: 404 });
  }
  return NextResponse.json(party);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const idx = mockParties.findIndex((p) => p.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: 'Party not found' }, { status: 404 });
  }
  try {
    const data = await req.json();
    // Update allowed fields
    mockParties[idx] = {
      ...mockParties[idx],
      name: data.name ?? mockParties[idx].name,
      date: data.date ?? mockParties[idx].date,
      location: data.location ?? mockParties[idx].location,
      description: data.description ?? mockParties[idx].description,
      updatedAt: new Date().toISOString(),
    };
    return NextResponse.json(mockParties[idx]);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update party' }, { status: 500 });
  }
} 