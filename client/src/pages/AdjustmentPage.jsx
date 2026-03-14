import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdjustments, createAdjustment } from '../features/operations/adjustmentsSlice';
import { fetchProducts, fetchWarehouses } from '../features/products/productsSlice';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdjustmentPage() {
  const dispatch = useDispatch();
  const { items, pagination, loading } = useSelector((s) => s.adjustments);
  const products = useSelector((s) => s.products.items);
  const warehouses = useSelector((s) => s.products.warehouses);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ product: '', warehouse: '', qtyChange: 0, reason: '' });

  useEffect(() => {
    dispatch(fetchAdjustments({ page: pagination.page, limit: pagination.limit }));
    dispatch(fetchProducts({}));
    dispatch(fetchWarehouses());
  }, [dispatch]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const result = await dispatch(createAdjustment({ ...form, qtyChange: parseInt(form.qtyChange, 10) }));
    if (createAdjustment.fulfilled.match(result)) {
      toast.success('Adjustment applied');
      setShowForm(false);
      setForm({ product: '', warehouse: '', qtyChange: 0, reason: '' });
      dispatch(fetchAdjustments({ page: 1, limit: pagination.limit }));
    } else {
      toast.error(result.payload?.message || 'Failed');
    }
  };

  return (
    <PageWrapper
      title="Adjustments"
      description={`${pagination.total} adjustments`}
      actions={
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" /> New Adjustment
        </Button>
      }
    >
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Product</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Warehouse</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Qty Change</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 hidden md:table-cell">Reason</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 hidden md:table-cell">By</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 hidden lg:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">No adjustments</td></tr>
              ) : (
                items.map((a) => (
                  <tr key={a._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900">{a.product?.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{a.warehouse?.name}</td>
                    <td className={`px-4 py-3 text-sm font-mono font-semibold ${a.qtyChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {a.qtyChange > 0 ? `+${a.qtyChange}` : a.qtyChange}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">{a.reason}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">{a.adjustedBy?.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 hidden lg:table-cell">{new Date(a.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-sm text-gray-500">Page {pagination.page} of {pagination.pages}</p>
            <div className="flex gap-2">
              <Button variant="outline" disabled={pagination.page <= 1} onClick={() => dispatch(fetchAdjustments({ page: pagination.page - 1, limit: pagination.limit }))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" disabled={pagination.page >= pagination.pages} onClick={() => dispatch(fetchAdjustments({ page: pagination.page + 1, limit: pagination.limit }))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="New Adjustment">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Product *</label>
            <select className="input" value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} required>
              <option value="">Select product</option>
              {products.map((p) => <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>)}
            </select>
          </div>
          <div>
            <label className="label">Warehouse *</label>
            <select className="input" value={form.warehouse} onChange={(e) => setForm({ ...form, warehouse: e.target.value })} required>
              <option value="">Select warehouse</option>
              {warehouses.map((w) => <option key={w._id} value={w._id}>{w.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Quantity Change * <span className="text-gray-500">(use negative to reduce)</span></label>
            <input type="number" className="input font-mono" value={form.qtyChange} onChange={(e) => setForm({ ...form, qtyChange: e.target.value })} required />
          </div>
          <div>
            <label className="label">Reason *</label>
            <textarea className="input min-h-[80px] resize-y" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} required rows={2} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit">Apply Adjustment</Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}
