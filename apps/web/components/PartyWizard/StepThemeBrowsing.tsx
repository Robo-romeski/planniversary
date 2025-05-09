import React, { useState } from 'react';

const THEMES = [
  {
    id: 'tropical',
    name: 'Tropical Paradise',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    description: 'Palm trees, bright colors, and beach vibes.',
    tags: ['summer', 'outdoors', 'colorful'],
  },
  {
    id: 'retro',
    name: 'Retro 80s',
    imageUrl: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80',
    description: 'Neon lights, funky music, and vintage decor.',
    tags: ['indoor', 'music', 'dancing'],
  },
  {
    id: 'masquerade',
    name: 'Masquerade Ball',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    description: 'Elegant masks, formal attire, and mystery.',
    tags: ['formal', 'indoor', 'elegant'],
  },
  {
    id: 'garden',
    name: 'Garden Party',
    imageUrl: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80',
    description: 'Floral decor, outdoor setting, and tea time.',
    tags: ['outdoors', 'spring', 'tea'],
  },
  // Add more themes as needed
];

const ALL_TAGS = Array.from(new Set(THEMES.flatMap(t => t.tags)));

export default function StepThemeBrowsing({ value, onChange, errors, attemptedNext }: any) {
  const [filter, setFilter] = useState('');

  const filteredThemes = filter
    ? THEMES.filter(theme => theme.tags.includes(filter))
    : THEMES;

  const handleSelect = (themeId: string) => {
    onChange('selectedTheme', themeId);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Step: Choose a Theme</h2>
      <div className="mb-4 flex flex-wrap gap-2 justify-center">
        <button
          className={`px-3 py-1 rounded-full border ${filter === '' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setFilter('')}
        >
          All
        </button>
        {ALL_TAGS.map(tag => (
          <button
            key={tag}
            className={`px-3 py-1 rounded-full border ${filter === tag ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setFilter(tag)}
          >
            {tag.charAt(0).toUpperCase() + tag.slice(1)}
          </button>
        ))}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredThemes.map(theme => (
          <div
            key={theme.id}
            className={`bg-white rounded-xl shadow-md border-2 flex flex-col overflow-hidden hover:shadow-lg transition cursor-pointer ${value.selectedTheme === theme.id ? 'border-blue-600 ring-2 ring-blue-400' : 'border-gray-200'}`}
            tabIndex={0}
            aria-pressed={value.selectedTheme === theme.id}
            onClick={() => handleSelect(theme.id)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') handleSelect(theme.id);
            }}
          >
            {theme.imageUrl && (
              <img src={theme.imageUrl} alt={theme.name} className="h-32 w-full object-cover" />
            )}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{theme.name}</h3>
              <div className="text-sm text-gray-600 mb-2">{theme.description}</div>
              <div className="flex flex-wrap gap-1 mt-auto">
                {theme.tags.map(tag => (
                  <span key={tag} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">{tag}</span>
                ))}
              </div>
              {value.selectedTheme === theme.id && (
                <div className="mt-2 text-blue-600 font-semibold text-sm">Selected</div>
              )}
            </div>
          </div>
        ))}
      </div>
      {attemptedNext && errors?.selectedTheme && (
        <div className="text-red-600 text-center mt-4">{errors.selectedTheme}</div>
      )}
    </div>
  );
} 