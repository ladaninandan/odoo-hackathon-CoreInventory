import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchCategories, setFilters, setSelectedProduct, deleteProduct } from '../features/products/productsSlice';
import usePermission from '../hooks/usePermission';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ProductFormModal from '../components/ProductFormModal';
import BarcodeScanner from '../components/scanner/BarcodeScanner';
import { Plus, Search, ScanLine, ChevronLeft, ChevronRight, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductListPage() {
  const dispatch = useDispatch();
  const { items, filters, pagination, categories, loading } = useSelector((s) => s.products);
  const { can } = usePermission();
  const [showForm, setShowForm] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchProducts({ ...filters, page: pagination.page, limit: pagination.limit }));
  }, [dispatch, filters, pagination.page]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(setFilters({ search: searchInput }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this product?')) return;
    const result = await dispatch(deleteProduct(id));
    if (deleteProduct.fulfilled.match(result)) toast.success('Product deactivated');
  };

  const handleScanFound = (product) => {
    setShowScanner(false);
    setEditProduct(product);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditProduct(null);
  };

  const handlePageChange = (newPage) => {
    dispatch(fetchProducts({ ...filters, page: newPage, limit: pagination.limit }));
  };

  return (
    <PageWrapper
      title="Products"
      description={`${pagination.total} products total`}
      actions={
        <>
          <Button variant="outline" onClick={() => setShowScanner(!showScanner)}>
            <ScanLine className="h-4 w-4" /> Scan
          </Button>
          {can('create_product') && (
            <Button onClick={() => { setEditProduct(null); setShowForm(true); }}>
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          )}
        </>
      }
    >
      {/* Scanner */}
      {showScanner && (
        <div className="card p-4 mb-4">
          <BarcodeScanner onFound={handleScanFound} />
        </div>
      )}

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-500" />
          <input
            type="text"
            className="input pl-10"
            placeholder="Search by name or SKU..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </form>
        <select
          className="input w-auto"
          value={filters.category}
          onChange={(e) => dispatch(setFilters({ category: e.target.value }))}
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <select
          className="input w-auto"
          value={filters.status}
          onChange={(e) => dispatch(setFilters({ status: e.target.value }))}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-700/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-400">Product</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-400">SKU</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-400 hidden md:table-cell">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-400 hidden lg:table-cell">UOM</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-400">Min Stock</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-400">Status</th>
                {can('edit_product') && (
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-surface-400">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-700/30">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-surface-500">Loading...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-surface-500">No products found</td>
                </tr>
              ) : (
                items.map((p) => (
                  <tr key={p._id} className="hover:bg-surface-700/20 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-surface-100">{p.name}</td>
                    <td className="px-4 py-3 text-sm text-surface-300 font-mono">{p.sku}</td>
                    <td className="px-4 py-3 text-sm text-surface-300 hidden md:table-cell">{p.category?.name}</td>
                    <td className="px-4 py-3 text-sm text-surface-400 hidden lg:table-cell">{p.uom}</td>
                    <td className="px-4 py-3 text-sm text-surface-300">{p.minStockLevel}</td>
                    <td className="px-4 py-3">
                      <Badge variant={p.isActive ? 'success' : 'danger'}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    {can('edit_product') && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => { setEditProduct(p); setShowForm(true); }}
                            className="p-1.5 rounded-lg text-surface-400 hover:text-brand-400 hover:bg-surface-700 transition-colors"
                            aria-label="Edit product"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p._id)}
                            className="p-1.5 rounded-lg text-surface-400 hover:text-red-400 hover:bg-surface-700 transition-colors"
                            aria-label="Delete product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-surface-700/50 px-4 py-3">
            <p className="text-sm text-surface-400">
              Page {pagination.page} of {pagination.pages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={pagination.page <= 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                disabled={pagination.page >= pagination.pages}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Form modal */}
      <ProductFormModal
        isOpen={showForm}
        onClose={handleFormClose}
        product={editProduct}
      />
    </PageWrapper>
  );
}
