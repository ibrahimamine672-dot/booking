import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { UserPlus, Mail, Lock, User, Eye, EyeOff, Building2, Loader2, LogIn } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Register() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const updateField = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { name, email, password, confirmPassword } = form;
    if (!name || !email || !password || !confirmPassword) {
      setError(t('auth.pleaseFillAll'));
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
      await register(name, email, password);
      navigate('/login', { state: { message: t('auth.registrationSuccess') } });
    } catch (err) {
      setError(err.message || 'Registration failed');
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
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t('auth.createAccount')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t('auth.joinTravelBook')}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-sm flex items-center gap-2 animate-fade-in-down">
              <span className="w-4 h-4 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center flex-shrink-0 text-red-500 dark:text-red-400 text-xs font-bold">!</span>
              <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">{t('auth.fullName')}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={updateField('name')}
                  placeholder="John Doe"
                  autoComplete="name"
                  className="booking-input pl-10 text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">{t('auth.emailAddress')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                <input
                  id="reg-email"
                  type="email"
                  value={form.email}
                  onChange={updateField('email')}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="booking-input pl-10 text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">{t('auth.password')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={updateField('password')}
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
              <label htmlFor="confirm-password" className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">{t('auth.confirmPassword')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                <input
                  id="confirm-password"
                  type="password"
                  value={form.confirmPassword}
                  onChange={updateField('confirmPassword')}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  className="booking-input pl-10 text-sm"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full text-sm">
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> {t('auth.creatingAccount')}</>
              ) : (
                t('auth.createAccount')
              )}
            </button>
          </form>

          {/* Google Sign-In */}
          <div className="mt-5">
            <a
              href={`${API_BASE}/api/auth/google`}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 active:scale-[0.98]"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t('auth.signUpWithGoogle')}
            </a>
          </div>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-800 px-2 text-gray-400 dark:text-gray-500 font-medium">{t('auth.alreadyMember')}</span>
            </div>
          </div>

          <Link to="/login" className="btn-secondary w-full justify-center text-sm">
            <LogIn className="w-4 h-4" />
            {t('auth.signIn')}
          </Link>
        </div>
      </div>
    </div>
  );
}
