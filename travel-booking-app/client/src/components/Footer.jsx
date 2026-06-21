import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Building2, Heart, Globe, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 dark:bg-black border-t border-slate-800/50 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-all duration-300">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-white">TravelBook</span>
            </Link>
            <p className="text-sm font-medium text-slate-400 leading-relaxed mb-6 max-w-xs">
              {t('footer.description')}
            </p>
            <div className="flex items-center gap-2.5">
              <a href="#" className="w-10 h-10 rounded-2xl bg-slate-800/50 hover:bg-primary-500/20 border border-slate-700/50 hover:border-primary-500/30 flex items-center justify-center transition-all duration-300 group" aria-label="Website">
                <Globe className="w-4 h-4 text-slate-400 group-hover:text-primary-400 transition-colors duration-300" />
              </a>
              <a href="#" className="w-10 h-10 rounded-2xl bg-slate-800/50 hover:bg-primary-500/20 border border-slate-700/50 hover:border-primary-500/30 flex items-center justify-center transition-all duration-300 group" aria-label="Email">
                <Mail className="w-4 h-4 text-slate-400 group-hover:text-primary-400 transition-colors duration-300" />
              </a>
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-[0.08em] mb-5">{t('footer.support')}</h4>
            <ul className="space-y-3">
              <li><Link to="/faq" className="text-sm font-medium text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200">{t('footer.contactUs')}</Link></li>
              <li><Link to="/faq" className="text-sm font-medium text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200">{t('nav.faq')}</Link></li>
              <li><Link to="/" className="text-sm font-medium text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200">{t('footer.cancellation')}</Link></li>
              <li><Link to="/" className="text-sm font-medium text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200">{t('footer.terms')}</Link></li>
            </ul>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-[0.08em] mb-5">{t('footer.explore')}</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-sm font-medium text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200">{t('footer.home')}</Link></li>
              <li><Link to="/destinations" className="text-sm font-medium text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200">{t('nav.allDestinations')}</Link></li>
              <li><Link to="/destinations?country=maroc" className="text-sm font-medium text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200">🇲🇦 {t('nav.morocco')}</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-[0.08em] mb-5">{t('footer.account')}</h4>
            <ul className="space-y-3">
              <li><Link to="/login" className="text-sm font-medium text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200">{t('footer.signIn')}</Link></li>
              <li><Link to="/register" className="text-sm font-medium text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200">{t('footer.createAccount')}</Link></li>
              <li><Link to="/dashboard" className="text-sm font-medium text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200">{t('footer.myBookings')}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-[0.08em] mb-5">{t('footer.contact')}</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-800/50 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-primary-400" />
                </div>
                <span className="text-sm font-medium text-slate-400 pt-1">Casablanca, Morocco</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-800/50 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-3.5 h-3.5 text-primary-400" />
                </div>
                <a href="mailto:hello@travelbook.app" className="text-sm font-medium text-primary-400 hover:text-primary-300 pt-1 transition-colors duration-200">hello@travelbook.app</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm font-medium text-slate-500">&copy; {currentYear} TravelBook. {t('footer.allRightsReserved')}</p>
          <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
            {t('footer.madeWith')} <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" /> by TravelBook
          </p>
        </div>
      </div>
    </footer>
  );
}
