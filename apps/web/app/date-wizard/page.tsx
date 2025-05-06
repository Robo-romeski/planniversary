"use client";

import { useState } from 'react';
import WizardContainer from '../../components/DateWizard/WizardContainer';
import Step1Preferences from '../../components/DateWizard/steps/Step1Preferences';
import Step2Budget from '../../components/DateWizard/steps/Step2Budget';
import Step3Review from '../../components/DateWizard/steps/Step3Review';
import RecommendationCard from '../../components/DateWizard/RecommendationCard';
import { fetchRecommendations } from '../../lib/api';

export type WizardData = {
  location: string;
  mobility: string;
  time: { start: string; end: string };
  activityTypes: string[];
  budget: { min: string; max: string; currency: string };
};

const initialWizardData: WizardData = {
  location: '',
  mobility: '',
  time: { start: '', end: '' },
  activityTypes: [],
  budget: { min: '', max: '', currency: 'USD' },
};

function validateStep1(data: WizardData) {
  const errors: Partial<Record<keyof WizardData, string>> = {};
  if (!data.location.trim()) errors.location = 'Location is required.';
  if (!data.mobility) errors.mobility = 'Mobility option is required.';
  if (!data.time.start) errors.time = 'Start time is required.';
  else if (!data.time.end) errors.time = 'End time is required.';
  if (!data.activityTypes.length) errors.activityTypes = 'Select at least one activity type.';
  return errors;
}

function validateStep2(budget: WizardData['budget']) {
  const errors: Partial<Record<keyof WizardData['budget'], string>> = {};
  if (!budget.min) errors.min = 'Minimum budget is required.';
  else if (isNaN(Number(budget.min)) || Number(budget.min) <= 0) errors.min = 'Minimum budget must be greater than 0.';
  if (!budget.max) errors.max = 'Maximum budget is required.';
  else if (isNaN(Number(budget.max)) || Number(budget.max) <= 0) errors.max = 'Maximum budget must be greater than 0.';
  if (budget.min && budget.max && Number(budget.min) > Number(budget.max)) errors.max = 'Maximum budget must be greater than or equal to minimum budget.';
  if (!budget.currency) errors.currency = 'Currency is required.';
  return errors;
}

export default function DateWizardPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [wizardData, setWizardData] = useState<WizardData>(initialWizardData);
  const [attemptedNext, setAttemptedNext] = useState(false);
  const [step1Errors, setStep1Errors] = useState<Partial<Record<keyof WizardData, string>>>({});
  const [step2Errors, setStep2Errors] = useState<Partial<Record<keyof WizardData['budget'], string>>>({});
  const [attemptedNext2, setAttemptedNext2] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState<string | null>(null);
  const [itinerary, setItinerary] = useState<any[]>([]);

  const handleNext = () => {
    if (currentStep === 1) {
      const errors = validateStep1(wizardData);
      setStep1Errors(errors);
      setAttemptedNext(true);
      if (Object.keys(errors).length === 0) {
        setCurrentStep(currentStep + 1);
        setAttemptedNext(false);
      }
    } else if (currentStep === 2) {
      const errors = validateStep2(wizardData.budget);
      setStep2Errors(errors);
      setAttemptedNext2(true);
      if (Object.keys(errors).length === 0) {
        setCurrentStep(currentStep + 1);
        setAttemptedNext2(false);
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
    setAttemptedNext(false);
    setAttemptedNext2(false);
  };

  // Handlers for updating wizard data
  const updatePreferences = (data: Partial<WizardData>) => {
    setWizardData((prev) => ({ ...prev, ...data }));
  };
  const updateBudget = (budget: WizardData['budget']) => {
    setWizardData((prev) => ({ ...prev, budget }));
  };

  const handleAddToItinerary = (activity: any) => {
    if (!itinerary.find(item => item.id === activity.id)) {
      setItinerary([...itinerary, activity]);
    }
  };

  const handleRemoveFromItinerary = (activityId: string) => {
    setItinerary(itinerary.filter(item => item.id !== activityId));
  };

  const handleConfirm = async () => {
    setConfirmLoading(true);
    setConfirmError(null);
    setRecError(null);
    setRecLoading(true);
    try {
      const recs = await fetchRecommendations(wizardData);
      setRecommendations(recs);
      setCurrentStep(currentStep + 1);
    } catch (err: any) {
      setRecError(err.message || 'Failed to fetch recommendations');
    } finally {
      setConfirmLoading(false);
      setRecLoading(false);
    }
  };

  let stepContent;
  let nextDisabled = false;
  switch (currentStep) {
    case 1:
      nextDisabled = attemptedNext && Object.keys(step1Errors).length > 0;
      stepContent = (
        <Step1Preferences
          values={wizardData}
          onChange={updatePreferences}
          errors={step1Errors}
          attemptedNext={attemptedNext}
        />
      );
      break;
    case 2:
      nextDisabled = attemptedNext2 && Object.keys(step2Errors).length > 0;
      stepContent = (
        <Step2Budget
          value={wizardData.budget}
          onChange={updateBudget}
          errors={step2Errors}
          attemptedNext={attemptedNext2}
        />
      );
      break;
    case 3:
      stepContent = (
        <Step3Review
          values={wizardData}
          onConfirm={handleConfirm}
          loading={confirmLoading}
          error={confirmError || undefined}
        />
      );
      break;
    case 4:
      stepContent = (
        <div className="space-y-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Recommended Activities</h2>
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-2">Your Itinerary</h3>
            {itinerary.length === 0 ? (
              <p className="text-gray-500">No activities added yet.</p>
            ) : (
              <ul className="space-y-2">
                {itinerary.map(item => (
                  <li key={item.id} className="flex items-center justify-between bg-gray-50 rounded p-3">
                    <span>
                      <span className="font-semibold">{item.time}</span> — {item.title}
                    </span>
                    <button
                      className="text-red-600 hover:underline ml-4"
                      onClick={() => handleRemoveFromItinerary(item.id)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {recLoading && <div className="text-center text-lg">Loading recommendations...</div>}
          {recError && <div className="text-center text-red-600 font-medium">{recError}</div>}
          {!recLoading && !recError && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recommendations.map((rec) => (
                <RecommendationCard
                  key={rec.id}
                  {...rec}
                  selected={!!itinerary.find(item => item.id === rec.id)}
                  onAdd={() => handleAddToItinerary(rec)}
                />
              ))}
            </div>
          )}
        </div>
      );
      break;
    default:
      stepContent = null;
  }

  return (
    <WizardContainer
      currentStep={currentStep}
      totalSteps={totalSteps}
      onNext={handleNext}
      onBack={handleBack}
      nextDisabled={nextDisabled}
    >
      {stepContent}
    </WizardContainer>
  );
} 