import { useSelector } from 'react-redux';

export default function usePermission() {
  const { user } = useSelector((state) => state.auth);
  const isManager = user?.role === 'manager';

  const can = (action) => {
    const managerOnly = ['create_product', 'edit_product', 'delete_product', 'validate', 'adjust', 'export', 'manage_settings', 'manage_users'];
    if (managerOnly.includes(action)) return isManager;
    return true;
  };

  return { isManager, can };
}
