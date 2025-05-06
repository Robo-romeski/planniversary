import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const data = await req.json(); // wizardData
  // For MVP, return static recommendations
  return NextResponse.json([
    {
      id: '1',
      title: 'Morning Coffee at Blue Bottle',
      type: 'dining',
      time: '9:00 AM – 10:00 AM',
      location: 'Blue Bottle Coffee, Market St',
      price: '$$',
      imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    },
    {
      id: '2',
      title: 'Art Museum Visit',
      type: 'arts',
      time: '10:30 AM – 12:00 PM',
      location: 'SF Museum of Modern Art',
      price: '$$',
      imageUrl: 'https://images.unsplash.com/photo-1464983953574-0892a716854b',
    },
    {
      id: '3',
      title: 'Lunch at The Grove',
      type: 'dining',
      time: '12:30 PM – 1:30 PM',
      location: 'The Grove, Mission St',
      price: '$$',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
    },
    {
      id: '4',
      title: 'Afternoon Walk in Golden Gate Park',
      type: 'outdoors',
      time: '2:00 PM – 3:30 PM',
      location: 'Golden Gate Park',
      price: 'Free',
      imageUrl: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429',
    },
    {
      id: '5',
      title: 'Shopping at Union Square',
      type: 'shopping',
      time: '4:00 PM – 5:00 PM',
      location: 'Union Square',
      price: '$$$',
      imageUrl: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca',
    },
  ]);
} 