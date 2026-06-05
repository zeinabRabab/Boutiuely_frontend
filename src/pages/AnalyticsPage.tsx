import React, { useEffect, useState, useCallback } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend,
  ComposedChart, Line
} from 'recharts';
import {
  BarChart3, Lightbulb, CheckCircle, TrendingUp, Brain,
  RefreshCw, Package, Users, ShoppingBag, AlertTriangle
} from 'lucide-react';
import { analyticsAPI } from '../services/api';
import {
  AnalysisReport, RevenuePoint, OrderStatusCount,
  CategoryBreakdown, UserGrowthPoint, InventorySummary
} from '../types';
import { Button, Card, LoadingSpinner, Alert, Badge } from '../components/UI';

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b', confirmed: '#3b82f6', shipped: '#8b5cf6',
  delivered: '#22c55e', cancelled: '#ef4444',
};
const CHART_COLORS = ['#a855f7', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316'];

const EmptyChart: React.FC<{ height?: number; message: string }> = ({ height = 280, message }) => (
  <div className={`flex flex-col items-center justify-center gap-3 text-gray-400`} style={{ height }}>
    <BarChart3 size={32} className="opacity-30" />
    <p className="text-sm">{message}</p>
  </div>
);

export const AnalyticsPage: React.FC = () => {
  const [revenueTrend, setRevenueTrend] = useState<RevenuePoint[]>([]);
  const [orderStatus, setOrderStatus] = useState<OrderStatusCount[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryBreakdown[]>([]);
  const [userGrowth, setUserGrowth] = useState<UserGrowthPoint[]>([]);
  const [inventory, setInventory] = useState<InventorySummary | null>(null);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [loadingCharts, setLoadingCharts] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [trendDays, setTrendDays] = useState(30);
  const [userDays, setUserDays] = useState(30);

  const fetchCharts = useCallback(async () => {
    try {
      setLoadingCharts(true);
      const [trendRes, statusRes, catRes, userRes, invRes] = await Promise.all([
        analyticsAPI.revenueTrend(trendDays),
        analyticsAPI.orderStatus(),
        analyticsAPI.categoryBreakdown(),
        analyticsAPI.userGrowth(userDays),
        analyticsAPI.inventory(),
      ]);
      setRevenueTrend(trendRes.data);
      setOrderStatus(statusRes.data);
      setCategoryData(catRes.data);
      setUserGrowth(userRes.data);
      setInventory(invRes.data);
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to load analytics');
    } finally {
      setLoadingCharts(false);
    }
  }, [trendDays, userDays]);

  const runAnalysis = async () => {
    setAnalyzing(true);
    setError('');
    try {
      const res = await analyticsAPI.analyze();
      setReport(res.data);
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => { fetchCharts(); }, [fetchCharts]);

  const totalRevenue = revenueTrend.reduce((s, r) => s + r.revenue, 0);
  const totalOrders = revenueTrend.reduce((s, r) => s + r.orders, 0);
  const avgDaily = revenueTrend.length > 0 ? totalRevenue / revenueTrend.length : 0;

  return (
    <div className="space-y-6 fade-in">
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Analytics</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Deep insights into your store performance</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" onClick={() => fetchCharts()} loading={loadingCharts} size="sm">
            <RefreshCw size={14} /> Refresh
          </Button>
          <Button onClick={runAnalysis} loading={analyzing}>
            <Brain size={16} />
            {analyzing ? 'Analyzing…' : 'Run AI Analysis'}
          </Button>
        </div>
      </div>

      {/* KPI Summary */}
      {!loadingCharts && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Period Revenue', value: `$${totalRevenue.toFixed(2)}`, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
            { label: 'Period Orders', value: totalOrders, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { label: 'Avg Daily Revenue', value: `$${avgDaily.toFixed(2)}`, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
            { label: 'Categories Selling', value: categoryData.length, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          ].map((item, i) => (
            <div key={i} className={`${item.bg} rounded-xl p-4 text-center`}>
              <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      )}

      {loadingCharts ? <LoadingSpinner text="Loading analytics…" /> : (
        <>
          {/* Revenue Over Period */}
          <Card
            title="Revenue Over Period"
            icon={<TrendingUp size={18} />}
            action={
              <select
                value={trendDays}
                onChange={(e) => setTrendDays(Number(e.target.value))}
                className="text-xs px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:border-purple-500"
              >
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 14 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
                <option value={365}>Last year</option>
              </select>
            }
          >
            {revenueTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={revenueTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => trendDays > 60 ? v.slice(0, 7) : v.slice(5)} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    formatter={(v: number, name: string) => [
                      name === 'revenue' ? `$${v.toFixed(2)}` : v,
                      name === 'revenue' ? 'Revenue' : 'Orders'
                    ]}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
                  />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#a855f7" fill="url(#revGrad)" strokeWidth={2.5} name="revenue" />
                  <Bar yAxisId="right" dataKey="orders" fill="#c084fc" opacity={0.6} radius={[3, 3, 0, 0]} name="orders" />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="No revenue data in this period — place some orders!" />
            )}
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order Status Pie */}
            <Card title="Order Status Breakdown" icon={<ShoppingBag size={18} />}>
              {orderStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={orderStatus} dataKey="count" nameKey="status"
                      cx="50%" cy="50%" outerRadius={100} innerRadius={55}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {orderStatus.map((entry) => (
                        <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#8b5cf6'} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: number, name: string) => [v, name]}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
                    />
                    <Legend iconType="circle" formatter={(v) => <span style={{ fontSize: 12, textTransform: 'capitalize' }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart height={260} message="No orders yet" />
              )}
            </Card>

            {/* User Registrations */}
            <Card
              title="User Registrations"
              icon={<Users size={18} />}
              action={
                <select
                  value={userDays}
                  onChange={(e) => setUserDays(Number(e.target.value))}
                  className="text-xs px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:border-purple-500"
                >
                  <option value={7}>Last 7 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={90}>Last 90 days</option>
                </select>
              }
            >
              {userGrowth.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={userGrowth} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                    <defs>
                      <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.4} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip
                      formatter={(v: number) => [v, 'New Users']}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="new_users" fill="url(#userGrad)" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart height={260} message={`No new user registrations in the last ${userDays} days`} />
              )}
            </Card>
          </div>

          {/* Category Breakdown */}
          {categoryData.length > 0 && (
            <Card title="Revenue by Category" icon={<Package size={18} />}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={categoryData} layout="vertical" margin={{ left: 0, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                    <YAxis type="category" dataKey="category" tick={{ fontSize: 11 }} width={90} />
                    <Tooltip
                      formatter={(v: number) => [`$${v.toFixed(2)}`, 'Revenue']}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="revenue" radius={[0, 5, 5, 0]}>
                      {categoryData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-700/50">
                        {['Category', 'Units', 'Revenue'].map(h => (
                          <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {categoryData.map((c, i) => (
                        <tr key={c.category} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                          <td className="px-3 py-2.5 flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                            <span className="font-medium text-gray-900 dark:text-white">{c.category}</span>
                          </td>
                          <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400">{c.units_sold}</td>
                          <td className="px-3 py-2.5 font-semibold text-green-600">${c.revenue.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          )}

          {/* Inventory Health */}
          {inventory && (
            <Card title="Inventory Health" icon={<Package size={18} />}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Total Stock Value', value: `$${inventory.total_stock_value.toLocaleString()}`, color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300' },
                  { label: 'Out of Stock', value: inventory.out_of_stock, color: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300' },
                  { label: 'Low Stock (≤threshold)', value: inventory.low_stock, color: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300' },
                  { label: 'Healthy Stock', value: inventory.healthy_stock, color: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' },
                ].map((item, i) => (
                  <div key={i} className={`rounded-xl p-4 text-center ${item.color}`}>
                    <p className="text-xl font-bold">{item.value}</p>
                    <p className="text-xs mt-1 opacity-80">{item.label}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {inventory.by_category.map((cat) => (
                  <div key={cat.category} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{cat.category}</p>
                    <p className="text-xs text-gray-500 mt-1">{cat.count} products · {cat.total_stock} units</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      {/* AI Analysis Report */}
      {report && (
        <div className="space-y-4 fade-in">
          <div className="flex items-center gap-2">
            <Brain size={20} className="text-purple-600" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">AI Analysis Report</h3>
            <span className="text-xs text-gray-400">Generated {new Date(report.generated_at).toLocaleString()}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.entries(report.summary).map(([key, val]) => (
              <div key={key} className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center">
                <p className="text-xl font-bold text-purple-700 dark:text-purple-300">
                  {key === 'total_revenue' ? `$${Number(val).toFixed(2)}` : val}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-1">
                  {key.replace(/_/g, ' ')}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card title="📊 Key Insights" icon={<Lightbulb size={18} />}>
              <ul className="space-y-2.5">
                {report.insights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="text-purple-500 mt-0.5 flex-shrink-0">•</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </Card>
            <Card title="✅ Recommendations" icon={<CheckCircle size={18} />}>
              <ul className="space-y-2.5">
                {report.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="text-green-500 mt-0.5 flex-shrink-0">→</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {report.top_products.length > 0 && (
            <Card title="🏆 Top Performing Products">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      {['#', 'Product', 'Category', 'Units Sold', 'Revenue'].map(h => (
                        <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {report.top_products.map((p, i) => (
                      <tr key={p.product_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <td className="px-3 py-2.5">
                          <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 text-xs flex items-center justify-center font-bold">{i + 1}</span>
                        </td>
                        <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-white">{p.name}</td>
                        <td className="px-3 py-2.5 text-gray-500">{p.category || '—'}</td>
                        <td className="px-3 py-2.5 font-semibold">{p.total_sold}</td>
                        <td className="px-3 py-2.5 font-semibold text-green-600">${p.total_revenue.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
