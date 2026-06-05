import React, { useState, useEffect } from 'react';
import {
  FileText, Download, FileSpreadsheet, CheckCircle,
  RefreshCw, TrendingUp, Package, ShoppingCart, Users
} from 'lucide-react';
import { reportsAPI, analyticsAPI } from '../services/api';
import { Button, Card, Alert, LoadingSpinner } from '../components/UI';
import { DashboardStats, TopProduct } from '../types';

const downloadBlob = (data: BlobPart, filename: string, mimeType: string) => {
  const url = URL.createObjectURL(new Blob([data], { type: mimeType }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const ReportsPage: React.FC = () => {
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [loadingCSV, setLoadingCSV] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(true);

  useEffect(() => {
    const loadPreview = async () => {
      try {
        const [statsRes, topRes] = await Promise.all([
          analyticsAPI.dashboard(),
          analyticsAPI.topProducts(5),
        ]);
        setStats(statsRes.data);
        setTopProducts(topRes.data);
      } catch {
        // Non-critical — just don't show preview
      } finally {
        setLoadingPreview(false);
      }
    };
    loadPreview();
  }, []);

  const downloadCSV = async () => {
    setLoadingCSV(true);
    setError('');
    try {
      const res = await reportsAPI.downloadCSV();
      const cd = res.headers['content-disposition'] || '';
      const filename = cd.split('filename=')[1]?.replace(/"/g, '') || 'boutiquely_report.csv';
      downloadBlob(res.data, filename, 'text/csv');
      setSuccess('✅ CSV report downloaded successfully!');
    } catch {
      setError('Failed to generate CSV report. Please try again.');
    } finally {
      setLoadingCSV(false);
    }
  };

  const downloadPDF = async () => {
    setLoadingPDF(true);
    setError('');
    try {
      const res = await reportsAPI.downloadPDF();
      const cd = res.headers['content-disposition'] || '';
      const filename = cd.split('filename=')[1]?.replace(/"/g, '') || 'boutiquely_report.pdf';
      downloadBlob(res.data, filename, 'application/pdf');
      setSuccess('✅ PDF report downloaded successfully!');
    } catch (e: any) {
      setError('Failed to generate PDF. Ensure reportlab is installed: pip install reportlab');
    } finally {
      setLoadingPDF(false);
    }
  };

  const reportSections = [
    '📊 KPI Summary (Revenue, Orders, Users, Products)',
    '🏆 Top Selling Products with Revenue Breakdown',
    '📈 Daily Revenue Trend (Last 30 Days)',
    '📦 Order Status Distribution',
    '🤖 AI-Generated Insights',
    '💡 Business Recommendations',
    '⚠️ Low Stock Alerts',
    '🔒 System Health Overview',
  ];

  return (
    <div className="space-y-6 fade-in">
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FileText size={22} className="text-purple-500" />
          Reports
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Generate and download comprehensive business reports with AI insights — all data pulled live from the database
        </p>
      </div>

      {/* Live Data Preview */}
      {!loadingPreview && stats && (
        <Card title="📊 Live Report Preview" subtitle="Current data that will be included in the report">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
            {[
              { icon: <TrendingUp size={16} />, label: 'Total Revenue', value: `$${stats.total_revenue.toFixed(2)}`, color: 'text-purple-600' },
              { icon: <ShoppingCart size={16} />, label: 'Total Orders', value: stats.total_orders, color: 'text-blue-600' },
              { icon: <Package size={16} />, label: 'Products', value: stats.total_products, color: 'text-pink-600' },
              { icon: <Users size={16} />, label: 'Users', value: stats.total_users, color: 'text-teal-600' },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
                <div className={`flex items-center justify-center gap-1 ${item.color} mb-1`}>
                  {item.icon}
                </div>
                <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>

          {topProducts.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Top 5 Products</p>
              <div className="space-y-1.5">
                {topProducts.map((p, i) => (
                  <div key={p.product_id} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                      <span className="text-gray-700 dark:text-gray-300">{p.name}</span>
                    </span>
                    <span className="font-semibold text-green-600">${p.total_revenue.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Download Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PDF Report */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-br from-red-500 to-pink-600 p-6 text-white">
            <FileText size={36} className="mb-3 opacity-90" />
            <h3 className="text-xl font-bold">PDF Report</h3>
            <p className="text-red-100 text-sm mt-1">Professional formatted report with tables and branding</p>
          </div>
          <div className="p-6 space-y-4">
            <ul className="space-y-2">
              {['KPI Summary & Statistics', 'Revenue trend tables', 'Top products with revenue', 'AI insights & recommendations', 'Professional layout & branding'].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="pt-2">
              <p className="text-xs text-gray-400 mb-3">Format: PDF · Powered by ReportLab</p>
              <Button onClick={downloadPDF} loading={loadingPDF} className="w-full justify-center" size="lg">
                <Download size={18} />
                {loadingPDF ? 'Generating PDF…' : 'Download PDF Report'}
              </Button>
            </div>
          </div>
        </div>

        {/* CSV Report */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-br from-green-500 to-teal-600 p-6 text-white">
            <FileSpreadsheet size={36} className="mb-3 opacity-90" />
            <h3 className="text-xl font-bold">CSV Report</h3>
            <p className="text-green-100 text-sm mt-1">Spreadsheet-ready data export for further analysis</p>
          </div>
          <div className="p-6 space-y-4">
            <ul className="space-y-2">
              {['All KPIs in tabular format', 'Top products with full data', 'Revenue trend day-by-day', 'AI insights as text', 'Excel / Google Sheets compatible'].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="pt-2">
              <p className="text-xs text-gray-400 mb-3">Format: CSV · Compatible with Excel & Sheets</p>
              <Button onClick={downloadCSV} loading={loadingCSV} variant="success" className="w-full justify-center" size="lg">
                <Download size={18} />
                {loadingCSV ? 'Generating CSV…' : 'Download CSV Report'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Contents */}
      <Card title="📋 What's included in every report" subtitle="All sections generated from live database data">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
          {reportSections.map((section, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2">
              {section}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
