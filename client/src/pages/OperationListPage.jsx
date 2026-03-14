import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import usePermission from '../hooks/usePermission';
import { Plus, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OperationListPage({
  title,
  sliceKey,
  fetchAction,
  createAction,
  validateAction,
  numberField,
  warehouseField = 'warehouse',
  showFrom,
  showTo,
}) {
  const dispatch = useDispatch();
  const { items, pagination, loading } = useSelector((s) => s[sliceKey]);
  const products = useSelector((s) => s.products.items);
  const warehouses = useSelector((s) => s.products.warehouses);
  const { can } = usePermission();
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // Determine if this page needs supplier or customer fields
  const isReceipts = title === 'Receipts';
  const isDeliveries = title === 'Deliveries';

  const [form, setForm] = useState({
    warehouse: '',
    fromWarehouse: '',
    toWarehouse: '',
    supplier: '',
    customer: '',
    lines: [{ product: '', qty: 1 }],
  });

  useEffect(() => {
    dispatch(fetchAction({ status: statusFilter, page: pagination.page, limit: pagination.limit }));
  }, [dispatch, statusFilter, pagination.page]);

  const addLine = () => setForm({ ...form, lines: [...form.lines, { product: '', qty: 1 }] });
  const removeLine = (i) => setForm({ ...form, lines: form.lines.filter((_, idx) => idx !== i) });
  const updateLine = (i, field, value) => {
    const updated = [...form.lines];
    updated[i] = { ...updated[i], [field]: field === 'qty' ? parseInt(value, 10) || 1 : value };
    setForm({ ...form, lines: updated });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const payload = { lines: form.lines };
    if (showFrom) {
      payload.fromWarehouse = form.fromWarehouse;
      payload.toWarehouse = form.toWarehouse;
    } else {
      payload.warehouse = form.warehouse;
    }
    if (isReceipts && form.supplier) payload.supplier = form.supplier;
    if (isDeliveries && form.customer) payload.customer = form.customer;

    const result = await dispatch(createAction(payload));
    if (createAction.fulfilled.match(result)) {
      toast.success(`${title.slice(0, -1)} created`);
      setShowForm(false);
      setForm({ warehouse: '', fromWarehouse: '', toWarehouse: '', supplier: '', customer: '', lines: [{ product: '', qty: 1 }] });
      dispatch(fetchAction({ status: statusFilter, page: 1, limit: pagination.limit }));
    } else {
      toast.error(result.payload?.message || 'Creation failed');
    }
  };

  const handleValidate = async (id) => {
    if (!window.confirm('Validate this operation? Stock will be updated.')) return;
    const result = await dispatch(validateAction(id));
    if (validateAction.fulfilled.match(result)) {
      toast.success('Validated — stock updated');
    } else {
      toast.error(result.payload?.message || 'Validation failed');
    }
  };

  const statusColors = { draft: 'warning', validated: 'success', waiting: 'info', ready: 'brand', done: 'success', canceled: 'destructive' };

  return (
    <PageWrapper
      title={title}
      description={`${pagination.total} records`}
      actions={
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" /> New
        </Button>
      }
    >
      {/* Status filter */}
      <div className="card p-4 flex gap-3 mb-0">
        <select className="input w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="waiting">Waiting</option>
          <option value="ready">Ready</option>
          <option value="done">Done</option>
          <option value="canceled">Canceled</option>
          <option value="validated">Validated</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-700/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-400">Number</th>
                {isReceipts && <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-400">Supplier</th>}
                {isDeliveries && <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-400">Customer</th>}
                {showFrom ? (
                  <>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-400">From</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-400">To</th>
                  </>
                ) : (
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-400">Warehouse</th>
                )}
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-400">Lines</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-400">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-400 hidden md:table-cell">Date</th>
                {can('validate') && <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-surface-400">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-700/30">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-surface-500">Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-surface-500">No records found</td></tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id} className="hover:bg-surface-700/20 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-surface-100">{item[numberField]}</td>
                    {isReceipts && <td className="px-4 py-3 text-sm text-surface-300">{item.supplier || '—'}</td>}
                    {isDeliveries && <td className="px-4 py-3 text-sm text-surface-300">{item.customer || '—'}</td>}
                    {showFrom ? (
                      <>
                        <td className="px-4 py-3 text-sm text-surface-300">{item.fromWarehouse?.name}</td>
                        <td className="px-4 py-3 text-sm text-surface-300">{item.toWarehouse?.name}</td>
                      </>
                    ) : (
                      <td className="px-4 py-3 text-sm text-surface-300">{item[warehouseField]?.name}</td>
                    )}
                    <td className="px-4 py-3 text-sm text-surface-400">{item.lines?.length || 0} line(s)</td>
                    <td className="px-4 py-3"><Badge variant={statusColors[item.status]}>{item.status}</Badge></td>
                    <td className="px-4 py-3 text-sm text-surface-500 hidden md:table-cell">{new Date(item.createdAt).toLocaleDateString()}</td>
                    {can('validate') && (
                      <td className="px-4 py-3 text-right">
                        {(item.status === 'draft' || item.status === 'ready') && (
                          <button
                            onClick={() => handleValidate(item._id)}
                            className="p-1.5 rounded-lg text-surface-400 hover:text-brand-400 hover:bg-surface-700 transition-colors"
                            aria-label="Validate"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    )}
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
              <Button variant="outline" disabled={pagination.page <= 1} onClick={() => dispatch(fetchAction({ status: statusFilter, page: pagination.page - 1, limit: pagination.limit }))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" disabled={pagination.page >= pagination.pages} onClick={() => dispatch(fetchAction({ status: statusFilter, page: pagination.page + 1, limit: pagination.limit }))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={`New ${title.slice(0, -1)}`} size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Supplier for Receipts */}
            {isReceipts && (
              <div className="sm:col-span-2">
                <label className="label">Supplier *</label>
                <input type="text" className="input" placeholder="Enter supplier name" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} required />
              </div>
            )}

            {/* Customer for Deliveries */}
            {isDeliveries && (
              <div className="sm:col-span-2">
                <label className="label">Customer *</label>
                <input type="text" className="input" placeholder="Enter customer name" value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} required />
              </div>
            )}

            {showFrom ? (
              <>
                <div>
                  <label className="label">From Warehouse *</label>
                  <select className="input" value={form.fromWarehouse} onChange={(e) => setForm({ ...form, fromWarehouse: e.target.value })} required>
                    <option value="">Select</option>
                    {warehouses.map((w) => <option key={w._id} value={w._id}>{w.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">To Warehouse *</label>
                  <select className="input" value={form.toWarehouse} onChange={(e) => setForm({ ...form, toWarehouse: e.target.value })} required>
                    <option value="">Select</option>
                    {warehouses.map((w) => <option key={w._id} value={w._id}>{w.name}</option>)}
                  </select>
                </div>
              </>
            ) : (
              <div className={isReceipts || isDeliveries ? '' : 'sm:col-span-2'}>
                <label className="label">Warehouse *</label>
                <select className="input" value={form.warehouse} onChange={(e) => setForm({ ...form, warehouse: e.target.value })} required>
                  <option value="">Select</option>
                  {warehouses.map((w) => <option key={w._id} value={w._id}>{w.name}</option>)}
                </select>
              </div>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="label mb-0">Line Items</label>
              <Button type="button" variant="outline" onClick={addLine}>
                <Plus className="h-3 w-3" /> Add Line
              </Button>
            </div>
            <div className="space-y-2">
              {form.lines.map((line, i) => (
                <div key={i} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <select className="input" value={line.product} onChange={(e) => updateLine(i, 'product', e.target.value)} required>
                      <option value="">Product</option>
                      {products.map((p) => <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>)}
                    </select>
                  </div>
                  <div className="w-24">
                    <input type="number" className="input" min={1} value={line.qty} onChange={(e) => updateLine(i, 'qty', e.target.value)} required />
                  </div>
                  {form.lines.length > 1 && (
                    <Button type="button" variant="ghost" onClick={() => removeLine(i)} className="text-red-400">✕</Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}
