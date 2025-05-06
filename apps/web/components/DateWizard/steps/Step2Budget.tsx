import React from 'react';
import type { WizardData } from '../../../app/date-wizard/page';

type Step2BudgetProps = {
  value: WizardData['budget'];
  onChange: (budget: WizardData['budget']) => void;
  errors?: Partial<Record<keyof WizardData['budget'], string>>;
  attemptedNext?: boolean;
};

export default function Step2Budget({ value, onChange, errors = {}, attemptedNext = false }: Step2BudgetProps) {
  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value: val } = e.target;
    onChange({ ...value, [name]: val });
  };

  const showCustomCurrency = value.currency === 'OTHER';

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Step 2: Budget</h2>
      <form className="space-y-8">
        <section className="bg-gray-50 rounded-lg shadow-sm p-6 border border-gray-200">
          <label className="block font-semibold mb-2 text-gray-800" htmlFor="minBudget">
            Budget Range
            <span className="block text-xs text-gray-500 font-normal mt-1" id="budget-desc">
              Set your minimum and maximum budget for the date.
            </span>
          </label>
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <div className="flex-1">
              <label htmlFor="minBudget" className="block text-sm font-medium text-gray-700 mb-1">Min Budget</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  id="minBudget"
                  name="min"
                  min={0}
                  aria-label="Minimum budget"
                  aria-describedby="budget-desc"
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition ${attemptedNext && errors.min ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400 focus:border-blue-400'}`}
                  placeholder="0"
                  value={value.min}
                  onChange={handleInput}
                />
                <span className="text-gray-500">{showCustomCurrency ? value.currency : value.currency}</span>
              </div>
              {attemptedNext && errors.min && (
                <p className="text-red-600 text-sm mt-1">{errors.min}</p>
              )}
            </div>
            <div className="flex-1">
              <label htmlFor="maxBudget" className="block text-sm font-medium text-gray-700 mb-1">Max Budget</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  id="maxBudget"
                  name="max"
                  min={0}
                  aria-label="Maximum budget"
                  aria-describedby="budget-desc"
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition ${attemptedNext && errors.max ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400 focus:border-blue-400'}`}
                  placeholder="100"
                  value={value.max}
                  onChange={handleInput}
                />
                <span className="text-gray-500">{showCustomCurrency ? value.currency : value.currency}</span>
              </div>
              {attemptedNext && errors.max && (
                <p className="text-red-600 text-sm mt-1">{errors.max}</p>
              )}
            </div>
          </div>
        </section>
        <section className="bg-gray-50 rounded-lg shadow-sm p-6 border border-gray-200">
          <label htmlFor="currency" className="block font-semibold mb-2 text-gray-800">
            Currency
            <span className="block text-xs text-gray-500 font-normal mt-1" id="currency-desc">
              Choose your preferred currency.
            </span>
          </label>
          <select
            id="currency"
            name="currency"
            aria-label="Currency"
            aria-describedby="currency-desc"
            className={`w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 transition ${attemptedNext && errors.currency ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400 focus:border-blue-400'}`}
            value={value.currency}
            onChange={handleInput}
          >
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="CAD">CAD - Canadian Dollar</option>
            <option value="AUD">AUD - Australian Dollar</option>
            <option value="OTHER">Other</option>
          </select>
          {showCustomCurrency && (
            <input
              type="text"
              name="currency"
              aria-label="Custom currency code"
              placeholder="Enter currency code (e.g., JPY)"
              className="mt-2 w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={value.currency !== 'OTHER' ? value.currency : ''}
              onChange={handleInput}
            />
          )}
          {attemptedNext && errors.currency && (
            <p className="text-red-600 text-sm mt-1">{errors.currency}</p>
          )}
        </section>
      </form>
    </div>
  );
} 