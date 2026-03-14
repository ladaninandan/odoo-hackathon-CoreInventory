import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createProduct, updateProduct, fetchProducts } from '../features/products/productsSlice';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  uom: z.string().min(1, 'Unit of measure is required'),
  description: z.string().optional(),
  costPrice: z.coerce.number().min(0, 'Cost must be positive').optional(),
  minStockLevel: z.coerce.number().min(0, 'Min stock must be 0 or higher'),
  reorderQty: z.coerce.number().min(0).optional(),
});

export default function ProductFormModal({ isOpen, onClose, product }) {
  const dispatch = useDispatch();
  const { categories } = useSelector((s) => s.products);
  const isEdit = !!product;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      sku: '',
      barcode: '',
      category: '',
      uom: 'pcs',
      description: '',
      costPrice: 0,
      minStockLevel: 0,
      reorderQty: 0,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (product) {
        reset({
          name: product.name || '',
          sku: product.sku || '',
          barcode: product.barcode || '',
          category: product.category?._id || product.category || '',
          uom: product.uom || 'pcs',
          description: product.description || '',
          costPrice: product.costPrice || 0,
          minStockLevel: product.minStockLevel || 0,
          reorderQty: product.reorderQty || 0,
        });
      } else {
        reset();
      }
    }
  }, [isOpen, product, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        const result = await dispatch(updateProduct({ id: product._id, ...data }));
        if (updateProduct.fulfilled.match(result)) {
          toast.success('Product updated');
          onClose();
        } else {
          toast.error(result.payload?.message || 'Update failed');
        }
      } else {
        const result = await dispatch(createProduct(data));
        if (createProduct.fulfilled.match(result)) {
          toast.success('Product created');
          onClose();
          dispatch(fetchProducts({}));
        } else {
          toast.error(result.payload?.message || 'Creation failed');
        }
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Product' : 'Add Product'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Product Name *</label>
            <input className={`input ${errors.name ? 'border-red-500' : ''}`} {...register('name')} />
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">SKU *</label>
            <input className={`input font-mono ${errors.sku ? 'border-red-500' : ''}`} {...register('sku')} />
            {errors.sku && <p className="text-xs text-red-400 mt-1">{errors.sku.message}</p>}
          </div>
          <div>
            <label className="label">Barcode</label>
            <input className="input font-mono" placeholder="Scan or type" {...register('barcode')} />
          </div>
          <div>
            <label className="label">Category *</label>
            <select className={`input ${errors.category ? 'border-red-500' : ''}`} {...register('category')}>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            {errors.category && <p className="text-xs text-red-400 mt-1">{errors.category.message}</p>}
          </div>
          <div>
            <label className="label">Unit of Measure *</label>
            <select className={`input ${errors.uom ? 'border-red-500' : ''}`} {...register('uom')}>
              <option value="pcs">Pieces (pcs)</option>
              <option value="kg">Kilograms (kg)</option>
              <option value="ltr">Liters (ltr)</option>
              <option value="m">Meters (m)</option>
              <option value="pairs">Pairs</option>
              <option value="box">Box</option>
              <option value="pack">Pack</option>
            </select>
          </div>
          <div>
            <label className="label">Cost Price</label>
            <input type="number" step="0.01" className="input" {...register('costPrice')} />
          </div>
          <div>
            <label className="label">Min Stock Level *</label>
            <input type="number" className={`input ${errors.minStockLevel ? 'border-red-500' : ''}`} {...register('minStockLevel')} />
            {errors.minStockLevel && <p className="text-xs text-red-400 mt-1">{errors.minStockLevel.message}</p>}
          </div>
          <div>
            <label className="label">Reorder Qty</label>
            <input type="number" className="input" {...register('reorderQty')} />
          </div>
        </div>

        <div>
          <label className="label">Description</label>
          <textarea className="input min-h-[80px] resize-y" rows={3} {...register('description')} />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isSubmitting}>
            {isEdit ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
