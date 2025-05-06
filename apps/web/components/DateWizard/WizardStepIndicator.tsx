import React from 'react';

interface WizardStepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const WizardStepIndicator: React.FC<WizardStepIndicatorProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex justify-center space-x-2 mb-4">
      {Array.from({ length: totalSteps }).map((_, idx) => (
        <div
          key={idx}
          className={`w-3 h-3 rounded-full ${idx === currentStep ? 'bg-blue-600' : 'bg-gray-300'}`}
        />
      ))}
    </div>
  );
};

export default WizardStepIndicator; 