import WizardStepIndicator from './WizardStepIndicator';
import WizardNavigation from './WizardNavigation';
import React from 'react';

interface WizardContainerProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  nextDisabled?: boolean;
}

const WizardContainer: React.FC<WizardContainerProps> = ({ children, currentStep, totalSteps, onNext, onBack, nextDisabled }) => {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <WizardStepIndicator currentStep={currentStep} totalSteps={totalSteps} />
      <div className="my-8">{children}</div>
      <WizardNavigation
        currentStep={currentStep}
        totalSteps={totalSteps}
        onNext={onNext}
        onBack={onBack}
        nextDisabled={nextDisabled}
      />
    </div>
  );
};

export default WizardContainer; 