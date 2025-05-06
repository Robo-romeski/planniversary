import React from 'react';
import type { WizardData } from '../../../app/date-wizard/page';

type Step3ReviewProps = {
  values: WizardData;
  onConfirm: () => void;
  loading?: boolean;
  error?: string;
};

export default function Step3Review({ values, onConfirm, loading = false, error }: Step3ReviewProps) {
  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Step 3: Review & Confirm</h2>
      <div className="space-y-6 mb-8">
        {/* Location */}
        <section className="bg-gray-50 rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="font-semibold text-gray-800 mb-1">Location</div>
          <div className="text-gray-700">{values.location || <span className="italic text-gray-400">Not specified</span>}</div>
        </section>
        {/* Mobility */}
        <section className="bg-gray-50 rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="font-semibold text-gray-800 mb-1">Mobility</div>
          <div className="text-gray-700">{values.mobility ? values.mobility.charAt(0).toUpperCase() + values.mobility.slice(1).replace('_', ' ') : <span className="italic text-gray-400">Not specified</span>}</div>
        </section>
        {/* Time Constraints */}
        <section className="bg-gray-50 rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="font-semibold text-gray-800 mb-1">Time Constraints</div>
          <div className="text-gray-700">
            {values.time.start && values.time.end ? (
              <>{values.time.start} - {values.time.end}</>
            ) : (
              <span className="italic text-gray-400">Not specified</span>
            )}
          </div>
        </section>
        {/* Activity Types */}
        <section className="bg-gray-50 rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="font-semibold text-gray-800 mb-1">Activity Types</div>
          <div className="flex flex-wrap gap-2">
            {values.activityTypes.length > 0 ? (
              values.activityTypes.map((type) => (
                <span key={type} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </span>
              ))
            ) : (
              <span className="italic text-gray-400">None selected</span>
            )}
          </div>
        </section>
        {/* Budget */}
        <section className="bg-gray-50 rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="font-semibold text-gray-800 mb-1">Budget</div>
          <div className="text-gray-700">
            {values.budget.min && values.budget.max ? (
              <>{values.budget.min} - {values.budget.max} {values.budget.currency}</>
            ) : (
              <span className="italic text-gray-400">Not specified</span>
            )}
          </div>
        </section>
      </div>
      {error && (
        <div className="mb-4 text-red-600 text-center font-medium">{error}</div>
      )}
      <button
        type="button"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow transition text-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
        onClick={onConfirm}
        aria-label="Confirm and continue"
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center gap-2"><svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>Submitting...</span>
        ) : (
          'Confirm & Continue'
        )}
      </button>
    </div>
  );
} 