import React from 'react';

export default function StepEventTypeSelection({ value, onChange }: any) {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold mb-2">Step: Event Type Selection</h3>
      <input
        type="text"
        placeholder="Enter event type (e.g., Birthday, Anniversary)"
        value={value.eventType || ''}
        onChange={e => onChange('eventType', e.target.value)}
        className="border rounded px-3 py-2 w-full mb-2"
      />
      <input
        type="date"
        placeholder="Select date"
        value={value.date || ''}
        onChange={e => onChange('date', e.target.value)}
        className="border rounded px-3 py-2 w-full"
      />
    </div>
  );
} 