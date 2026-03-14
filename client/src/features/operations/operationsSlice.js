import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const createOperationSlice = (name, endpoint) => {
  const fetchAll = createAsyncThunk(
    `${name}/fetchAll`,
    async (params = {}, { rejectWithValue }) => {
      try {
        const { data } = await api.get(`/${endpoint}`, { params });
        return data.data;
      } catch (error) {
        return rejectWithValue(error.response?.data || { message: `Failed to fetch ${name}` });
      }
    }
  );

  const create = createAsyncThunk(
    `${name}/create`,
    async (payload, { rejectWithValue }) => {
      try {
        const { data } = await api.post(`/${endpoint}`, payload);
        return data.data;
      } catch (error) {
        return rejectWithValue(error.response?.data || { message: `Failed to create ${name}` });
      }
    }
  );

  const validate = createAsyncThunk(
    `${name}/validate`,
    async (id, { rejectWithValue }) => {
      try {
        const { data } = await api.put(`/${endpoint}/${id}/validate`);
        return { id, data };
      } catch (error) {
        return rejectWithValue(error.response?.data || { message: `Failed to validate ${name}` });
      }
    }
  );

  const slice = createSlice({
    name,
    initialState: {
      items: [],
      pagination: { page: 1, total: 0, limit: 20, pages: 0 },
      loading: false,
      error: null,
    },
    reducers: {
      clearError: (state) => { state.error = null; },
    },
    extraReducers: (builder) => {
      builder
        .addCase(fetchAll.pending, (state) => { state.loading = true; state.error = null; })
        .addCase(fetchAll.fulfilled, (state, { payload }) => {
          state.loading = false;
          state.items = payload.items;
          state.pagination = payload.pagination;
        })
        .addCase(fetchAll.rejected, (state, { payload }) => {
          state.loading = false;
          state.error = payload?.message;
        })
        .addCase(create.fulfilled, (state, { payload }) => {
          const item = payload[name.slice(0, -1)] || payload.receipt || payload.delivery || payload.transfer;
          if (item) state.items.unshift(item);
        })
        .addCase(validate.fulfilled, (state, { payload }) => {
          const idx = state.items.findIndex((i) => i._id === payload.id);
          if (idx !== -1) state.items[idx].status = 'validated';
        });
    },
  });

  return { slice, fetchAll, create, validate, clearError: slice.actions.clearError };
};

// Receipts
const receiptsOps = createOperationSlice('receipts', 'receipts');
export const fetchReceipts = receiptsOps.fetchAll;
export const createReceipt = receiptsOps.create;
export const validateReceipt = receiptsOps.validate;
export const clearReceiptError = receiptsOps.clearError;
export const receiptsReducer = receiptsOps.slice.reducer;

// Deliveries
const deliveriesOps = createOperationSlice('deliveries', 'deliveries');
export const fetchDeliveries = deliveriesOps.fetchAll;
export const createDelivery = deliveriesOps.create;
export const validateDelivery = deliveriesOps.validate;
export const clearDeliveryError = deliveriesOps.clearError;
export const deliveriesReducer = deliveriesOps.slice.reducer;

// Transfers
const transfersOps = createOperationSlice('transfers', 'transfers');
export const fetchTransfers = transfersOps.fetchAll;
export const createTransfer = transfersOps.create;
export const validateTransfer = transfersOps.validate;
export const clearTransferError = transfersOps.clearError;
export const transfersReducer = transfersOps.slice.reducer;
