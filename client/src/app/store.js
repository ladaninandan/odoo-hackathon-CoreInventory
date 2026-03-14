import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import productsReducer from '../features/products/productsSlice';
import { receiptsReducer, deliveriesReducer, transfersReducer } from '../features/operations/operationsSlice';
import adjustmentsReducer from '../features/operations/adjustmentsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    receipts: receiptsReducer,
    deliveries: deliveriesReducer,
    transfers: transfersReducer,
    adjustments: adjustmentsReducer,
    // dashboard: dashboardReducer,   // Phase 5
  },
});

export default store;
