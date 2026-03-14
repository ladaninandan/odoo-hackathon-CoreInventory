import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword, verifyOtp, resetPassword, clearError, clearResetState } from '../features/auth/authSlice';
import { KeyRound, ShieldCheck, Lock, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';
import AuthLayout from '../components/layout/AuthLayout';

export default function ForgotPasswordPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, otpSent, resetToken, resetSuccess } = useSelector((state) => state.auth);

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    await dispatch(forgotPassword({ phone: phone.trim() }));
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    await dispatch(verifyOtp({ phone: phone.trim(), otp }));
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setValidationError('');
    dispatch(clearError());

    if (newPassword !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setValidationError('Password must be at least 8 characters');
      return;
    }

    const result = await dispatch(resetPassword({ resetToken, newPassword }));
    if (resetPassword.fulfilled.match(result)) {
      setTimeout(() => {
        dispatch(clearResetState());
        navigate('/login');
      }, 2000);
    }
  };

  const displayError = validationError || error;

  const renderStep = () => {
    if (resetSuccess) {
      return (
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <ShieldCheck className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Password Reset Successful</h2>
          <p className="text-sm text-gray-500">Redirecting to login page...</p>
        </div>
      );
    }

    if (resetToken) {
      return (
        <form onSubmit={handleResetPassword} className="space-y-4 auth-form">
          <h1 className="text-2xl font-bold text-gray-900">Reset your password</h1>
          <p className="text-sm text-gray-500">
            Please enter your new password below to regain access to your account.
          </p>

          <div>
            <label htmlFor="new-password" className="label">New Password</label>
            <input
              id="new-password"
              type="password"
              className="input"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
            />
            <p className="mt-1 text-xs text-gray-500">Min. 8 characters</p>
          </div>

          <div>
            <label htmlFor="confirm-new-password" className="label">Confirm New Password</label>
            <input
              id="confirm-new-password"
              type="password"
              className="input"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
            <p className="mt-1 text-xs text-gray-500">Repeat your password</p>
          </div>

          <Button type="submit" loading={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white">
            Update Password
          </Button>
        </form>
      );
    }

    if (otpSent) {
      return (
        <form onSubmit={handleVerifyOtp} className="space-y-4 auth-form">
          <div className="text-center mb-2">
            <ShieldCheck className="mx-auto h-10 w-10 text-blue-600 mb-2" />
            <h2 className="text-lg font-semibold text-gray-900">Verify OTP</h2>
            <p className="text-sm text-gray-500">
              Enter the 6-digit code sent to your mobile number
            </p>
          </div>

          <div>
            <label htmlFor="otp-code" className="label">OTP Code</label>
            <input
              id="otp-code"
              type="text"
              className="input text-center text-lg tracking-[0.5em] font-mono"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              maxLength={6}
              autoComplete="one-time-code"
            />
          </div>

          <Button type="submit" loading={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white" disabled={otp.length !== 6}>
            Verify Code
          </Button>

          <button
            type="button"
            onClick={() => { dispatch(clearResetState()); dispatch(clearError()); }}
            className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
          >
            Didn&apos;t receive code? Try again
          </button>
        </form>
      );
    }

    return (
      <form onSubmit={handleSendOtp} className="space-y-4 auth-form">
        <div className="flex justify-center mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <KeyRound className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Reset your password</h1>
        <p className="text-sm text-gray-500">
          Enter the mobile number associated with your account and we&apos;ll send you an OTP code to reset your password.
        </p>

        <div>
          <label htmlFor="reset-phone" className="label">Mobile Number</label>
          <input
            id="reset-phone"
            type="tel"
            className="input"
            placeholder="+91 9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            autoComplete="tel"
          />
        </div>

        <Button type="submit" loading={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white">
          Send OTP →
        </Button>
      </form>
    );
  };

  return (
    <AuthLayout variant="blue">
      <div className="w-full max-w-md mx-auto">
        {displayError && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {displayError}
          </div>
        )}

        {renderStep()}

        {!resetSuccess && (
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Login
            </Link>
          </div>
        )}

        <footer className="mt-12 pt-6 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400">
          <span>© 2023 CoreInventory Solutions Inc.</span>
          <span>v.2.0.1</span>
        </footer>
      </div>
    </AuthLayout>
  );
}
