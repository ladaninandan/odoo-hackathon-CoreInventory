import { useEffect, useState } from 'react';
import api from '../services/api';
import PageWrapper from '../components/layout/PageWrapper';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const typeColors = {
  receipt: 'success',
  delivery: 'danger',
  adjustment: 'warning',
  transfer_in: 'info',
  transfer_out: 'info',
};

export default function HistoryPage() {
  const [entries, setEntries] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, limit: 30, pages: 0 });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ type: 'all', startDate: '', endDate: '' });

  const fetchEntries = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 30 };
      if (filters.type !== 'all') params.type = filters.type;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const { data } = await api.get('/ledger', { params });
      setEntries(data.data.items);
      setPagination(data.data.pagination);
    } catch (err) {
      // silent
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEntries(1);
  }, [filters]);

  return (
    <PageWrapper title="Stock History" description="Immutable audit trail of all stock movements">
      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <select className="input w-auto" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
          <option value="all">All Types</option>
          <option value="receipt">Receipt</option>
          <option value="delivery">Delivery</option>
          <option value="adjustment">Adjustment</option>
          <option value="transfer_in">Transfer In</option>
          <option value="transfer_out">Transfer Out</option>
        </select>
        <input
          type="date"
          className="input w-auto"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          placeholder="Start date"
        />
        <input
          type="date"
          className="input w-auto"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          placeholder="End date"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-700/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-400">Product</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-400">Warehouse</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-400">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-400">Qty Change</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-400 hidden md:table-cell">Note</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-400 hidden md:table-cell">By</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-400 hidden lg:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-700/30">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-surface-500">Loading...</td></tr>
              ) : entries.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-surface-500">No entries found</td></tr>
              ) : (
                entries.map((e) => (
                  <tr key={e._id} className="hover:bg-surface-700/20 transition-colors">
                    <td className="px-4 py-3 text-sm text-surface-100">{e.product?.name}</td>
                    <td className="px-4 py-3 text-sm text-surface-300">{e.warehouse?.name}</td>
                    <td className="px-4 py-3"><Badge variant={typeColors[e.type] || 'info'}>{e.type}</Badge></td>
                    <td className={`px-4 py-3 text-sm font-mono font-semibold ${e.qtyChange > 0 ? 'text-brand-400' : 'text-red-400'}`}>
                      {e.qtyChange > 0 ? `+${e.qtyChange}` : e.qtyChange}
                    </td>
                    <td className="px-4 py-3 text-sm text-surface-400 hidden md:table-cell truncate max-w-[200px]">{e.note}</td>
                    <td className="px-4 py-3 text-sm text-surface-400 hidden md:table-cell">{e.performedBy?.name}</td>
                    <td className="px-4 py-3 text-sm text-surface-500 hidden lg:table-cell">{new Date(e.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-surface-700/50 px-4 py-3">
            <p className="text-sm text-surface-400">Page {pagination.page} of {pagination.pages}</p>
            <div className="flex gap-2">
              <Button variant="outline" disabled={pagination.page <= 1} onClick={() => fetchEntries(pagination.page - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" disabled={pagination.page >= pagination.pages} onClick={() => fetchEntries(pagination.page + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
