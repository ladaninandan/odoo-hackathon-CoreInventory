import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword, verifyOtp, resetPassword, clearError, clearResetState } from '../features/auth/authSlice';
import { Box, ArrowLeft, KeyRound, ShieldCheck, Lock } from 'lucide-react';
import Button from '../components/common/Button';

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
    await dispatch(forgotPassword({ phone }));
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    await dispatch(verifyOtp({ phone, otp }));
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
    // Step 3: Reset success
    if (resetSuccess) {
      return (
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-600/20">
            <ShieldCheck className="h-8 w-8 text-brand-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Password Reset Successful</h2>
          <p className="text-sm text-surface-400">
            Redirecting to login page...
          </p>
        </div>
      );
    }

    // Step 2b: Set new password (after OTP verified)
    if (resetToken) {
      return (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="text-center mb-2">
            <Lock className="mx-auto h-8 w-8 text-brand-400 mb-2" />
            <h2 className="text-lg font-semibold text-white">Set New Password</h2>
            <p className="text-sm text-surface-400">Enter your new password below</p>
          </div>

          <div>
            <label htmlFor="new-password" className="label">New Password</label>
            <input
              id="new-password"
              type="password"
              className="input"
              placeholder="Min 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <div>
            <label htmlFor="confirm-new-password" className="label">Confirm Password</label>
            <input
              id="confirm-new-password"
              type="password"
              className="input"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <Button type="submit" loading={loading} className="w-full">
            Reset Password
          </Button>
        </form>
      );
    }

    // Step 2a: Enter OTP
    if (otpSent) {
      return (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="text-center mb-2">
            <ShieldCheck className="mx-auto h-8 w-8 text-brand-400 mb-2" />
            <h2 className="text-lg font-semibold text-white">Verify OTP</h2>
            <p className="text-sm text-surface-400">
              Enter the 6-digit code sent to your phone
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

          <Button type="submit" loading={loading} className="w-full" disabled={otp.length !== 6}>
            Verify Code
          </Button>

          <button
            type="button"
            onClick={() => { dispatch(clearResetState()); dispatch(clearError()); }}
            className="w-full text-center text-sm text-surface-400 hover:text-surface-200 transition-colors"
          >
            Didn&apos;t receive code? Try again
          </button>
        </form>
      );
    }

    // Step 1: Enter phone
    return (
      <form onSubmit={handleSendOtp} className="space-y-4">
        <div className="text-center mb-2">
          <KeyRound className="mx-auto h-8 w-8 text-brand-400 mb-2" />
          <h2 className="text-lg font-semibold text-white">Forgot Password</h2>
          <p className="text-sm text-surface-400">
            Enter your registered phone number to receive an OTP
          </p>
        </div>

        <div>
          <label htmlFor="reset-phone" className="label">Phone Number</label>
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

        <Button type="submit" loading={loading} className="w-full">
          Send OTP
        </Button>
      </form>
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-950 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 shadow-lg shadow-brand-600/20">
            <Box className="h-7 w-7 text-white" />
          </div>
        </div>

        {/* Form card */}
        <div className="card p-6">
          {displayError && (
            <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {displayError}
            </div>
          )}

          {renderStep()}

          {!resetSuccess && (
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm text-surface-400 hover:text-surface-200 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
