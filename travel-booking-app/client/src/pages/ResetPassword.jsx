import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock, Eye, EyeOff, Building2, Loader2, CheckCircle, AlertCircle, KeyRound } from 'lucide-react';
import { resetPassword } from '../services/api';

export default function ResetPassword() {
  const { t } = useTranslation();
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError(t('auth.invalidResetLink'));
      return;
    }

    if (!password) {
      setError('Please enter a new password');
      return;
    }

    if (password.length < 6) {
      setError(t('auth.passwordMinChars'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.passwordsDoNotMatch'));
      return;
    }

    setLoading(true);
    try {
      const data = await resetPassword(token, password);
      setSuccess(data.message || 'Password reset successfully!');
      setTimeout(() => navigate('/login', {
        state: { message: t('auth.passwordResetSuccess') },
      }), 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
        <div className="w-full max-w-sm animate-fade-in-up">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-500 dark:text-red-400" />
            </div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{t('auth.invalidResetLink')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {t('auth.invalidResetLinkMsg')}
            </p>
            <Link to="/forgot-password" className="btn-primary text-sm inline-flex items-center justify-center gap-1.5">
              <KeyRound className="w-4 h-4" />
              {t('auth.requestNewReset')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <div className="w-full max-w-sm animate-fade-in-up">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 transition-colors duration-200">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-primary-800 dark:bg-primary-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t('auth.setNewPassword')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {t('auth.setNewPasswordDesc')}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-sm flex items-start gap-2 animate-fade-in-down">
              <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-sm flex items-start gap-2 animate-fade-in-down">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">{success}</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">Redirecting to sign in...</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="new-password" className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                {t('auth.newPassword')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  className="booking-input pl-10 pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                {t('auth.confirmNewPassword')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  className="booking-input pl-10 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !password || !confirmPassword}
              className="btn-primary w-full text-sm"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> {t('auth.resetting')}</>
              ) : (
                t('auth.resetPassword')
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-800 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 transition-colors"
            >
              {t('auth.backToSignIn')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
