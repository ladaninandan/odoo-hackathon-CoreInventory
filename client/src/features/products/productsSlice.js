import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/products', { params });
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch products' });
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/create',
  async (productData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/products', productData);
      return data.data.product;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to create product' });
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ id, ...productData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/products/${id}`, productData);
      return data.data.product;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update product' });
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/products/${id}`);
      return data.data.product;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete product' });
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/settings/categories');
      return data.data.categories;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch categories' });
    }
  }
);

export const fetchWarehouses = createAsyncThunk(
  'products/fetchWarehouses',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/settings/warehouses');
      return data.data.warehouses;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch warehouses' });
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    selectedProduct: null,
    filters: { search: '', category: 'all', status: 'all' },
    pagination: { page: 1, total: 0, limit: 20, pages: 0 },
    categories: [],
    warehouses: [],
    loading: false,
    error: null,
  },
  reducers: {
    setFilters: (state, { payload }) => {
      state.filters = { ...state.filters, ...payload };
    },
    setSelectedProduct: (state, { payload }) => {
      state.selectedProduct = payload;
    },
    clearProductError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.items = payload.items;
        state.pagination = payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload?.message;
      })
      .addCase(createProduct.fulfilled, (state, { payload }) => {
        state.items.unshift(payload);
      })
      .addCase(updateProduct.fulfilled, (state, { payload }) => {
        const idx = state.items.findIndex((p) => p._id === payload._id);
        if (idx !== -1) state.items[idx] = payload;
      })
      .addCase(deleteProduct.fulfilled, (state, { payload }) => {
        const idx = state.items.findIndex((p) => p._id === payload._id);
        if (idx !== -1) state.items[idx] = payload;
      })
      .addCase(fetchCategories.fulfilled, (state, { payload }) => {
        state.categories = payload;
      })
      .addCase(fetchWarehouses.fulfilled, (state, { payload }) => {
        state.warehouses = payload;
      });
  },
});

export const { setFilters, setSelectedProduct, clearProductError } = productsSlice.actions;
export default productsSlice.reducer;
