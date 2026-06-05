import React, { useEffect, useState } from 'react';
import { Activity, RefreshCw, AlertCircle, Zap, Clock, TrendingDown } from 'lucide-react';
import { monitoringAPI } from '../services/api';
import { SystemReport } from '../types';
import { Card, StatCard, Table, LoadingSpinner, Alert, Button, Badge } from '../components/UI';

export const MonitoringPage: React.FC = () => {
  const [report, setReport] = useState<SystemReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await monitoringAPI.systemReport();
      setReport(res.data);
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to load system report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReport(); }, []);

  const healthStatus = () => {
    if (!report) return { label: 'Unknown', color: 'gray' };
    if (report.error_rate_percent > 10) return { label: 'Critical', color: 'red' };
    if (report.error_rate_percent > 5) return { label: 'Warning', color: 'yellow' };
    return { label: 'Healthy', color: 'green' };
  };

  const health = healthStatus();

  return (
    <div className="space-y-6 fade-in">
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity size={22} className="text-purple-500" />
            System Monitor
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Live API performance and monitoring</p>
        </div>
        <Button variant="secondary" onClick={fetchReport} loading={loading}>
          <RefreshCw size={14} /> Refresh
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading system report…" />
      ) : report ? (
        <>
          {/* Health Badge */}
          <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 px-5 py-4 shadow-sm">
            <div className={`w-3 h-3 rounded-full pulse-glow ${health.color === 'green' ? 'bg-green-500' : health.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'}`} />
            <div>
              <span className="font-semibold text-gray-900 dark:text-white">System Status: </span>
              <Badge
                label={health.label}
                variant={health.color as any}
              />
            </div>
            <span className="text-xs text-gray-400 ml-auto">Auto-monitored via middleware</span>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
            <StatCard
              label="Total API Calls"
              value={report.total_api_calls.toLocaleString()}
              icon={<Zap size={22} className="text-white" />}
              color="bg-gradient-to-br from-purple-500 to-purple-700"
            />
            <StatCard
              label="Error Rate"
              value={`${report.error_rate_percent.toFixed(1)}%`}
              icon={<AlertCircle size={22} className="text-white" />}
              color={`bg-gradient-to-br ${report.error_rate_percent > 5 ? 'from-red-500 to-red-700' : 'from-green-500 to-green-700'}`}
            />
            <StatCard
              label="Avg Response"
              value={`${report.avg_response_ms.toFixed(0)}ms`}
              icon={<Clock size={22} className="text-white" />}
              color="bg-gradient-to-br from-blue-500 to-blue-700"
            />
            <StatCard
              label="Login Attempts (24h)"
              value={report.login_attempts_24h}
              icon={<Activity size={22} className="text-white" />}
              color="bg-gradient-to-br from-teal-500 to-teal-700"
            />
            <StatCard
              label="Recommendation Calls"
              value={report.recommendation_requests}
              icon={<TrendingDown size={22} className="text-white" />}
              color="bg-gradient-to-br from-pink-500 to-pink-700"
            />
            <StatCard
              label="Error Count"
              value={Math.round(report.total_api_calls * report.error_rate_percent / 100)}
              icon={<AlertCircle size={22} className="text-white" />}
              color="bg-gradient-to-br from-orange-500 to-orange-700"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Endpoints */}
            <Card title="🔥 Most Called Endpoints" subtitle="By request count">
              {report.top_endpoints.length > 0 ? (
                <div className="space-y-2 mt-1">
                  {report.top_endpoints.map((ep, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-400 flex-1 truncate">
                        {ep.endpoint}
                      </span>
                      <span className="text-sm font-semibold text-purple-600 dark:text-purple-400 flex-shrink-0">
                        {ep.calls}
                      </span>
                      <div className="w-20 bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 flex-shrink-0">
                        <div
                          className="bg-purple-500 h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, (ep.calls / (report.top_endpoints[0]?.calls || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 py-4 text-center">No API calls recorded yet</p>
              )}
            </Card>

            {/* Recent Errors */}
            <Card title="❌ Recent Errors" subtitle="Last 10 failed requests">
              {report.recent_errors.length > 0 ? (
                <div className="space-y-2 mt-1">
                  {report.recent_errors.map((err, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm p-2 bg-red-50 dark:bg-red-900/10 rounded-lg">
                      <span className="text-xs font-bold text-red-500 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded flex-shrink-0">
                        {err.status}
                      </span>
                      <span className="font-mono text-xs text-gray-600 dark:text-gray-400 flex-1 truncate">{err.endpoint}</span>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {err.time ? new Date(err.time).toLocaleTimeString() : ''}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 py-6 justify-center text-green-600">
                  <span className="text-2xl">✅</span>
                  <p className="text-sm font-medium">No errors recorded — system is clean!</p>
                </div>
              )}
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
};
