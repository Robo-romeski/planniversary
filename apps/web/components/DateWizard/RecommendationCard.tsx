import React from 'react';

export type RecommendationCardProps = {
  title: string;
  type: string;
  time: string;
  location: string;
  price: string | number;
  imageUrl?: string;
  selected?: boolean;
  onAdd: () => void;
};

const typeIcons: Record<string, React.ReactNode> = {
  dining: <span role="img" aria-label="Dining">🍽️</span>,
  entertainment: <span role="img" aria-label="Entertainment">🎭</span>,
  outdoors: <span role="img" aria-label="Outdoors">🌳</span>,
  arts: <span role="img" aria-label="Arts">🎨</span>,
  shopping: <span role="img" aria-label="Shopping">🛍️</span>,
  default: <span role="img" aria-label="Activity">🎉</span>,
};

export default function RecommendationCard({
  title,
  type,
  time,
  location,
  price,
  imageUrl,
  selected = false,
  onAdd,
}: RecommendationCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 flex flex-col overflow-hidden hover:shadow-lg transition max-w-md w-full">
      {imageUrl && (
        <img src={imageUrl} alt={title} className="h-40 w-full object-cover" />
      )}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">
            {typeIcons[type] || typeIcons.default}
          </span>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold capitalize">
            {type}
          </span>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
        <div className="text-sm text-gray-600 mb-2">
          <span className="font-medium">Time:</span> {time}
        </div>
        <div className="text-sm text-gray-600 mb-2">
          <span className="font-medium">Location:</span> {location}
        </div>
        <div className="text-sm text-gray-600 mb-4">
          <span className="font-medium">Price:</span> {typeof price === 'number' ? `$${price}` : price}
        </div>
        <button
          type="button"
          className={`w-full py-2 px-4 rounded-lg font-semibold transition text-white ${selected ? 'bg-green-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          onClick={onAdd}
          aria-label={selected ? 'Added to itinerary' : 'Add to itinerary'}
          disabled={selected}
        >
          {selected ? 'Added' : 'Add to Itinerary'}
        </button>
      </div>
    </div>
  );
} 