import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../features/auth/authSlice';
import { Bell, Search, User, LogOut, Menu } from 'lucide-react';

export default function Topbar({ onMenuClick, user }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-surface-700/50 bg-surface-900/80 backdrop-blur-xl px-4 lg:px-6">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-surface-400 hover:bg-surface-800 hover:text-surface-100 lg:hidden"
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search */}
      <div className="hidden md:flex flex-1 max-w-lg">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-500" />
          <input
            type="text"
            placeholder="Search products, receipts, deliveries..."
            className="input pl-10"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button
          className="relative rounded-lg p-2 text-surface-400 hover:bg-surface-800 hover:text-surface-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-500" />
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-3 rounded-lg border border-surface-700/50 bg-surface-800/50 px-3 py-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600/20 text-brand-400">
            <User className="h-4 w-4" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-surface-100">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-surface-500 capitalize">
              {user?.role || 'staff'}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="rounded-lg p-2 text-surface-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          aria-label="Logout"
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
