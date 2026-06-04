import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Building2, Heart, Globe, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 transition-colors duration-200">
      <div className="page-container py-10 sm:py-14">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <Building2 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <span className="text-lg font-bold text-gray-800 dark:text-gray-100">TravelBook</span>
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4 max-w-xs">
              {t('footer.description')}
            </p>
            <div className="flex items-center gap-2">
              <a href="#" className="w-8 h-8 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-sm flex items-center justify-center transition-colors" aria-label="Website">
                <Globe className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-sm flex items-center justify-center transition-colors" aria-label="Email">
                <Mail className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
              </a>
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">{t('footer.support')}</h4>
            <ul className="space-y-2">
              <li><Link to="/faq" className="text-xs text-gray-500 dark:text-gray-400 hover:text-primary-700 dark:hover:text-primary-400 transition-colors">{t('footer.contactUs')}</Link></li>
              <li><Link to="/faq" className="text-xs text-gray-500 dark:text-gray-400 hover:text-primary-700 dark:hover:text-primary-400 transition-colors">{t('nav.faq')}</Link></li>
              <li><Link to="/" className="text-xs text-gray-500 dark:text-gray-400 hover:text-primary-700 dark:hover:text-primary-400 transition-colors">{t('footer.cancellation')}</Link></li>
              <li><Link to="/" className="text-xs text-gray-500 dark:text-gray-400 hover:text-primary-700 dark:hover:text-primary-400 transition-colors">{t('footer.terms')}</Link></li>
            </ul>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">{t('footer.explore')}</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-xs text-gray-500 dark:text-gray-400 hover:text-primary-700 dark:hover:text-primary-400 transition-colors">{t('footer.home')}</Link></li>
              <li><Link to="/destinations" className="text-xs text-gray-500 dark:text-gray-400 hover:text-primary-700 dark:hover:text-primary-400 transition-colors">{t('nav.allDestinations')}</Link></li>
              <li><Link to="/destinations?country=maroc" className="text-xs text-gray-500 dark:text-gray-400 hover:text-primary-700 dark:hover:text-primary-400 transition-colors">🇲🇦 {t('nav.morocco')}</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">{t('footer.account')}</h4>
            <ul className="space-y-2">
              <li><Link to="/login" className="text-xs text-gray-500 dark:text-gray-400 hover:text-primary-700 dark:hover:text-primary-400 transition-colors">{t('footer.signIn')}</Link></li>
              <li><Link to="/register" className="text-xs text-gray-500 dark:text-gray-400 hover:text-primary-700 dark:hover:text-primary-400 transition-colors">{t('footer.createAccount')}</Link></li>
              <li><Link to="/dashboard" className="text-xs text-gray-500 dark:text-gray-400 hover:text-primary-700 dark:hover:text-primary-400 transition-colors">{t('footer.myBookings')}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">{t('footer.contact')}</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Casablanca, Morocco</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                <a href="mailto:hello@travelbook.app" className="text-xs text-gray-500 dark:text-gray-400 hover:text-primary-700 dark:hover:text-primary-400 transition-colors">hello@travelbook.app</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-200 dark:border-gray-800">
        <div className="page-container py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[0.625rem] text-gray-400 dark:text-gray-500">&copy; {currentYear} TravelBook. {t('footer.allRightsReserved')}</p>
          <p className="text-[0.625rem] text-gray-400 dark:text-gray-500 flex items-center gap-1">
            {t('footer.madeWith')} <Heart className="w-2.5 h-2.5 text-red-400 fill-red-400" /> by TravelBook
          </p>
        </div>
      </div>
    </footer>
  );
}
