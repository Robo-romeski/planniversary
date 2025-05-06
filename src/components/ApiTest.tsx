'use client';

import { useState } from 'react';

export default function ApiTest() {
  const [result, setResult] = useState<string>('');

  const testApi = async () => {
    try {
      const response = await fetch('/api/test');
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult('Error: ' + (error as Error).message);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">API Test</h2>
      <button
        onClick={testApi}
        className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
      >
        Test API Connection
      </button>
      {result && (
        <pre className="mt-4 p-4 bg-gray-100 rounded overflow-auto">
          {result}
        </pre>
      )}
    </div>
  );
} 