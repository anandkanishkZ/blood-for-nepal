import React, { useState, useEffect } from 'react';
import { Settings, Smartphone, AlertCircle, CheckCircle, RefreshCw, Send, Activity } from 'lucide-react';
import { showToast } from '../../utils/toast';

const SmsProviderManagement = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testPhone, setTestPhone] = useState('9825733821');
  const [balances, setBalances] = useState({});
  const [health, setHealth] = useState(null);

  useEffect(() => {
    fetchProviderConfig();
    fetchProviderHealth();
    fetchBalances();
  }, []);

  const fetchProviderConfig = async () => {
    try {
      const response = await fetch('/api/v1/admin/sms-providers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConfig(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch provider config:', error);
      showToast.error('Failed to load SMS provider configuration');
    } finally {
      setLoading(false);
    }
  };

  const fetchProviderHealth = async () => {
    try {
      const response = await fetch('/api/v1/admin/sms-providers/health', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setHealth(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch provider health:', error);
    }
  };

  const fetchBalances = async () => {
    try {
      const response = await fetch('/api/v1/admin/sms-providers/balance', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBalances(data.data.balances);
      }
    } catch (error) {
      console.error('Failed to fetch balances:', error);
    }
  };

  const switchProvider = async (provider) => {
    try {
      const response = await fetch('/api/v1/admin/sms-providers/switch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ provider })
      });
      
      if (response.ok) {
        const data = await response.json();
        showToast.success(data.message);
        fetchProviderConfig();
        fetchProviderHealth();
      } else {
        const error = await response.json();
        showToast.error(error.message || 'Failed to switch provider');
      }
    } catch (error) {
      console.error('Failed to switch provider:', error);
      showToast.error('Failed to switch SMS provider');
    }
  };

  const testProvider = async (provider = null) => {
    setTesting(true);
    try {
      const response = await fetch('/api/v1/admin/sms-providers/test-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          phone: testPhone,
          provider 
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        showToast.success(`Test OTP sent successfully via ${data.data.provider}! OTP: ${data.data.otp}`);
      } else {
        const error = await response.json();
        showToast.error(error.message || 'Test failed');
      }
    } catch (error) {
      console.error('Test failed:', error);
      showToast.error('Failed to send test OTP');
    } finally {
      setTesting(false);
    }
  };

  const refreshData = () => {
    fetchProviderConfig();
    fetchProviderHealth();
    fetchBalances();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-8 h-8 animate-spin text-red-500" />
        <span className="ml-2">Loading SMS provider configuration...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Smartphone className="w-6 h-6" />
            SMS Provider Management
          </h2>
          <p className="text-gray-600 mt-1">
            Manage SMS providers, check balances, and test delivery
          </p>
        </div>
        <button
          onClick={refreshData}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* System Status */}
      {health && (
        <div className={`p-4 rounded-lg border-l-4 ${
          health.systemStatus === 'Operational' 
            ? 'bg-green-50 border-green-400' 
            : 'bg-yellow-50 border-yellow-400'
        }`}>
          <div className="flex items-center gap-2">
            <Activity className={`w-5 h-5 ${
              health.systemStatus === 'Operational' ? 'text-green-500' : 'text-yellow-500'
            }`} />
            <span className="font-medium">
              System Status: {health.systemStatus}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Active Provider: {health.activeProvider?.toUpperCase()} | 
            Failover: {health.failoverEnabled ? 'Enabled' : 'Disabled'}
          </p>
        </div>
      )}

      {/* Provider Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {config && Object.entries(config.providers).map(([key, provider]) => (
          <div key={key} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  {provider.name}
                  {key === config.active && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Active
                    </span>
                  )}
                </h3>
                <p className="text-sm text-gray-500">
                  {key.charAt(0).toUpperCase() + key.slice(1)} SMS Provider
                </p>
              </div>
              <div className="flex items-center gap-2">
                {provider.enabled ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            </div>

            {/* Provider Status */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${
                  provider.enabled ? 'text-green-600' : 'text-red-600'
                }`}>
                  {provider.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Mode:</span>
                <span className="font-medium">
                  {provider.devMode ? 'Development' : 'Production'}
                </span>
              </div>

              {balances[key] && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Balance:</span>
                  <span className={`font-medium ${
                    balances[key].success ? 'text-blue-600' : 'text-red-600'
                  }`}>
                    {balances[key].success 
                      ? `${balances[key].balance} credits` 
                      : 'Check failed'
                    }
                  </span>
                </div>
              )}

              {health?.providers[key] && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Health:</span>
                  <span className={`font-medium ${
                    health.providers[key].status === 'Healthy' 
                      ? 'text-green-600' 
                      : 'text-yellow-600'
                  }`}>
                    {health.providers[key].status}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {key !== config.active && (
                <button
                  onClick={() => switchProvider(key)}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Set Active
                </button>
              )}
              
              <button
                onClick={() => testProvider(key)}
                disabled={testing}
                className="flex items-center justify-center gap-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm disabled:opacity-50"
              >
                {testing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Test
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Test Panel */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Test SMS Delivery
        </h3>
        
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Phone Number
            </label>
            <input
              type="tel"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="98XXXXXXXX"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={() => testProvider()}
            disabled={testing || !testPhone}
            className="bg-red-600 text-white py-2 px-6 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {testing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Send Test OTP
          </button>
        </div>
        
        <p className="text-sm text-gray-500 mt-2">
          Send a test OTP using the currently active provider. The OTP will be displayed in the response.
        </p>
      </div>

      {/* Configuration Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Current Configuration</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Active Provider:</span>
            <span className="ml-2 font-medium">{config?.active?.toUpperCase()}</span>
          </div>
          <div>
            <span className="text-gray-600">Failover:</span>
            <span className="ml-2 font-medium">
              {config?.enableFailover ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Providers:</span>
            <span className="ml-2 font-medium">{config?.stats?.providersCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmsProviderManagement;
