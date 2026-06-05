import React, { useEffect, useState, useCallback } from 'react';
import {
  Package, ShoppingCart, Users, DollarSign, Clock, CheckCircle,
  AlertTriangle, TrendingUp, RefreshCw, Bell, Brain, Lightbulb,
  BarChart3, Activity
} from 'lucide-react';
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts';
import { analyticsAPI, productsAPI } from '../services/api';
import {
  DashboardStats, TopProduct, RevenuePoint, OrderStatusCount,
  LowStockProduct, AnalysisReport,
} from '../types';
import { Button, Card, LoadingSpinner, Alert, Badge } from '../components/UI';

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b', confirmed: '#3b82f6', shipped: '#8b5cf6',
  delivered: '#22c55e', cancelled: '#ef4444',
};
const CHART_COLORS = ['#a855f7','#3b82f6','#22c55e','#f59e0b','#ef4444','#ec4899','#14b8a6','#f97316'];
const AUTO_REFRESH = 30_000;

const STAT_CARDS = (s: DashboardStats) => [
  { label: 'Total Revenue',   value: `$${s.total_revenue.toFixed(2)}`, icon: DollarSign,    grad: 'from-violet-500 to-purple-700' },
  { label: 'Total Orders',    value: s.total_orders,                   icon: ShoppingCart,  grad: 'from-blue-500 to-blue-700' },
  { label: 'Total Products',  value: s.total_products,                 icon: Package,       grad: 'from-pink-500 to-rose-600' },
  { label: 'Total Users',     value: s.total_users,                    icon: Users,         grad: 'from-teal-500 to-cyan-700' },
  { label: 'Pending',         value: s.pending_orders,                 icon: Clock,         grad: 'from-amber-500 to-orange-600' },
  { label: 'Delivered',       value: s.delivered_orders,               icon: CheckCircle,   grad: 'from-green-500 to-emerald-700' },
  { label: 'Low Stock',       value: s.low_stock_count,                icon: AlertTriangle, grad: 'from-red-500 to-red-700' },
  { label: 'Avg Order Value', value: `$${s.total_orders ? (s.total_revenue/s.total_orders).toFixed(2) : '0.00'}`, icon: TrendingUp, grad: 'from-indigo-500 to-indigo-700' },
];

const EmptyChart: React.FC<{h?: number; msg: string}> = ({h=240, msg}) => (
  <div className="flex flex-col items-center justify-center gap-2 text-gray-400" style={{height: h}}>
    <BarChart3 size={28} className="opacity-25"/>
    <p className="text-xs">{msg}</p>
  </div>
);

