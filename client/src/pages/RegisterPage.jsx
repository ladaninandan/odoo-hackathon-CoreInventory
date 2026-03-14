import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, clearError } from '../features/auth/authSlice';
import { Box, Eye, EyeOff, UserPlus } from 'lucide-react';
import Button from '../components/common/Button';
import AuthLayout from '../components/layout/AuthLayout';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [form, setForm] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    dispatch(clearError());

    if (form.password !== form.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    if (form.password.length < 8) {
      setValidationError('Password must be at least 8 characters');
      return;
    }

    if (!agreed) {
      setValidationError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    const result = await dispatch(
      registerUser({
        name: form.name,
        email: form.email,
        phone: form.phone || '+0000000000',
        password: form.password,
      })
    );

    if (registerUser.fulfilled.match(result)) {
      navigate('/');
    }
  };

  const displayError = validationError || error;

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto auth-form">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
              <Box className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">CoreInventory</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="mt-1 text-sm text-gray-500">
            Start your 14-day free trial today. No credit card required.
          </p>
        </div>

        {displayError && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {displayError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="reg-name" className="label">Full Name</label>
            <input
              id="reg-name"
              type="text"
              className="input"
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              autoComplete="name"
            />
          </div>

          <div>
            <label htmlFor="reg-company" className="label">Company Name</label>
            <input
              id="reg-company"
              type="text"
              className="input"
              placeholder="Your Business Name"
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              autoComplete="organization"
            />
          </div>

          <div>
            <label htmlFor="reg-email" className="label">Email Address</label>
            <input
              id="reg-email"
              type="email"
              className="input"
              placeholder="name@company.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="reg-password" className="label">Password</label>
            <div className="relative">
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                className="input pr-10"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={8}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters.</p>
          </div>

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">
              I agree to the{' '}
              <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
            </span>
          </label>

          <Button type="submit" loading={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white">
            <UserPlus className="h-4 w-4" />
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-500 font-medium">
            Sign In
          </Link>
        </p>

        <footer className="mt-12 pt-6 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400">
          <span>© 2023 CoreInventory Solutions Inc.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-600">Privacy Policy</a>
            <a href="#" className="hover:text-gray-600">Support</a>
          </div>
        </footer>
      </div>
    </AuthLayout>
  );
}
