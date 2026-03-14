import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import PageWrapper from '../components/layout/PageWrapper';
import { PageSpinner } from '../components/common/Spinner';
import {
  Package,
  AlertTriangle,
  Truck,
  MoreHorizontal,
  Plus,
  DollarSign,
  ArrowRightLeft,
  ClipboardList,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const chartRanges = [
  { key: '7', label: 'Last 7 days' },
  { key: '30', label: 'Last 30 days' },
  { key: '90', label: 'Last 90 days' },
  { key: '365', label: 'Last year' },
];

function KpiCard({ icon: Icon, label, value, sub, subPositive, iconBg, iconColor, className = '' }) {
  return (
    <div className={`card p-5 flex items-start gap-4 ${className}`}>
      <div className={`flex-shrink-0 rounded-lg p-2.5 ${iconBg}`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        {sub != null && (
          <p className={`text-xs mt-1 ${subPositive ? 'text-green-600' : 'text-red-600'}`}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

function formatDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function statusBadge(status) {
  const s = (status || '').toLowerCase();
  if (s === 'done') return <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">Done</span>;
  if (s === 'ready' || s === 'waiting') return <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">Verifying</span>;
  if (s === 'canceled') return <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">Canceled</span>;
  return <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">{status || '—'}</span>;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartRange, setChartRange] = useState('7');

  useEffect(() => {
    const load = async () => {
      try {
        const { data: resp } = await api.get('/reports/dashboard');
        setData(resp.data);
      } catch (err) {
        // silent
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <PageSpinner />;

  const { kpi = {}, charts = {}, recentOperations = [], criticalAlerts = [] } = data || {};
  const trendData = charts.trendData || [];
  const topProducts = charts.topProducts || [];
  const stockByWarehouseRaw = charts.stockByWarehouse || [];
  const stockByWarehouse = stockByWarehouseRaw
    .map((w) => ({ ...w, total: Math.max(0, Number(w.total)) }))
    .filter((w) => w.total > 0);

  const movementBreakdownRaw = charts.movementBreakdown || [];
  const movementTypeLabels = { receipt: 'Receipt', delivery: 'Delivery', adjustment: 'Adjustment', transfer_in: 'Transfer In', transfer_out: 'Transfer Out' };
  const movementBreakdown = movementBreakdownRaw.map((m) => ({
    ...m,
    name: movementTypeLabels[m.type] || (m.type || '').replace(/_/g, ' '),
    count: Number(m.count) || 0,
  }));

  const WAREHOUSE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];
  const MOVEMENT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Format date for chart axis (e.g. "Oct 24" or "Mar 14")
  const trendDataDisplay = trendData.map((d) => ({
    ...d,
    dateLabel: d.date ? new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : d.date,
  }));

  const actions = (
    <>
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        onClick={() => navigate('/reports')}
      >
        Export Report
      </button>
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-500"
        onClick={() => navigate('/products')}
      >
        <Plus className="h-4 w-4" />
        Add product
      </button>
    </>
  );

  return (
    <PageWrapper
      title="Inventory Overview"
      description="Overview of your inventory"
      actions={actions}
    >
      {/* KPI Cards — 4 cards like the design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Package}
          label="Total Products"
          value={(kpi.totalProducts ?? 0).toLocaleString()}
          sub={kpi.totalProducts > 0 ? '+9.2% vs last month' : null}
          subPositive
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          className="animation-delay-75"
        />
        <KpiCard
          icon={AlertTriangle}
          label="Low Stock"
          value={kpi.lowStockCount ?? 0}
          sub={kpi.lowStockCount > 0 ? '-0.2% vs last month' : null}
          subPositive={false}
          iconBg="bg-red-100"
          iconColor="text-red-600"
          className="animation-delay-150"
        />
        <KpiCard
          icon={Truck}
          label="Pending Receipt"
          value={kpi.pendingReceipts ?? 0}
          sub="29 Delivered"
          iconBg="bg-red-100"
          iconColor="text-red-600"
          className="animation-delay-200"
        />
        <KpiCard
          icon={Truck}
          label="Pending Delivery"
          value={kpi.pendingDeliveries ?? 0}
          sub="+4.3% Today's target"
          subPositive
          iconBg="bg-violet-100"
          iconColor="text-violet-600"
          className="animation-delay-300"
        />
      </div>

      {/* Quick stats — Stock Value & Pending summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <div className="card p-5 flex items-center gap-4">
          <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/40 p-3">
            <DollarSign className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Stock Value</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              ₹{(kpi.totalStockValue ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>
        <div className="card p-5">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Pending Operations</p>
          <div className="flex flex-wrap gap-4">
            <button type="button" onClick={() => navigate('/receipts')} className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
              <ClipboardList className="h-5 w-5" />
              <span className="font-semibold">{kpi.pendingReceipts ?? 0}</span> Receipts
            </button>
            <button type="button" onClick={() => navigate('/deliveries')} className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
              <Truck className="h-5 w-5" />
              <span className="font-semibold">{kpi.pendingDeliveries ?? 0}</span> Deliveries
            </button>
            <button type="button" onClick={() => navigate('/transfers')} className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
              <ArrowRightLeft className="h-5 w-5" />
              <span className="font-semibold">{kpi.pendingTransfers ?? 0}</span> Transfers
            </button>
          </div>
        </div>
      </div>

      {/* Recent Operations + Inventory Movements + Critical Alerts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Operations — takes 2 cols */}
        <div className="xl:col-span-2 card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Recent Operations</h3>
            <button
              type="button"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
              onClick={() => navigate('/history')}
            >
              View All Operations
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reference</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Source / Destination</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {recentOperations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-sm text-gray-500">
                      No recent operations
                    </td>
                  </tr>
                ) : (
                  recentOperations.map((op) => (
                    <tr key={op.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-5 py-3 text-sm font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">{op.reference}</td>
                      <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-300">{op.type}</td>
                      <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-300">{op.sourceDestination || '—'}</td>
                      <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{formatDate(op.date)}</td>
                      <td className="px-5 py-3">{statusBadge(op.status)}</td>
                      <td className="px-5 py-3 text-right">
                        <button type="button" className="p-1 text-gray-400 hover:text-gray-600 rounded">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {recentOperations.length > 0 && (
            <div className="flex items-center justify-between px-5 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
              <button type="button" className="text-sm text-gray-500 hover:text-gray-700">Previous</button>
              <button type="button" className="text-sm text-gray-500 hover:text-gray-700">Next</button>
            </div>
          )}
        </div>

        {/* Right column: Stock Movement Trends + Critical Alerts */}
        <div className="space-y-6">
          {/* Stock Movement Trends — line chart */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Stock Movement Trends</h3>
              <div className="flex gap-1">
                {chartRanges.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setChartRange(key)}
                    className={`rounded px-2 py-1 text-xs font-medium ${
                      chartRange === key
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-52 min-h-[200px]">
              {trendDataDisplay.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendDataDisplay} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}
                      labelStyle={{ color: '#374151' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="inbound" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Inbound" />
                    <Line type="monotone" dataKey="outbound" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="Outbound" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-gray-400">
                  No movement data for the selected period.
                </div>
              )}
            </div>
          </div>

          {/* Critical Alerts */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Critical Alerts</h3>
            {criticalAlerts.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No critical alerts</p>
            ) : (
              <ul className="space-y-2">
                {criticalAlerts.map((alert, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                    <span>{alert.message || `${alert.sku} out of stock`}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Top Products + Stock by Warehouse + Movement Type Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Top Products by Movement — bar chart */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Top Products by Movement</h3>
          <div className="h-80 min-h-[280px]">
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="#9ca3af" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}
                    formatter={(value) => [`${value} units`, 'Movement']}
                  />
                  <Bar dataKey="totalMovement" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Total Movement" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-gray-400">
                No product movement data yet.
              </div>
            )}
          </div>
        </div>

        {/* Stock Distribution by Warehouse — pie chart */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Stock Distribution by Warehouse</h3>
          <div className="h-80 min-h-[280px]">
            {stockByWarehouse.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stockByWarehouse}
                    dataKey="total"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={50}
                    paddingAngle={2}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {stockByWarehouse.map((_, index) => (
                      <Cell key={index} fill={WAREHOUSE_COLORS[index % WAREHOUSE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}
                    formatter={(value) => [`${value} units`, 'Stock']}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-gray-400">
                No warehouse stock data yet.
              </div>
            )}
          </div>
        </div>

        {/* Movement Type Breakdown — pie chart */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Movement Type Breakdown</h3>
          <div className="h-80 min-h-[280px]">
            {movementBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={movementBreakdown}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={45}
                    paddingAngle={2}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {movementBreakdown.map((_, index) => (
                      <Cell key={index} fill={MOVEMENT_COLORS[index % MOVEMENT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}
                    formatter={(value) => [`${value} transactions`, 'Count']}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-gray-400">
                No movement data yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
