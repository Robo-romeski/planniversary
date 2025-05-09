import React from 'react';

const AGE_GROUPS = [
  { value: '', label: 'Select age group' },
  { value: '0-5', label: 'Infant (0-5)' },
  { value: '5-12', label: 'Child (5-12)' },
  { value: '13-18', label: 'Teen (13-18)' },
  { value: '19-25', label: 'Young Adult (19-25)' },
  { value: '26-35', label: 'Adult (26-35)' },
  { value: '36-50', label: 'Adult (36-50)' },
  { value: '51-64', label: 'Adult (51-64)' },
  { value: '65+', label: 'Senior (65+)' },
];

export default function StepAudienceInfo({ value, onChange }: any) {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold mb-2">Step: Audience Information</h3>
      <input
        type="number"
        placeholder="Number of guests"
        value={value.audience?.guestCount || ''}
        onChange={e => onChange('audience', { ...value.audience, guestCount: e.target.value })}
        className="border rounded px-3 py-2 w-full mb-2"
      />
      <select
        value={value.audience?.ageGroup || ''}
        onChange={e => onChange('audience', { ...value.audience, ageGroup: e.target.value })}
        className="border rounded px-3 py-2 w-full"
      >
        {AGE_GROUPS.map(group => (
          <option key={group.value} value={group.value}>{group.label}</option>
        ))}
      </select>
    </div>
  );
} 