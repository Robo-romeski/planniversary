// Disabled: This component is commented out because the backend health check endpoints are disabled for development.
/*
'use client';

import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export default function ApiTest() {
  const [healthStatus, setHealthStatus] = useState<{
    status: string;
    timestamp: string | null;
    loading: boolean;
    error: string | null;
  }>({
    status: 'Loading...',
    timestamp: null,
    loading: true,
    error: null,
  });

  const [messageStatus, setMessageStatus] = useState<{
    message: string;
    loading: boolean;
    error: string | null;
  }>({
    message: 'Loading...',
    loading: true,
    error: null,
  });

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await api.get('/health');
        setHealthStatus({
          status: response.status,
          timestamp: response.timestamp,
          loading: false,
          error: null,
        });
      } catch (err: any) {
        console.error('Health check error:', err);
        setHealthStatus({
          status: 'Error',
          timestamp: null,
          loading: false,
          error: err?.message || 'Failed to check API health',
        });
      }
    };

    const fetchMessage = async () => {
      try {
        const response = await api.get('/message');
        setMessageStatus({
          message: response.message || '',
          loading: false,
          error: null,
        });
      } catch (err: any) {
        console.error('Message fetch error:', err);
        setMessageStatus({
          message: 'Error',
          loading: false,
          error: err?.message || 'Failed to fetch message',
        });
      }
    };

    // Initial fetch
    checkHealth();
    fetchMessage();

    // Set up polling for health check every 30 seconds
    const healthInterval = setInterval(checkHealth, 30000);

    // Cleanup
    return () => {
      clearInterval(healthInterval);
    };
  }, []);

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-2">API Health Check</h2>
      <div className="space-y-2">
        <p className={`${healthStatus.loading ? 'text-yellow-600' : healthStatus.error ? 'text-red-600' : 'text-green-600'}`}>
          Status: {healthStatus.status}
        </p>
        {healthStatus.timestamp && (
          <p className="text-gray-600 text-sm">
            Last checked: {new Date(healthStatus.timestamp).toLocaleString()}
          </p>
        )}
        {healthStatus.error && (
          <p className="text-red-600 text-sm">Error: {healthStatus.error}</p>
        )}
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Backend Message</h2>
        <div className="space-y-2">
          <p className={`${messageStatus.loading ? 'text-yellow-600' : messageStatus.error ? 'text-red-600' : 'text-green-600'}`}>
            {messageStatus.message}
          </p>
          {messageStatus.error && (
            <p className="text-red-600 text-sm">Error: {messageStatus.error}</p>
          )}
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-500">
        <p>API URL: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}</p>
      </div>
    </div>
  );
}
*/ 