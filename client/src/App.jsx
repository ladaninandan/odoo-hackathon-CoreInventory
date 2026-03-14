import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { getMe } from './features/auth/authSlice';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import { PageSpinner } from './components/common/Spinner';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProductListPage from './pages/ProductListPage';
import SettingsPage from './pages/SettingsPage';
import OperationListPage from './pages/OperationListPage';
import AdjustmentPage from './pages/AdjustmentPage';
import HistoryPage from './pages/HistoryPage';
import DashboardPage from './pages/DashboardPage';
import ReportsPage from './pages/ReportsPage';
import ProfilePage from './pages/ProfilePage';
import {
  fetchReceipts, createReceipt, validateReceipt,
  fetchDeliveries, createDelivery, validateDelivery,
  fetchTransfers, createTransfer, validateTransfer,
} from './features/operations/operationsSlice';


function UnauthorizedPage() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-red-400">Access Denied</h2>
        <p className="mt-2 text-sm text-surface-400">
          You don&apos;t have permission to view this page.
        </p>
      </div>
    </div>
  );
}

function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="flex min-h-screen bg-surface-950">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} lg:block`}>
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Main content */}
      <div
        className={`flex flex-1 flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64'
        }`}
      >
        <Topbar onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} user={user} />

        <main className="flex-1 p-4 lg:p-6">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/receipts" element={
              <OperationListPage title="Receipts" sliceKey="receipts" fetchAction={fetchReceipts} createAction={createReceipt} validateAction={validateReceipt} numberField="receiptNumber" />
            } />
            <Route path="/deliveries" element={
              <OperationListPage title="Deliveries" sliceKey="deliveries" fetchAction={fetchDeliveries} createAction={createDelivery} validateAction={validateDelivery} numberField="deliveryNumber" />
            } />
            <Route path="/transfers" element={
              <OperationListPage title="Transfers" sliceKey="transfers" fetchAction={fetchTransfers} createAction={createTransfer} validateAction={validateTransfer} numberField="transferNumber" showFrom showTo />
            } />
            <Route
              path="/adjustments"
              element={
                <ProtectedRoute roles={['manager']}>
                  <AdjustmentPage />
                </ProtectedRoute>
              }
            />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route
              path="/settings"
              element={
                <ProtectedRoute roles={['manager']}>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, accessToken } = useSelector((state) => state.auth);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (accessToken) {
        await dispatch(getMe());
      }
      setInitializing(false);
    };
    init();
  }, [dispatch, accessToken]);

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-950">
        <PageSpinner />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes — no sidebar */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected app routes — with sidebar */}
        <Route
          path="/*"
          element={
            isAuthenticated ? <AppLayout /> : <Navigate to="/login" replace />
          }
        />
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            borderRadius: '12px',
            border: '1px solid rgba(51, 65, 85, 0.5)',
          },
        }}
      />
    </BrowserRouter>
  );
}
