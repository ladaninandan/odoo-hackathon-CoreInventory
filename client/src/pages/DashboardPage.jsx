import { useEffect, useState } from 'react';
import api from '../services/api';
import PageWrapper from '../components/layout/PageWrapper';
import { PageSpinner } from '../components/common/Spinner';
import { Package, DollarSign, AlertTriangle, TrendingUp, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

function KpiCard({ icon: Icon, label, value, sub, color = 'brand' }) {
  const bgColors = { brand: 'bg-brand-600/20', blue: 'bg-blue-600/20', amber: 'bg-amber-600/20', red: 'bg-red-600/20' };
  const iconColors = { brand: 'text-brand-400', blue: 'text-blue-400', amber: 'text-amber-400', red: 'text-red-400' };

  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={`flex-shrink-0 rounded-xl p-3 ${bgColors[color]}`}>
        <Icon className={`h-6 w-6 ${iconColors[color]}`} />
      </div>
      <div>
        <p className="text-sm text-surface-400 mb-1">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {sub && <p className="text-xs text-surface-500 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

const tooltipStyle = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(51,65,85,0.5)', borderRadius: 12, fontSize: 13 },
  labelStyle: { color: '#94a3b8' },
};

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const { kpi, charts } = data || { kpi: {}, charts: {} };

  return (
    <PageWrapper title="Dashboard" description="Overview of your inventory">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard icon={Package} label="Total Products" value={kpi.totalProducts || 0} color="brand" />
        <KpiCard icon={DollarSign} label="Stock Value" value={`₹${(kpi.totalStockValue || 0).toLocaleString()}`} color="blue" />
        <KpiCard icon={AlertTriangle} label="Low Stock Items" value={kpi.lowStockCount || 0} color={kpi.lowStockCount > 0 ? 'red' : 'brand'} />
        <KpiCard icon={Activity} label="Today's Movements" value={kpi.recentMovements || 0} sub={`${kpi.totalReceipts || 0} receipts · ${kpi.totalDeliveries || 0} deliveries`} color="amber" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Trend chart — Line */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-surface-300 mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-brand-400" /> Stock Movement Trends (7 days)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.trendData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip {...tooltipStyle} />
                <Legend />
                <Line type="monotone" dataKey="inbound" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Inbound" />
                <Line type="monotone" dataKey="outbound" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="Outbound" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products — Bar */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-surface-300 mb-4 flex items-center gap-2">
            <ArrowUpRight className="h-4 w-4 text-blue-400" /> Top Products by Movement
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.topProducts || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={100} stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="totalMovement" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Total Movement" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Stock by Warehouse — Pie */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-surface-300 mb-4 flex items-center gap-2">
            <Package className="h-4 w-4 text-amber-400" /> Stock Distribution by Warehouse
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.stockByWarehouse || []}
                  cx="50%" cy="50%"
                  innerRadius={0}
                  outerRadius={80}
                  dataKey="total"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {(charts.stockByWarehouse || []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Movement Breakdown — Donut */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-surface-300 mb-4 flex items-center gap-2">
            <ArrowDownRight className="h-4 w-4 text-red-400" /> Movement Type Breakdown
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.movementBreakdown || []}
                  cx="50%" cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="count"
                  nameKey="type"
                  label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                >
                  {(charts.movementBreakdown || []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
