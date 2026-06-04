import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import {
  Plane,
  Globe,
  LogOut,
  LogIn,
  UserPlus,
  User,
  ChevronDown,
  Menu,
  X,
  LayoutDashboard,
  Building2,
  StickyNote,
  ChevronRight,
  HelpCircle,
  Sun,
  Moon,
  Languages,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [destinationsOpen, setDestinationsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [mobileLangOpen, setMobileLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const langDropdownRef = useRef(null);
  const mobileLangDropdownRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLangOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDestinationsOpen(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setLangOpen(false);
      }
      if (mobileLangDropdownRef.current && !mobileLangDropdownRef.current.contains(event.target)) {
        setMobileLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setDestinationsOpen(false);
    setMobileOpen(false);
    setLangOpen(false);
    setMobileLangOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const isActive = (path) => location.pathname === path;

  const getNormalizedLang = (lang) => {
    if (!lang) return 'en';
    if (lang.startsWith('fr')) return 'fr';
    if (lang.startsWith('ar')) return 'ar';
    return 'en';
  };
  const currentLang = getNormalizedLang(i18n.language);

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'glass-strong shadow-lg'
        : 'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800'
    }`}>
      <div className="page-container">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-base font-bold text-primary-800 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 transition-colors">
            <Building2 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <span>TravelBook</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-0.5">
            <Link
              to="/"
              className={`booking-nav-link ${isActive('/') ? 'active' : ''}`}
            >
              <Plane className="booking-nav-icon" />
              {t('nav.home')}
            </Link>

            {/* Destinations Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDestinationsOpen(prev => !prev)}
                onMouseEnter={() => setDestinationsOpen(true)}
                className={`booking-nav-link ${isActive('/destinations') ? 'active' : ''}`}
              >
                <Globe className="booking-nav-icon" />
                {t('nav.destinations')}
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${destinationsOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {destinationsOpen && (
                <div
                  className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-50 animate-fade-in-down"
                  onMouseLeave={() => setDestinationsOpen(false)}
                >
                  <Link
                    to="/destinations?country=maroc"
                    onClick={() => setDestinationsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700 hover:text-primary-800 dark:hover:text-primary-400 transition-colors"
                  >
                    <span className="text-base">🇲🇦</span>
                    <span className="font-medium">{t('nav.morocco')}</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-auto text-gray-400 dark:text-gray-500" />
                  </Link>
                  <div className="mx-3 my-1 border-t border-gray-100 dark:border-gray-700" />
                  <Link
                    to="/destinations"
                    onClick={() => setDestinationsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700 hover:text-primary-800 dark:hover:text-primary-400 transition-colors"
                  >
                    <Globe className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    <span className="font-medium">{t('nav.allDestinations')}</span>
                    <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">{t('nav.worldwide')}</span>
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/notes"
              className={`booking-nav-link ${isActive('/notes') ? 'active' : ''}`}
            >
              <StickyNote className="booking-nav-icon" />
              {t('nav.notes')}
            </Link>
            <Link
              to="/faq"
              className={`booking-nav-link ${isActive('/faq') ? 'active' : ''}`}
            >
              <HelpCircle className="booking-nav-icon" />
              {t('nav.faq')}
            </Link>
            {user && (
              <Link
                to="/dashboard"
                className={`booking-nav-link ${isActive('/dashboard') ? 'active' : ''}`}
              >
                <LayoutDashboard className="booking-nav-icon" />
                {t('nav.myBookings')}
              </Link>
            )}
          </div>

          {/* Desktop Right Side: Theme Toggle + Language + Auth */}
          <div className="hidden md:flex items-center gap-1">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={isDark ? t('theme.light') : t('theme.dark')}
              title={isDark ? t('theme.light') : t('theme.dark')}
            >
              {isDark ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {/* Language Switcher */}
            <div className="relative" ref={langDropdownRef}>
              <button
                onClick={() => setLangOpen(prev => !prev)}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xs font-semibold uppercase"
                aria-label="Language"
                title={currentLang === 'en' ? t('language.fr') : currentLang === 'fr' ? t('language.ar') : t('language.en')}
              >
                <Languages className="w-4 h-4" />
              </button>

              {langOpen && (
                <div className="absolute top-full right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-50 animate-fade-in-down">
                  <button
                    onClick={() => changeLanguage('en')}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                      currentLang === 'en'
                        ? 'bg-primary-50 dark:bg-gray-700 text-primary-800 dark:text-primary-400 font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    🇬🇧 English
                  </button>
                  <button
                    onClick={() => changeLanguage('fr')}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                      currentLang === 'fr'
                        ? 'bg-primary-50 dark:bg-gray-700 text-primary-800 dark:text-primary-400 font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    🇫🇷 Français
                  </button>
                  <button
                    onClick={() => changeLanguage('ar')}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                      currentLang === 'ar'
                        ? 'bg-primary-50 dark:bg-gray-700 text-primary-800 dark:text-primary-400 font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    🇸🇦 العربية
                  </button>
                </div>
              )}
            </div>

            {/* Auth */}
            {user ? (
              <div className="flex items-center gap-2 ml-1">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-gray-800 rounded-full">
                  <div className="w-6 h-6 bg-primary-800 dark:bg-primary-600 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm font-medium text-primary-800 dark:text-primary-400">{user.name}</span>
                </div>
                <button onClick={logout} className="btn-ghost text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                  <LogOut className="w-3.5 h-3.5" />
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">
                  <LogIn className="w-3.5 h-3.5" />
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  <UserPlus className="w-3.5 h-3.5" />
                  {t('nav.register')}
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center gap-1">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={isDark ? t('theme.light') : t('theme.dark')}
            >
              {isDark ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {/* Language Toggle */}
            <div className="relative" ref={mobileLangDropdownRef}>
              <button
                onClick={() => setMobileLangOpen(prev => !prev)}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Languages className="w-4 h-4" />
              </button>

              {mobileLangOpen && (
                <div className="absolute top-full right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-50 animate-fade-in-down">
                  <button
                    onClick={() => { changeLanguage('en'); setMobileLangOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                      currentLang === 'en'
                        ? 'bg-primary-50 dark:bg-gray-700 text-primary-800 dark:text-primary-400 font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    🇬🇧 English
                  </button>
                  <button
                    onClick={() => { changeLanguage('fr'); setMobileLangOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                      currentLang === 'fr'
                        ? 'bg-primary-50 dark:bg-gray-700 text-primary-800 dark:text-primary-400 font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    🇫🇷 Français
                  </button>
                  <button
                    onClick={() => { changeLanguage('ar'); setMobileLangOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                      currentLang === 'ar'
                        ? 'bg-primary-50 dark:bg-gray-700 text-primary-800 dark:text-primary-400 font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    🇸🇦 العربية
                  </button>
                </div>
              )}
            </div>

            {/* Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 md:hidden animate-fade-in" onClick={() => setMobileOpen(false)} />
          <div className="fixed top-0 right-0 bottom-0 w-72 max-w-[85vw] bg-white dark:bg-gray-900 z-50 shadow-2xl animate-slide-up md:hidden">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between px-5 h-14 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  <span className="font-bold text-gray-800 dark:text-gray-100">TravelBook</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
                <p className="px-3 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('nav.menu')}</p>

                <Link to="/" onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive('/') ? 'bg-primary-50 dark:bg-gray-800 text-primary-800 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                  <Plane className="w-5 h-5" />
                  {t('nav.home')}
                </Link>

                <Link to="/destinations" onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive('/destinations') ? 'bg-primary-50 dark:bg-gray-800 text-primary-800 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                  <Globe className="w-5 h-5" />
                  {t('nav.allDestinations')}
                </Link>

                <Link to="/destinations?country=maroc" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <span className="text-lg">🇲🇦</span>
                  {t('nav.morocco')}
                </Link>

                <Link to="/notes" onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive('/notes') ? 'bg-primary-50 dark:bg-gray-800 text-primary-800 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                  <StickyNote className="w-5 h-5" />
                  {t('nav.notes')}
                </Link>

                <Link to="/faq" onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive('/faq') ? 'bg-primary-50 dark:bg-gray-800 text-primary-800 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                  <HelpCircle className="w-5 h-5" />
                  {t('nav.faq')}
                </Link>

                {user && (
                  <>
                    <div className="pt-4 pb-1">
                      <p className="px-3 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('nav.account')}</p>
                    </div>
                    <Link to="/dashboard" onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive('/dashboard') ? 'bg-primary-50 dark:bg-gray-800 text-primary-800 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                      <LayoutDashboard className="w-5 h-5" />
                      {t('nav.myBookings')}
                    </Link>
                  </>
                )}
              </div>

              <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-800 mt-auto">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 px-3">
                      <div className="w-8 h-8 bg-primary-800 dark:bg-primary-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{user.name}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{t('nav.signedIn')}</p>
                      </div>
                    </div>
                    <button onClick={() => { logout(); setMobileOpen(false); }}
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <LogOut className="w-5 h-5" />
                      {t('nav.logout')}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link to="/login" onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <LogIn className="w-5 h-5" />
                      {t('nav.login')}
                    </Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary w-full text-sm justify-center">
                      <UserPlus className="w-4 h-4" />
                      {t('nav.createAccount')}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
