import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories, fetchWarehouses } from '../features/products/productsSlice';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Edit, Building2, Tag, Users } from 'lucide-react';

function CategoryTab() {
  const dispatch = useDispatch();
  const { categories } = useSelector((s) => s.products);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await api.put(`/settings/categories/${editItem._id}`, form);
        toast.success('Category updated');
      } else {
        await api.post('/settings/categories', form);
        toast.success('Category created');
      }
      setShowForm(false);
      setEditItem(null);
      setForm({ name: '', description: '' });
      dispatch(fetchCategories());
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Categories</h3>
        <Button onClick={() => { setEditItem(null); setForm({ name: '', description: '' }); setShowForm(true); }}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <div key={c._id} className="card p-4 flex justify-between items-center">
            <div>
              <p className="font-medium text-surface-100">{c.name}</p>
              {c.description && <p className="text-xs text-surface-500 mt-0.5">{c.description}</p>}
            </div>
            <button
              onClick={() => { setEditItem(c); setForm({ name: c.name, description: c.description || '' }); setShowForm(true); }}
              className="p-1.5 rounded-lg text-surface-400 hover:text-brand-400 hover:bg-surface-700 transition-colors"
              aria-label="Edit category"
            >
              <Edit className="h-4 w-4" />
            </button>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="text-sm text-surface-500 col-span-full">No categories yet. Create one to get started.</p>
        )}
      </div>
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editItem ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Name *</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Description</label>
            <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit">{editItem ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function WarehouseTab() {
  const dispatch = useDispatch();
  const { warehouses } = useSelector((s) => s.products);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', type: 'primary', address: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await api.put(`/settings/warehouses/${editItem._id}`, form);
        toast.success('Warehouse updated');
      } else {
        await api.post('/settings/warehouses', form);
        toast.success('Warehouse created');
      }
      setShowForm(false);
      setEditItem(null);
      setForm({ name: '', code: '', type: 'primary', address: '' });
      dispatch(fetchWarehouses());
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const typeColors = { primary: 'success', internal: 'info', secondary: 'warning' };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Warehouses</h3>
        <Button onClick={() => { setEditItem(null); setForm({ name: '', code: '', type: 'primary', address: '' }); setShowForm(true); }}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {warehouses.map((w) => (
          <div key={w._id} className="card p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-surface-100">{w.name}</p>
                <p className="text-xs text-surface-500 font-mono mt-0.5">{w.code}</p>
                {w.address && <p className="text-xs text-surface-500 mt-1">{w.address}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={typeColors[w.type]}>{w.type}</Badge>
                <button
                  onClick={() => { setEditItem(w); setForm({ name: w.name, code: w.code, type: w.type, address: w.address || '' }); setShowForm(true); }}
                  className="p-1.5 rounded-lg text-surface-400 hover:text-brand-400 hover:bg-surface-700 transition-colors"
                  aria-label="Edit warehouse"
                >
                  <Edit className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {warehouses.length === 0 && (
          <p className="text-sm text-surface-500 col-span-full">No warehouses yet. Create one to get started.</p>
        )}
      </div>
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editItem ? 'Edit Warehouse' : 'Add Warehouse'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Name *</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="label">Code *</label>
              <input className="input font-mono" placeholder="WH-MAIN" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
            </div>
            <div>
              <label className="label">Type *</label>
              <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="primary">Primary</option>
                <option value="internal">Internal</option>
                <option value="secondary">Secondary</option>
              </select>
            </div>
            <div>
              <label className="label">Address</label>
              <input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit">{editItem ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

const tabs = [
  { key: 'categories', label: 'Categories', icon: Tag },
  { key: 'warehouses', label: 'Warehouses', icon: Building2 },
  { key: 'users', label: 'Users', icon: Users },
];

export default function SettingsPage() {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('categories');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchWarehouses());
    loadUsers();
  }, [dispatch]);

  const loadUsers = async () => {
    try {
      const { data } = await api.get('/settings/users');
      setUsers(data.data.users);
    } catch (err) {
      // silent
    }
  };

  const toggleUserStatus = async (userId, isActive) => {
    try {
      await api.put(`/settings/users/${userId}`, { isActive: !isActive });
      toast.success('User updated');
      loadUsers();
    } catch (err) {
      toast.error('Failed to update user');
    }
  };

  const updateUserRole = async (userId, role) => {
    try {
      await api.put(`/settings/users/${userId}`, { role });
      toast.success('User role updated');
      loadUsers();
    } catch (err) {
      toast.error('Failed to update user role');
    }
  };

  return (
    <PageWrapper title="Settings" description="Manage categories, warehouses, and users">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-surface-700/50 mb-6">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === key
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-surface-400 hover:text-surface-200'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'categories' && <CategoryTab />}
      {activeTab === 'warehouses' && <WarehouseTab />}
      {activeTab === 'users' && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Users</h3>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-700/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-400">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-400 hidden sm:table-cell">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-400">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-400">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-surface-400">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-700/30">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-surface-700/20 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-surface-100">{u.name}</td>
                    <td className="px-4 py-3 text-sm text-surface-300 hidden sm:table-cell">{u.email}</td>
                    <td className="px-4 py-3">
                      <select 
                        className="input py-1 px-2 text-sm bg-surface-800 border-none w-auto outline-none focus:ring-1 focus:ring-brand-500 rounded-lg cursor-pointer transition-colors hover:bg-surface-700" 
                        value={u.role} 
                        onChange={(e) => updateUserRole(u._id, e.target.value)}
                        title="Change user role"
                      >
                        <option value="staff">Staff</option>
                        <option value="manager">Manager</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={u.isActive ? 'success' : 'danger'}>{u.isActive ? 'Active' : 'Disabled'}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" onClick={() => toggleUserStatus(u._id, u.isActive)}>
                        {u.isActive ? 'Disable' : 'Enable'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
