import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import StepEventTypeSelection from './StepEventTypeSelection';
import StepAudienceInfo from './StepAudienceInfo';
import StepThemeBrowsing from './StepThemeBrowsing';
import StepVenueSelection from './StepVenueSelection';
import PartyTaskChecklist, { PartyTask } from './PartyTaskChecklist';

const steps = [
  { label: 'Event Type', component: StepEventTypeSelection },
  { label: 'Audience Info', component: StepAudienceInfo },
  { label: 'Theme Browsing', component: StepThemeBrowsing },
  { label: 'Venue Selection', component: StepVenueSelection },
  { label: 'Checklist', component: PartyTaskChecklist },
];

export default function PartyWizardContainer() {
  const [stepIndex, setStepIndex] = useState(0);
  const [formData, setFormData] = useState({
    eventType: '',
    date: '',
    audience: {},
    theme: '',
    venue: '',
    selectedTheme: '',
    tasks: undefined as PartyTask[] | undefined,
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const CurrentStep = steps[stepIndex].component;

  console.log('[PartyWizardContainer] stepIndex:', stepIndex, 'CurrentStep:', steps[stepIndex].label, 'formData:', formData);

  const handleStepChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleChecklistChange = (tasks: PartyTask[]) => {
    setFormData(prev => ({ ...prev, tasks }));
  };

  const handleNext = () => {
    if (stepIndex < steps.length - 1) setStepIndex(stepIndex + 1);
  };
  const handlePrev = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  };
  const handleFinish = async () => {
    setLoading(true);
    setError(null);
    try {
      // Map formData to backend payload
      const payload = {
        name: formData.eventType || 'Untitled Party',
        date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
        location: formData.venue || '',
        description: formData.selectedTheme || '',
        tasks: formData.tasks || [],
      };
      const res = await fetch('/api/party', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to submit party');
      }
      setSubmitted(true);
      setTimeout(() => {
        router.push('/'); // Redirect to home/dashboard
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit party');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-10 text-center">
        <h2 className="text-2xl font-bold mb-4">Party Plan Submitted!</h2>
        <p>Your party details have been saved. Thank you!</p>
        <p className="mt-4 text-gray-500">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      {/* Progress Indicator */}
      <div className="flex items-center mb-6">
        {steps.map((step, idx) => (
          <div key={step.label} className="flex-1 flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${idx === stepIndex ? 'bg-orange-500' : 'bg-gray-300'}`}>{idx + 1}</div>
            {idx < steps.length - 1 && <div className="flex-1 h-1 bg-gray-200 mx-2" />}
          </div>
        ))}
      </div>
      <h2 className="text-2xl font-bold mb-4 text-center">Party Planning Wizard</h2>
      {stepIndex === steps.length - 1 ? (
        <PartyTaskChecklist
          value={formData.tasks || []}
          onChange={handleChecklistChange}
        />
      ) : (
        <CurrentStep
          value={formData}
          onChange={handleStepChange}
        />
      )}
      {error && <div className="text-red-600 text-center mt-4">{error}</div>}
      <div className="flex justify-between mt-8">
        <button
          className="px-4 py-2 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
          onClick={handlePrev}
          disabled={stepIndex === 0 || loading}
        >
          Previous
        </button>
        {stepIndex < steps.length - 1 ? (
          <button
            className="px-4 py-2 rounded bg-orange-500 text-white"
            onClick={handleNext}
            disabled={loading}
          >
            Next
          </button>
        ) : (
          <button
            className="px-4 py-2 rounded bg-green-600 text-white"
            onClick={handleFinish}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Finish'}
          </button>
        )}
      </div>
    </div>
  );
} 