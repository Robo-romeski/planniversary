import React, { useState } from 'react';
import type { WizardData } from '../../../app/date-wizard/page';

type Step1PreferencesProps = {
  values: WizardData;
  onChange: (data: Partial<WizardData>) => void;
  errors?: Partial<Record<keyof WizardData, string>>;
  attemptedNext?: boolean;
};

const ACTIVITY_TYPES = ['dining', 'entertainment', 'outdoors', 'arts', 'shopping', 'other'];

export default function Step1Preferences({ values, onChange, errors = {}, attemptedNext = false }: Step1PreferencesProps) {
  const [customActivity, setCustomActivity] = useState('');

  // Handlers for each field
  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (name === 'location') {
      onChange({ location: value });
    } else if (name === 'mobility') {
      onChange({ mobility: value });
    } else if (name === 'startTime') {
      onChange({ time: { ...values.time, start: value } });
    } else if (name === 'endTime') {
      onChange({ time: { ...values.time, end: value } });
    } else if (name === 'activityTypes') {
      let newTypes = values.activityTypes.slice();
      const checked = (e.target as HTMLInputElement).checked;
      if (checked) {
        newTypes.push(value);
      } else {
        newTypes = newTypes.filter((t) => t !== value);
        if (value === 'other') setCustomActivity('');
      }
      onChange({ activityTypes: newTypes });
    } else if (name === 'customActivity') {
      setCustomActivity(value);
      // Add or update custom activity in activityTypes
      let newTypes = values.activityTypes.filter((t) => t !== customActivity && t !== '');
      if (value.trim()) {
        newTypes.push(value.trim());
      }
      onChange({ activityTypes: newTypes });
    }
  };

  const showCustomActivity = values.activityTypes.includes('other');

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Step 1: Preferences</h2>
      <form className="space-y-8">
        {/* Location */}
        <section className="bg-gray-50 rounded-lg shadow-sm p-6 border border-gray-200">
          <label htmlFor="location" className="block font-semibold mb-2 text-gray-800">
            Location
            <span className="block text-xs text-gray-500 font-normal mt-1" id="location-desc">
              Enter your city or preferred area for date activities.
            </span>
          </label>
          <input
            id="location"
            name="location"
            type="text"
            aria-label="Location"
            aria-describedby="location-desc"
            className={`w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 transition ${attemptedNext && errors.location ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400 focus:border-blue-400'}`}
            placeholder="e.g. San Francisco, CA"
            autoComplete="off"
            value={values.location}
            onChange={handleInput}
          />
          {attemptedNext && errors.location && (
            <p className="text-red-600 text-sm mt-1">{errors.location}</p>
          )}
        </section>

        {/* Mobility */}
        <section className="bg-gray-50 rounded-lg shadow-sm p-6 border border-gray-200">
          <label className="block font-semibold mb-2 text-gray-800" id="mobility-label">
            Mobility Options
            <span className="block text-xs text-gray-500 font-normal mt-1" id="mobility-desc">
              How do you prefer to get around?
            </span>
          </label>
          <div className="flex flex-col sm:flex-row gap-4" role="radiogroup" aria-labelledby="mobility-label" aria-describedby="mobility-desc">
            <label className="inline-flex items-center cursor-pointer">
              <input type="radio" name="mobility" value="walking" className="accent-blue-500 mr-2" checked={values.mobility === 'walking'} onChange={handleInput} aria-checked={values.mobility === 'walking'} /> Walking
            </label>
            <label className="inline-flex items-center cursor-pointer">
              <input type="radio" name="mobility" value="driving" className="accent-blue-500 mr-2" checked={values.mobility === 'driving'} onChange={handleInput} aria-checked={values.mobility === 'driving'} /> Driving
            </label>
            <label className="inline-flex items-center cursor-pointer">
              <input type="radio" name="mobility" value="public_transit" className="accent-blue-500 mr-2" checked={values.mobility === 'public_transit'} onChange={handleInput} aria-checked={values.mobility === 'public_transit'} /> Public Transit
            </label>
          </div>
          {attemptedNext && errors.mobility && (
            <p className="text-red-600 text-sm mt-1">{errors.mobility}</p>
          )}
        </section>

        {/* Time Constraints */}
        <section className="bg-gray-50 rounded-lg shadow-sm p-6 border border-gray-200">
          <label className="block font-semibold mb-2 text-gray-800" id="time-label">
            Time Constraints
            <span className="block text-xs text-gray-500 font-normal mt-1" id="time-desc">
              When are you planning your date?
            </span>
          </label>
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <div className="flex-1">
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input type="time" id="startTime" name="startTime" aria-label="Start time" aria-describedby="time-desc" className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition ${attemptedNext && errors.time ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400 focus:border-blue-400'}`} value={values.time.start} onChange={handleInput} />
            </div>
            <div className="flex-1">
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input type="time" id="endTime" name="endTime" aria-label="End time" aria-describedby="time-desc" className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition ${attemptedNext && errors.time ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400 focus:border-blue-400'}`} value={values.time.end} onChange={handleInput} />
            </div>
          </div>
          {attemptedNext && errors.time && (
            <p className="text-red-600 text-sm mt-1">{errors.time}</p>
          )}
        </section>

        {/* Activity Types */}
        <section className="bg-gray-50 rounded-lg shadow-sm p-6 border border-gray-200">
          <label className="block font-semibold mb-2 text-gray-800" id="activity-label">
            Activity Type Preferences
            <span className="block text-xs text-gray-500 font-normal mt-1" id="activity-desc">
              Select all that interest you.
            </span>
          </label>
          <div className="flex flex-wrap gap-4" role="group" aria-labelledby="activity-label" aria-describedby="activity-desc">
            {ACTIVITY_TYPES.map((type) => (
              <label key={type} className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="activityTypes"
                  value={type}
                  className="accent-blue-500 mr-2"
                  checked={values.activityTypes.includes(type)}
                  onChange={handleInput}
                  aria-checked={values.activityTypes.includes(type)}
                />
                {type === 'other' ? 'Other' : type.charAt(0).toUpperCase() + type.slice(1)}
              </label>
            ))}
          </div>
          {showCustomActivity && (
            <input
              type="text"
              name="customActivity"
              aria-label="Custom activity type"
              placeholder="Enter custom activity type"
              className="mt-2 w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={customActivity}
              onChange={handleInput}
            />
          )}
          {attemptedNext && errors.activityTypes && (
            <p className="text-red-600 text-sm mt-1">{errors.activityTypes}</p>
          )}
        </section>
      </form>
    </div>
  );
} 