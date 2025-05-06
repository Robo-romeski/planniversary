"use client";
import { useState } from 'react';
import { createParty, addGuestsToParty, fetchPartySuggestions, submitRSVP } from '../../lib/api';

// Step 1: Party Details
function Step1Details({ value, onChange, errors, attemptedNext }: any) {
  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Step 1: Party Details</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block font-medium mb-1">Party Name</label>
          <input
            id="name"
            name="name"
            type="text"
            className="w-full border rounded px-3 py-2"
            value={value.name || ''}
            onChange={e => onChange({ ...value, name: e.target.value })}
            aria-invalid={!!errors?.name}
            aria-describedby={errors?.name ? 'name-error' : undefined}
          />
          {attemptedNext && errors?.name && (
            <div id="name-error" className="text-red-600 text-sm mt-1">{errors.name}</div>
          )}
        </div>
        <div>
          <label htmlFor="date" className="block font-medium mb-1">Date</label>
          <input
            id="date"
            name="date"
            type="date"
            className="w-full border rounded px-3 py-2"
            value={value.date || ''}
            onChange={e => onChange({ ...value, date: e.target.value })}
            aria-invalid={!!errors?.date}
            aria-describedby={errors?.date ? 'date-error' : undefined}
          />
          {attemptedNext && errors?.date && (
            <div id="date-error" className="text-red-600 text-sm mt-1">{errors.date}</div>
          )}
        </div>
        <div>
          <label htmlFor="location" className="block font-medium mb-1">Location</label>
          <input
            id="location"
            name="location"
            type="text"
            className="w-full border rounded px-3 py-2"
            value={value.location || ''}
            onChange={e => onChange({ ...value, location: e.target.value })}
            aria-invalid={!!errors?.location}
            aria-describedby={errors?.location ? 'location-error' : undefined}
          />
          {attemptedNext && errors?.location && (
            <div id="location-error" className="text-red-600 text-sm mt-1">{errors.location}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// Step 2: Guest List
function Step2Guests({ value, onChange, errors, attemptedNext }: any) {
  const [guestInput, setGuestInput] = useState('');

  const handleAddGuest = () => {
    const email = guestInput.trim();
    if (email && !value.guests.includes(email)) {
      onChange({ ...value, guests: [...value.guests, email] });
      setGuestInput('');
    }
  };

  const handleRemoveGuest = (email: string) => {
    onChange({ ...value, guests: value.guests.filter((g: string) => g !== email) });
  };

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Step 2: Guest List</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="guest-input" className="block font-medium mb-1">Add Guest Email</label>
          <div className="flex gap-2">
            <input
              id="guest-input"
              type="email"
              className="flex-1 border rounded px-3 py-2"
              value={guestInput}
              onChange={e => setGuestInput(e.target.value)}
              aria-label="Guest email"
            />
            <button
              type="button"
              className="px-3 py-2 rounded bg-blue-600 text-white font-semibold"
              onClick={handleAddGuest}
              disabled={!guestInput.trim()}
            >
              Add
            </button>
          </div>
        </div>
        <div>
          <label className="block font-medium mb-1">Guest List</label>
          <ul className="space-y-2">
            {value.guests.map((email: string, idx: number) => (
              <li key={email} className="flex items-center gap-2">
                <span className="flex-1">{email}</span>
                <button
                  type="button"
                  className="text-red-600 hover:underline text-sm"
                  onClick={() => handleRemoveGuest(email)}
                  aria-label={`Remove ${email}`}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          {attemptedNext && errors?.guests && (
            <div className="text-red-600 text-sm mt-1">{errors.guests}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// Step 3: Budget & Preferences
function Step3Budget({ value, onChange, errors, attemptedNext }: any) {
  const PARTY_TYPES = ['Birthday', 'Anniversary', 'Graduation', 'Holiday', 'Other'];

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Step 3: Budget & Preferences</h2>
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="minBudget" className="block font-medium mb-1">Min Budget</label>
            <input
              id="minBudget"
              name="minBudget"
              type="number"
              min={0}
              className="w-full border rounded px-3 py-2"
              value={value.minBudget || ''}
              onChange={e => onChange({ ...value, minBudget: e.target.value })}
              aria-invalid={!!errors?.minBudget}
              aria-describedby={errors?.minBudget ? 'minBudget-error' : undefined}
            />
            {attemptedNext && errors?.minBudget && (
              <div id="minBudget-error" className="text-red-600 text-sm mt-1">{errors.minBudget}</div>
            )}
          </div>
          <div className="flex-1">
            <label htmlFor="maxBudget" className="block font-medium mb-1">Max Budget</label>
            <input
              id="maxBudget"
              name="maxBudget"
              type="number"
              min={0}
              className="w-full border rounded px-3 py-2"
              value={value.maxBudget || ''}
              onChange={e => onChange({ ...value, maxBudget: e.target.value })}
              aria-invalid={!!errors?.maxBudget}
              aria-describedby={errors?.maxBudget ? 'maxBudget-error' : undefined}
            />
            {attemptedNext && errors?.maxBudget && (
              <div id="maxBudget-error" className="text-red-600 text-sm mt-1">{errors.maxBudget}</div>
            )}
          </div>
        </div>
        <div>
          <label htmlFor="partyType" className="block font-medium mb-1">Party Type</label>
          <select
            id="partyType"
            name="partyType"
            className="w-full border rounded px-3 py-2"
            value={value.partyType || ''}
            onChange={e => onChange({ ...value, partyType: e.target.value })}
            aria-invalid={!!errors?.partyType}
            aria-describedby={errors?.partyType ? 'partyType-error' : undefined}
          >
            <option value="">Select type</option>
            {PARTY_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {attemptedNext && errors?.partyType && (
            <div id="partyType-error" className="text-red-600 text-sm mt-1">{errors.partyType}</div>
          )}
        </div>
        <div>
          <label htmlFor="preferences" className="block font-medium mb-1">Special Preferences (optional)</label>
          <textarea
            id="preferences"
            name="preferences"
            className="w-full border rounded px-3 py-2"
            value={value.preferences || ''}
            onChange={e => onChange({ ...value, preferences: e.target.value })}
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}

// Step 4: Review & Confirm
function Step4Review({ value, onConfirm, loading }: any) {
  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Step 4: Review & Confirm</h2>
      <div className="space-y-4 mb-8">
        <section className="bg-gray-50 rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="font-semibold text-gray-800 mb-1">Party Details</div>
          <div><b>Name:</b> {value.name}</div>
          <div><b>Date:</b> {value.date}</div>
          <div><b>Location:</b> {value.location}</div>
        </section>
        <section className="bg-gray-50 rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="font-semibold text-gray-800 mb-1">Guests</div>
          <ul className="list-disc ml-6">
            {value.guests.map((g: string) => <li key={g}>{g}</li>)}
          </ul>
        </section>
        <section className="bg-gray-50 rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="font-semibold text-gray-800 mb-1">Budget & Preferences</div>
          <div><b>Min Budget:</b> {value.minBudget}</div>
          <div><b>Max Budget:</b> {value.maxBudget}</div>
          <div><b>Party Type:</b> {value.partyType}</div>
          {value.preferences && <div><b>Preferences:</b> {value.preferences}</div>}
        </section>
      </div>
      <button
        type="button"
        className="px-4 py-2 rounded bg-green-600 text-white font-semibold w-full"
        onClick={onConfirm}
        disabled={loading}
      >
        {loading ? 'Submitting...' : 'Confirm & Submit'}
      </button>
    </div>
  );
}

function Step5Suggestions({ suggestions, loading, error }: any) {
  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Party Suggestions</h2>
      {loading && <div className="text-center text-lg">Loading suggestions...</div>}
      {error && <div className="text-center text-red-600 font-medium">{error}</div>}
      {!loading && !error && (
        <div className="grid gap-6 sm:grid-cols-2">
          {suggestions.map((s: any) => (
            <div key={s.id} className="bg-white rounded-xl shadow-md border border-gray-200 flex flex-col overflow-hidden hover:shadow-lg transition">
              {s.imageUrl && <img src={s.imageUrl} alt={s.title} className="h-32 w-full object-cover" />}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{s.title}</h3>
                <div className="text-sm text-gray-600 mb-2">{s.description}</div>
                <div className="text-xs text-gray-500 capitalize">Type: {s.type}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Step6RSVP({ partyId, onComplete }: any) {
  const [form, setForm] = useState({ name: '', email: '', response: 'yes' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await submitRSVP(partyId, form);
      setSuccess(true);
      onComplete && onComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to submit RSVP');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return <div className="text-center py-10"><h2 className="text-2xl font-bold mb-4">RSVP Submitted!</h2><p>Thank you for your response.</p></div>;
  }

  return (
    <form className="max-w-xl mx-auto" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold mb-6 text-center">RSVP</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="rsvp-name" className="block font-medium mb-1">Name</label>
          <input
            id="rsvp-name"
            type="text"
            className="w-full border rounded px-3 py-2"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <label htmlFor="rsvp-email" className="block font-medium mb-1">Email</label>
          <input
            id="rsvp-email"
            type="email"
            className="w-full border rounded px-3 py-2"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Response</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={form.response}
            onChange={e => setForm(f => ({ ...f, response: e.target.value }))}
          >
            <option value="yes">Yes</option>
            <option value="no">No</option>
            <option value="maybe">Maybe</option>
          </select>
        </div>
      </div>
      {error && <div className="text-red-600 text-center mt-4">{error}</div>}
      <button
        type="submit"
        className="px-4 py-2 rounded bg-green-600 text-white font-semibold w-full mt-6"
        disabled={loading}
      >
        {loading ? 'Submitting...' : 'Submit RSVP'}
      </button>
    </form>
  );
}

const steps = [
  { label: 'Party Details', component: Step1Details },
  { label: 'Guest List', component: Step2Guests },
  { label: 'Budget & Preferences', component: Step3Budget },
  { label: 'Review & Confirm', component: Step4Review },
  { label: 'Suggestions', component: Step5Suggestions },
  { label: 'RSVP', component: Step6RSVP },
];

export default function PartyWizardPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState({
    name: '',
    date: '',
    location: '',
    guests: [],
    minBudget: '',
    maxBudget: '',
    partyType: '',
    preferences: '',
  });
  const [errors, setErrors] = useState<any>({});
  const [attemptedNext, setAttemptedNext] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
  const [partyId, setPartyId] = useState<string | null>(null);

  const validate = () => {
    const errs: any = {};
    if (currentStep === 0) {
      if (!form.name) errs.name = 'Party name is required.';
      if (!form.date) errs.date = 'Date is required.';
      if (!form.location) errs.location = 'Location is required.';
    }
    if (currentStep === 1) {
      if (!form.guests || form.guests.length === 0) errs.guests = 'At least one guest is required.';
    }
    if (currentStep === 2) {
      if (!form.minBudget) errs.minBudget = 'Min budget is required.';
      if (!form.maxBudget) errs.maxBudget = 'Max budget is required.';
      if (form.minBudget && form.maxBudget && Number(form.minBudget) > Number(form.maxBudget)) {
        errs.maxBudget = 'Max budget must be greater than or equal to min budget.';
      }
      if (!form.partyType) errs.partyType = 'Party type is required.';
    }
    return errs;
  };

  const handleNext = () => {
    setAttemptedNext(true);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setCurrentStep(currentStep + 1);
      setAttemptedNext(false);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    setAttemptedNext(false);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    setErrors({});
    try {
      const party = await createParty(form);
      setPartyId(party.id);
      const guests = (form.guests || []).map((email: string) => ({ name: email, email }));
      await addGuestsToParty(party.id, guests);
      setSuggestionsLoading(true);
      setSuggestionsError(null);
      try {
        const recs = await fetchPartySuggestions(party.id);
        setSuggestions(recs);
        setCurrentStep(4); // Go to suggestions step
      } catch (err: any) {
        setSuggestionsError(err.message || 'Failed to fetch suggestions');
        setCurrentStep(4);
      } finally {
        setSuggestionsLoading(false);
      }
    } catch (err: any) {
      setErrors({ submit: err.message || 'Failed to create party or add guests' });
    } finally {
      setSubmitting(false);
    }
  };

  // RSVP step navigation
  const handleSuggestionsNext = () => {
    setCurrentStep(5);
  };

  if (complete) {
    return (
      <div className="py-10 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">All done!</h2>
        <p>Your party details have been submitted. Thank you!</p>
      </div>
    );
  }

  const StepComponent = steps[currentStep].component;

  return (
    <div className="py-10 px-4">
      <div className="mb-8 flex justify-center gap-4">
        {steps.map((step, idx) => (
          <div
            key={step.label}
            className={`px-4 py-2 rounded-full text-sm font-semibold ${idx === currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            {step.label}
          </div>
        ))}
      </div>
      {currentStep === 4 ? (
        <>
          <Step5Suggestions
            suggestions={suggestions}
            loading={suggestionsLoading}
            error={suggestionsError}
          />
          <div className="flex justify-end mt-8 max-w-xl mx-auto">
            <button
              type="button"
              className="px-4 py-2 rounded bg-blue-600 text-white font-semibold"
              onClick={handleSuggestionsNext}
            >
              Next
            </button>
          </div>
        </>
      ) : currentStep === 5 ? (
        <Step6RSVP partyId={partyId} onComplete={() => setComplete(true)} />
      ) : (
        <StepComponent
          value={form}
          onChange={(newData: any) => setForm({ ...form, ...newData })}
          errors={errors}
          attemptedNext={attemptedNext}
          onConfirm={handleConfirm}
          loading={submitting}
        />
      )}
      {errors.submit && <div className="text-red-600 text-center mt-4">{errors.submit}</div>}
      <div className="mt-8 flex justify-between max-w-xl mx-auto">
        <button
          type="button"
          className="px-4 py-2 rounded bg-gray-300 text-gray-700 font-semibold disabled:opacity-50"
          onClick={handleBack}
          disabled={currentStep === 0 || currentStep === steps.length - 1}
        >
          Back
        </button>
        <button
          type="button"
          className="px-4 py-2 rounded bg-blue-600 text-white font-semibold"
          onClick={handleNext}
          disabled={currentStep === steps.length - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
} 