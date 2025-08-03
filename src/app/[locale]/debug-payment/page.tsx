'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function DebugPaymentPage() {
  const [loading, setLoading] = useState(false);
  const [debugData, setDebugData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDebugInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/debug-checkout');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setDebugData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebugInfo();
  }, []);

  const renderValue = (value: any): string => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'boolean') return value ? '✅' : '❌';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Payment Debug Information</h1>
      
      <div className="mb-4">
        <Button onClick={fetchDebugInfo} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Refresh Debug Info
        </Button>
      </div>

      {error && (
        <Card className="mb-6 border-red-500">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm">{error}</pre>
          </CardContent>
        </Card>
      )}

      {debugData && (
        <>
          {/* Summary */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(debugData.summary || {}).map(([key, value]) => (
                  <div key={key}>
                    <span className="font-semibold">{key}:</span>{' '}
                    <span className={typeof value === 'boolean' ? (value ? 'text-green-600' : 'text-red-600') : ''}>
                      {renderValue(value)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Environment Variables */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Environment Variables</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(debugData.checks?.envVars, null, 2)}
              </pre>
            </CardContent>
          </Card>

          {/* Price IDs */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Price IDs</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(debugData.checks?.priceIds, null, 2)}
              </pre>
            </CardContent>
          </Card>

          {/* Database Status */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Database Connection</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(debugData.checks?.database, null, 2)}
              </pre>
            </CardContent>
          </Card>

          {/* Errors */}
          {debugData.errors && debugData.errors.length > 0 && (
            <Card className="mb-6 border-red-500">
              <CardHeader>
                <CardTitle className="text-red-500">Errors</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm overflow-auto text-red-600">
                  {JSON.stringify(debugData.errors, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Full Debug Data */}
          <Card>
            <CardHeader>
              <CardTitle>Full Debug Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(debugData, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}