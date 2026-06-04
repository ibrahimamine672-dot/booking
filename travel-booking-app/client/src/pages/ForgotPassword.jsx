import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, ArrowLeft, Building2, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { forgotPassword } from '../services/api';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const data = await forgotPassword(email);
      setSuccess(data.message || 'Password reset email sent. Please check your inbox.');
      setEmail('');
    } catch (err) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <div className="w-full max-w-sm animate-fade-in-up">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 transition-colors duration-200">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-primary-800 dark:bg-primary-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t('auth.forgotPasswordTitle')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {t('auth.forgotPasswordDesc')}
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
              <p className="text-sm font-medium text-green-700 dark:text-green-300">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                {t('auth.emailAddress')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="booking-input pl-10 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="btn-primary w-full text-sm"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> {t('auth.sending')}</>
              ) : (
                t('auth.sendResetLink')
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-800 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('auth.backToSignIn')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
