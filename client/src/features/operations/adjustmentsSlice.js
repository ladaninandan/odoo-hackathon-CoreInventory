import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const createAdjustment = createAsyncThunk(
  'adjustments/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/adjustments', payload);
      return data.data.adjustment;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to create adjustment' });
    }
  }
);

export const fetchAdjustments = createAsyncThunk(
  'adjustments/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/adjustments', { params });
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch adjustments' });
    }
  }
);

const adjustmentsSlice = createSlice({
  name: 'adjustments',
  initialState: {
    items: [],
    pagination: { page: 1, total: 0, limit: 20, pages: 0 },
    loading: false,
    error: null,
  },
  reducers: {
    clearAdjustmentError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdjustments.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAdjustments.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.items = payload.items;
        state.pagination = payload.pagination;
      })
      .addCase(fetchAdjustments.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload?.message;
      })
      .addCase(createAdjustment.fulfilled, (state, { payload }) => {
        state.items.unshift(payload);
      });
  },
});

export const { clearAdjustmentError } = adjustmentsSlice.actions;
export default adjustmentsSlice.reducer;
