import React from 'react';

interface WizardNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  nextDisabled?: boolean;
}

const WizardNavigation: React.FC<WizardNavigationProps> = ({ currentStep, totalSteps, onNext, onBack, nextDisabled }) => {
  return (
    <div className="flex justify-between mt-8">
      <button
        type="button"
        className="px-6 py-2 rounded bg-gray-200 text-gray-700 font-semibold disabled:opacity-50"
        onClick={onBack}
        disabled={currentStep === 1}
      >
        Back
      </button>
      <button
        type="button"
        className="px-6 py-2 rounded bg-blue-600 text-white font-semibold disabled:opacity-50"
        onClick={onNext}
        disabled={currentStep === totalSteps || nextDisabled}
      >
        Next
      </button>
    </div>
  );
};

export default WizardNavigation; 