export const DashboardPage: React.FC = () => {
  const [stats,       setStats]       = useState<DashboardStats | null>(null);
  const [topProds,    setTopProds]    = useState<TopProduct[]>([]);
  const [trend,       setTrend]       = useState<RevenuePoint[]>([]);
  const [statusData,  setStatusData]  = useState<OrderStatusCount[]>([]);
  const [lowStock,    setLowStock]    = useState<LowStockProduct[]>([]);
  const [catData,     setCatData]     = useState<any[]>([]);
  const [userGrowth,  setUserGrowth]  = useState<any[]>([]);
  const [report,      setReport]      = useState<AnalysisReport | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [analyzing,   setAnalyzing]   = useState(false);
  const [error,       setError]       = useState('');
  const [trendDays,   setTrendDays]   = useState(30);
  const [userDays,    setUserDays]    = useState(30);
  const [showAlerts,  setShowAlerts]  = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchAll = useCallback(async (manual = false) => {
    try {
      if (manual) setRefreshing(true);
      const [statsR, topR, trendR, statusR, lowR, catR, userR] = await Promise.all([
        analyticsAPI.dashboard(),
        analyticsAPI.topProducts(6),
        analyticsAPI.revenueTrend(trendDays),
        analyticsAPI.orderStatus(),
        productsAPI.lowStock(),
        analyticsAPI.categoryBreakdown(),
        analyticsAPI.userGrowth(userDays),
      ]);
      setStats(statsR.data);
      setTopProds(topR.data);
      setTrend(trendR.data);
      setStatusData(statusR.data);
      setLowStock(lowR.data);
      setCatData(catR.data);
      setUserGrowth(userR.data);
      setLastRefresh(new Date());
      setError('');
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [trendDays, userDays]);

  const runAnalysis = async () => {
    setAnalyzing(true);
    try { const r = await analyticsAPI.analyze(); setReport(r.data); }
    catch (e: any) { setError(e.response?.data?.detail || 'Analysis failed'); }
    finally { setAnalyzing(false); }
  };

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => {
    const id = setInterval(() => fetchAll(), AUTO_REFRESH);
    return () => clearInterval(id);
  }, [fetchAll]);

  if (loading) return <LoadingSpinner text="Loading dashboard…" />;

  return (
    <div className="space-y-4 fade-in">
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* ── Header row ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Dashboard</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {lastRefresh.toLocaleTimeString()} · auto-refreshes every 30s
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {lowStock.length > 0 && (
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-xs font-medium hover:bg-amber-100 transition-colors"
            >
              <Bell size={13}/> {lowStock.length} alerts
              <span className="bg-amber-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">{lowStock.length}</span>
            </button>
          )}
          <Button variant="secondary" size="sm" onClick={() => fetchAll(true)} loading={refreshing}>
            <RefreshCw size={13}/> Refresh
          </Button>
          <Button size="sm" onClick={runAnalysis} loading={analyzing}>
            <Brain size={13}/> {analyzing ? 'Analyzing…' : 'AI Analysis'}
          </Button>
        </div>
      </div>

      {/* ── Low stock banner ──────────────────────────────────────────── */}
      {stats && stats.low_stock_count > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-2.5 flex items-center gap-3">
          <AlertTriangle size={16} className="text-amber-500 flex-shrink-0"/>
          <p className="text-sm text-amber-700 dark:text-amber-300 flex-1">
            <span className="font-semibold">{stats.low_stock_count} product{stats.low_stock_count !== 1 ? 's' : ''}</span> at or below alert threshold.
          </p>
          <button onClick={() => setShowAlerts(!showAlerts)} className="text-xs text-amber-600 underline font-medium">
            {showAlerts ? 'Hide' : 'View'}
          </button>
        </div>
      )}

      {/* ── Low stock table ───────────────────────────────────────────── */}
      {showAlerts && lowStock.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-amber-200 dark:border-amber-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-amber-100 dark:border-amber-800 flex items-center gap-2">
            <Bell size={15} className="text-amber-500"/>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Low Stock Alerts</span>
            <span className="ml-auto text-xs text-gray-400">{lowStock.length} items</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>{['Product','Category','Stock','Threshold','Status'].map(h=>(
                  <th key={h} className="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {lowStock.map(item=>(
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-3 py-2 font-medium text-gray-900 dark:text-white">{item.name}</td>
                    <td className="px-3 py-2 text-gray-500">{item.category||'—'}</td>
                    <td className="px-3 py-2 font-bold text-red-600">{item.stock}</td>
                    <td className="px-3 py-2 text-gray-500">{item.alert_threshold}</td>
                    <td className="px-3 py-2">
                      <Badge label={item.status==='out'?'Out of Stock':item.status==='critical'?'Critical':'Low Stock'} variant={item.status==='out'?'red':'yellow'}/>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── KPI Cards ────────────────────────────────────────────────── */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {STAT_CARDS(stats).map((c, i) => {
            const Icon = c.icon;
            return (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-3 flex flex-col gap-2">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${c.grad} flex items-center justify-center`}>
                  <Icon size={15} className="text-white"/>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">{c.label}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5 leading-tight">{c.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Revenue + Orders chart ────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-purple-600"/>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Revenue Over Time</h3>
          </div>
          <select
            value={trendDays}
            onChange={e => setTrendDays(Number(e.target.value))}
            className="text-xs px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:border-purple-500"
          >
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
          </select>
        </div>
        {trend.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={trend} margin={{top:4, right:16, bottom:4, left:0}}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" strokeOpacity={0.7}/>
              <XAxis dataKey="date" tick={{fontSize:10}} tickFormatter={v => v.slice(5)} tickCount={8}/>
              <YAxis yAxisId="l" tick={{fontSize:10}} tickFormatter={v=>`$${v}`} width={52}/>
              <YAxis yAxisId="r" orientation="right" tick={{fontSize:10}} allowDecimals={false} width={30}/>
              <Tooltip
                formatter={(v:number, name:string) => [name==='revenue'?`$${v.toFixed(2)}`:v, name==='revenue'?'Revenue':'Orders']}
                contentStyle={{borderRadius:'8px', border:'none', boxShadow:'0 4px 16px rgba(0,0,0,.1)', fontSize:12}}
              />
              <Legend iconSize={10} formatter={v=><span style={{fontSize:11, textTransform:'capitalize'}}>{v}</span>}/>
              <Area yAxisId="l" type="monotone" dataKey="revenue" stroke="#a855f7" fill="url(#revGrad)" strokeWidth={2.5} name="revenue" dot={false} activeDot={{r:4}}/>
              <Bar yAxisId="r" dataKey="orders" fill="#c084fc" opacity={0.55} radius={[2,2,0,0]} name="orders"/>
            </ComposedChart>
          </ResponsiveContainer>
        ) : <EmptyChart msg="No revenue data yet"/>}
      </div>

      {/* ── Row 2: Pie + User growth ──────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Order status pie */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <ShoppingCart size={16} className="text-purple-600"/>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Order Status</h3>
          </div>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusData} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} innerRadius={48}>
                  {statusData.map(e=><Cell key={e.status} fill={STATUS_COLORS[e.status]||'#8b5cf6'}/>)}
                </Pie>
                <Tooltip formatter={(v:number, name:string)=>[v, name]} contentStyle={{borderRadius:'8px',border:'none',boxShadow:'0 4px 16px rgba(0,0,0,.1)',fontSize:12}}/>
                <Legend iconSize={9} iconType="circle" formatter={v=><span style={{fontSize:11, textTransform:'capitalize'}}>{v}</span>}/>
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyChart h={200} msg="No orders yet"/>}
        </div>

        {/* User registrations */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-purple-600"/>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">User Registrations</h3>
            </div>
            <select
              value={userDays}
              onChange={e => setUserDays(Number(e.target.value))}
              className="text-xs px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:border-purple-500"
            >
              <option value={7}>7 days</option>
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
            </select>
          </div>
          {userGrowth.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={userGrowth} margin={{top:4, right:8, bottom:4, left:0}}>
                <defs>
                  <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.85}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" strokeOpacity={0.7}/>
                <XAxis dataKey="date" tick={{fontSize:10}} tickFormatter={v=>v.slice(5)} tickCount={8}/>
                <YAxis tick={{fontSize:10}} allowDecimals={false} width={28}/>
                <Tooltip formatter={(v:number)=>[v,'New Users']} contentStyle={{borderRadius:'8px',border:'none',boxShadow:'0 4px 16px rgba(0,0,0,.1)',fontSize:12}}/>
                <Bar dataKey="new_users" fill="url(#userGrad)" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart h={200} msg="No registration data"/>}
        </div>
      </div>

      {/* ── Row 3: Category bar + Top products table ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 lg:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <Package size={16} className="text-purple-600"/>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Revenue by Category</h3>
          </div>
          {catData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={catData} layout="vertical" margin={{left:0, right:16}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" strokeOpacity={0.7}/>
                <XAxis type="number" tick={{fontSize:10}} tickFormatter={v=>`$${v}`} width={40}/>
                <YAxis type="category" dataKey="category" tick={{fontSize:10}} width={80}/>
                <Tooltip formatter={(v:number)=>[`$${v.toFixed(2)}`,'Revenue']} contentStyle={{borderRadius:'8px',border:'none',boxShadow:'0 4px 16px rgba(0,0,0,.1)',fontSize:12}}/>
                <Bar dataKey="revenue" radius={[0,4,4,0]}>
                  {catData.map((_,i)=><Cell key={i} fill={CHART_COLORS[i%CHART_COLORS.length]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart h={200} msg="No category data yet"/>}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 lg:col-span-3">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={16} className="text-purple-600"/>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Top Products</h3>
          </div>
          {topProds.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>{['#','Product','Category','Sold','Revenue'].map(h=>(
                    <th key={h} className="px-3 py-2 text-left font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {topProds.map((p,i)=>(
                    <tr key={p.product_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-3 py-2.5">
                        <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 text-xs flex items-center justify-center font-bold">{i+1}</span>
                      </td>
                      <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-white max-w-[140px] truncate">{p.name}</td>
                      <td className="px-3 py-2.5 text-gray-500">{p.category||'—'}</td>
                      <td className="px-3 py-2.5 font-semibold">{p.total_sold}</td>
                      <td className="px-3 py-2.5 font-semibold text-green-600">${p.total_revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-gray-400">No sales data yet — place some orders!</div>
          )}
        </div>
      </div>

      {/* ── AI Analysis section (shown after clicking AI Analysis button) ── */}
      {report && (
        <div className="space-y-4 fade-in">
          <div className="flex items-center gap-2 pt-1">
            <Brain size={18} className="text-purple-600"/>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">AI Analysis Report</h3>
            <span className="text-xs text-gray-400">· {new Date(report.generated_at).toLocaleString()}</span>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {Object.entries(report.summary).map(([key, val]) => (
              <div key={key} className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                  {key === 'total_revenue' ? `$${Number(val).toFixed(2)}` : val}
                </p>
                <p className="text-xs text-gray-500 capitalize mt-0.5">{key.replace(/_/g,' ')}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb size={15} className="text-purple-600"/>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Key Insights</h4>
              </div>
              <ul className="space-y-2">
                {report.insights.map((s,i)=>(
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                    <span className="text-purple-400 mt-0.5 flex-shrink-0">•</span>{s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={15} className="text-green-500"/>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Recommendations</h4>
              </div>
              <ul className="space-y-2">
                {report.recommendations.map((s,i)=>(
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                    <span className="text-green-400 mt-0.5 flex-shrink-0">→</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
