import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { logoutUser } from '../features/auth/authSlice';

export default function useAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const logout = useCallback(async () => {
    await dispatch(logoutUser());
    navigate('/login');
  }, [dispatch, navigate]);

  const isManager = user?.role === 'manager';

  return { user, isAuthenticated, loading, error, logout, isManager };
}
