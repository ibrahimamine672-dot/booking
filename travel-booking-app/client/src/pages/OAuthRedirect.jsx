import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function OAuthRedirect() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');

  useEffect(() => {
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setTimeout(() => navigate('/login', { state: { message: t('auth.googleAuthFailed') } }), 2000);
      return;
    }

    if (!token || !userParam) {
      setStatus('error');
      setTimeout(() => navigate('/login', { state: { message: t('auth.invalidAuth') } }), 2000);
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userParam));
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setStatus('success');
      setTimeout(() => { window.location.href = '/dashboard'; }, 1500);
    } catch {
      setStatus('error');
      setTimeout(() => navigate('/login', { state: { message: t('auth.authProcessingFailed') } }), 2000);
    }
  }, [searchParams, navigate, t]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <div className="w-full max-w-sm animate-fade-in-up">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center transition-colors duration-200">
          {status === 'processing' && (
            <>
              <div className="w-12 h-12 bg-primary-800 dark:bg-primary-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              </div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t('auth.signingYouIn')}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t('auth.completingAuth')}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t('auth.welcome')}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t('auth.redirectingToDashboard')}</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-6 h-6 text-red-500 dark:text-red-400" />
              </div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t('auth.authFailed')}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t('auth.redirectingBack')}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
