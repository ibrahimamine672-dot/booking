import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Compass, Map, ChevronRight } from 'lucide-react';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <div className="text-center max-w-lg animate-fade-in-up">
        {/* SVG Illustration */}
        <div className="relative w-48 h-48 mx-auto mb-8">
          {/* Compass circle */}
          <svg viewBox="0 0 200 200" className="w-full h-full float-anim" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Outer ring */}
            <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="3" className="text-primary-200 dark:text-primary-800" />
            <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="1.5" className="text-primary-300 dark:text-primary-700" strokeDasharray="8 6" />
            {/* Crosshair lines */}
            <line x1="100" y1="15" x2="100" y2="185" stroke="currentColor" strokeWidth="1.5" className="text-primary-300 dark:text-primary-700" opacity="0.5" />
            <line x1="15" y1="100" x2="185" y2="100" stroke="currentColor" strokeWidth="1.5" className="text-primary-300 dark:text-primary-700" opacity="0.5" />
            {/* Compass needle */}
            <polygon points="100,30 108,95 100,105 92,95" fill="#0071C2" className="dark:fill-primary-400">
              <animateTransform attributeName="transform" type="rotate" values="0 100 100;8 100 100;0 100 100;-8 100 100;0 100 100" dur="4s" repeatCount="indefinite" />
            </polygon>
            <polygon points="100,170 108,105 100,95 92,105" fill="#dc2626" className="dark:fill-red-400" opacity="0.6">
              <animateTransform attributeName="transform" type="rotate" values="0 100 100;8 100 100;0 100 100;-8 100 100;0 100 100" dur="4s" repeatCount="indefinite" />
            </polygon>
            {/* Center dot */}
            <circle cx="100" cy="100" r="6" className="fill-primary-600 dark:fill-primary-400" />
            {/* 404 badge */}
            <text x="100" y="108" textAnchor="middle" fontSize="32" fontWeight="800" fill="#0071C2" className="dark:fill-primary-400" style={{ fontFamily: 'Inter, sans-serif' }}>404</text>
          </svg>
          {/* Floating dots */}
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-accent-500 rounded-full float-anim-delayed opacity-60" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-green-400 rounded-full float-anim opacity-40" style={{ animationDelay: '-2s' }} />
        </div>

        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          {t('common.pageNotFound')}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto leading-relaxed">
          {t('common.pageNotFoundMsg')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/" className="btn-primary text-sm group w-full sm:w-auto">
            <Home className="w-4 h-4" />
            {t('common.backToHome')}
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link to="/destinations" className="btn-secondary text-sm group w-full sm:w-auto">
            <Compass className="w-4 h-4" />
            {t('common.browseDestinations')}
          </Link>
        </div>

        {/* Quick links */}
        <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
            Popular destinations
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link to="/destinations?country=maroc" className="text-xs px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-gray-600 dark:text-gray-400 hover:border-primary-300 dark:hover:border-primary-600 hover:text-primary-700 dark:hover:text-primary-400 transition-all">
              🇲🇦 Morocco
            </Link>
            <Link to="/destinations" className="text-xs px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-gray-600 dark:text-gray-400 hover:border-primary-300 dark:hover:border-primary-600 hover:text-primary-700 dark:hover:text-primary-400 transition-all">
              <Map className="w-3 h-3 inline mr-1" />
              All destinations
            </Link>
            <Link to="/faq" className="text-xs px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-gray-600 dark:text-gray-400 hover:border-primary-300 dark:hover:border-primary-600 hover:text-primary-700 dark:hover:text-primary-400 transition-all">
              Help center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
