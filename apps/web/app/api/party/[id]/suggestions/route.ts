import { NextResponse } from 'next/server';
import { mockParties } from '../../../_mockPartyStore';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const party = mockParties.find((p: any) => p.id === id);
  if (!party) {
    return NextResponse.json({ error: 'Party not found' }, { status: 404 });
  }
  // Static/mock suggestions
  const suggestions = [
    {
      id: '1',
      title: 'Karaoke Night',
      description: 'Sing your heart out with friends at a local karaoke bar.',
      type: 'entertainment',
      imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4',
    },
    {
      id: '2',
      title: 'Potluck Dinner',
      description: 'Everyone brings a dish to share for a cozy, communal meal.',
      type: 'dining',
      imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
    },
    {
      id: '3',
      title: 'Board Game Marathon',
      description: 'Challenge your guests to a night of classic and new board games.',
      type: 'games',
      imageUrl: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308',
    },
    {
      id: '4',
      title: 'Outdoor Picnic',
      description: 'Enjoy food and games in the park with friends and family.',
      type: 'outdoors',
      imageUrl: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca',
    },
    {
      id: '5',
      title: 'Movie Marathon',
      description: 'Set up a projector and watch your favorite films back-to-back.',
      type: 'entertainment',
      imageUrl: 'https://images.unsplash.com/photo-1464983953574-0892a716854b',
    },
  ];
  return NextResponse.json(suggestions);
} 