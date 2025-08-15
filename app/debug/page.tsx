'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<{
    hasUser?: boolean;
    hasAccessToken?: boolean;
    user?: { role?: string } | null;
    accessTokenLength?: number;
    accessTokenPreview?: string;
  }>({});
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; status: string; data?: unknown }>>({});

  useEffect(() => {
    checkLocalStorage();
  }, []);

  const checkLocalStorage = () => {
    const user = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');
    
    setDebugInfo({
      hasUser: !!user,
      hasAccessToken: !!accessToken,
      user: user ? JSON.parse(user) : null,
      accessTokenLength: accessToken?.length || 0,
      accessTokenPreview: accessToken ? `${accessToken.substring(0, 10)}...` : 'None',
    });
  };

  const testBankerLogin = async () => {
    try {
      const response = await fetch('/api/auth/banker-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'banker@bank.com',
          password: 'banker123'
        })
      });
      
      const data = await response.json();
      setTestResults(prev => ({
        ...prev,
        bankerLogin: {
          status: String(response.status),
          success: response.ok,
          data: response.ok ? data : data.error
        }
      }));

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('accessToken', data.tokens.accessToken);
        checkLocalStorage();
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        bankerLogin: {
          status: 'Error',
          success: false,
          data: error instanceof Error ? error.message : 'Unknown error'
        }
      }));
    }
  };

  const testBankerAccounts = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      console.log('Testing banker accounts with token:', {
        hasToken: !!accessToken,
        tokenLength: accessToken?.length,
        tokenPreview: accessToken ? accessToken.substring(0, 10) + '...' : 'None'
      });

      const response = await fetch('/api/banker/accounts', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      console.log('Banker accounts response:', {
        status: String(response.status),
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      const data = await response.json();
      console.log('Banker accounts data:', data);

      setTestResults(prev => ({
        ...prev,
        bankerAccounts: {
          status: String(response.status),
          success: response.ok,
          data: response.ok ? `${data.accounts?.length || 0} accounts found` : data.error || data
        }
      }));
    } catch (error) {
      console.error('Banker accounts test error:', error);
      setTestResults(prev => ({
        ...prev,
        bankerAccounts: {
          status: 'Error',
          success: false,
          data: error instanceof Error ? error.message : 'Unknown error'
        }
      }));
    }
  };

  const clearLocalStorage = async () => {
    // Clear everything completely
    localStorage.clear();
    sessionStorage.clear();
    
    console.log('All storage cleared from debug page');
    
    checkLocalStorage();
    setTestResults({});
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Banking Portal Debug Page
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Test authentication and API endpoints
          </p>
        </div>

        {/* LocalStorage Debug */}
        <Card>
          <CardHeader>
            <CardTitle>LocalStorage Debug</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Has User:</strong> {debugInfo.hasUser ? '✅' : '❌'}
                </div>
                <div>
                  <strong>Has Access Token:</strong> {debugInfo.hasAccessToken ? '✅' : '❌'}
                </div>
                <div>
                  <strong>User Role:</strong> {debugInfo.user?.role || 'None'}
                </div>
                <div>
                  <strong>Token Length:</strong> {debugInfo.accessTokenLength}
                </div>
              </div>
              {debugInfo.user && (
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm">
                  <strong>User Data:</strong>
                  <pre>{JSON.stringify(debugInfo.user, null, 2)}</pre>
                </div>
              )}
              <div className="flex space-x-2">
                <Button onClick={checkLocalStorage} variant="outline">
                  Refresh Debug Info
                </Button>
                <Button onClick={clearLocalStorage} variant="destructive">
                  Clear LocalStorage
                </Button>
              </div>
              
              {debugInfo.accessTokenPreview && debugInfo.accessTokenPreview !== 'None' && (
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded text-sm">
                  <strong>Current Access Token:</strong>
                  <div className="font-mono text-xs break-all mt-1">
                    {localStorage.getItem('accessToken')}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

                  {/* API Tests */}
        <Card>
          <CardHeader>
            <CardTitle>API Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex space-x-4 flex-wrap gap-2">
                <Button onClick={testBankerLogin}>
                  Test Banker Login
                </Button>
                <Button onClick={testBankerAccounts} disabled={!debugInfo.hasAccessToken}>
                  Test Banker Accounts API
                </Button>
                <Button 
                  onClick={async () => {
                    try {
                      const accessToken = localStorage.getItem('accessToken');
                      const response = await fetch('/api/auth/logout', {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${accessToken}` }
                      });
                      const data = await response.json();
                      setTestResults(prev => ({
                        ...prev,
                        logout: {
                          status: String(response.status),
                          success: response.ok,
                          data: data.message || 'Logout test completed'
                        }
                      }));
                      // Don't clear localStorage here so we can see the test result
                    } catch (error) {
                      setTestResults(prev => ({
                        ...prev,
                        logout: {
                          status: 'Error',
                          success: false,
                          data: error instanceof Error ? error.message : 'Unknown error'
                        }
                      }));
                    }
                  }}
                  disabled={!debugInfo.hasAccessToken}
                  variant="destructive"
                >
                  Test Logout API
                </Button>
              </div>
              
              {Object.entries(testResults).map(([test, result]) => (
                <div key={test} className="border rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <strong>{test}:</strong>
                    <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                      {result.success ? '✅' : '❌'} Status: {result.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {typeof result.data === 'string' ? result.data : JSON.stringify(result.data)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Button>
                <a href="/banker/login">Banker Login</a>
              </Button>
              <Button>
                <a href="/banker/dashboard">Banker Dashboard</a>
              </Button>
              <Button>
                <a href="/login">Customer Login</a>
              </Button>
              <Button onClick={() => window.location.href = '/'}>
                Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
