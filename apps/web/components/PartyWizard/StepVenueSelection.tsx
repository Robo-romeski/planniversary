import React, { useState, useEffect } from 'react';

const VENUES = [
  {
    id: 'venue1',
    name: 'Sunset Rooftop',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    description: 'A beautiful rooftop venue with city views.',
    type: 'rooftop',
    location: 'Downtown',
  },
  {
    id: 'venue2',
    name: 'Garden Pavilion',
    imageUrl: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80',
    description: 'Lush gardens and open-air pavilions for outdoor events.',
    type: 'garden',
    location: 'Uptown',
  },
  {
    id: 'venue3',
    name: 'Classic Banquet Hall',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    description: 'Elegant indoor hall for formal gatherings.',
    type: 'banquet',
    location: 'Midtown',
  },
];

export default function StepVenueSelection({ value, onChange }: any) {
  console.log('[StepVenueSelection] Rendered');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    console.log('[StepVenueSelection] value prop:', value);
  }, [value]);

  const filteredVenues = filter
    ? VENUES.filter(v => v.type.includes(filter) || v.location.includes(filter))
    : VENUES;

  const handleSelect = (venueId: string) => {
    console.log('[StepVenueSelection] Venue selected:', venueId);
    if (typeof onChange === 'function') {
      console.log('[StepVenueSelection] Calling onChange with ("venue",', venueId, ')');
      onChange('venue', venueId);
    } else {
      console.warn('[StepVenueSelection] onChange is not a function:', onChange);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Step: Venue Selection</h2>
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Filter by type or location..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="border rounded px-3 py-1 w-full"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredVenues.map(venue => (
          <div
            key={venue.id}
            className={`rounded-lg border shadow-sm p-4 cursor-pointer transition-all duration-150 ${value.venue === venue.id ? 'ring-2 ring-orange-500 border-orange-300' : 'hover:border-orange-400'}`}
            onClick={() => handleSelect(venue.id)}
          >
            <img src={venue.imageUrl} alt={venue.name} className="w-full h-32 object-cover rounded mb-2" />
            <div className="font-semibold text-lg mb-1">{venue.name}</div>
            <div className="text-gray-600 text-sm mb-1">{venue.location} &middot; {venue.type}</div>
            <div className="text-gray-700 text-sm">{venue.description}</div>
            {value.venue === venue.id && <div className="mt-2 text-orange-600 font-bold">Selected</div>}
          </div>
        ))}
      </div>
    </div>
  );
} 