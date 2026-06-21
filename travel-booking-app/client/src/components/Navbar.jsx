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
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.06)] border-b border-white/20'
          : 'bg-white/0'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/30 group-hover:scale-105 transition-all duration-300">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">TravelBook</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl px-1.5 py-1 border border-slate-200/50 dark:border-slate-700/30">
            <Link
              to="/"
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                isActive('/')
                  ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Plane className="w-4 h-4" />
              {t('nav.home')}
            </Link>

            {/* Destinations Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDestinationsOpen(prev => !prev)}
                onMouseEnter={() => setDestinationsOpen(true)}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                  isActive('/destinations') || destinationsOpen
                    ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Globe className="w-4 h-4" />
                {t('nav.destinations')}
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-300 ${
                    destinationsOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {destinationsOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-56 bg-white/90 backdrop-blur-xl dark:bg-slate-800/90 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-slate-200/50 dark:border-slate-700/50 py-1.5 z-50 animate-fade-in-up"
                  onMouseLeave={() => setDestinationsOpen(false)}
                >
                  <Link
                    to="/destinations?country=maroc"
                    onClick={() => setDestinationsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-700 dark:hover:text-primary-400 transition-all duration-200 mx-1.5 rounded-xl"
                  >
                    <span className="text-lg">🇲🇦</span>
                    <span className="font-semibold">{t('nav.morocco')}</span>
                    <ChevronRight className="w-4 h-4 ml-auto text-slate-400 dark:text-slate-500" />
                  </Link>
                  <div className="mx-4 my-1 border-t border-slate-100 dark:border-slate-700/50" />
                  <Link
                    to="/destinations"
                    onClick={() => setDestinationsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-700 dark:hover:text-primary-400 transition-all duration-200 mx-1.5 rounded-xl"
                  >
                    <Globe className="w-4 h-4 text-primary-500" />
                    <span className="font-semibold">{t('nav.allDestinations')}</span>
                    <span className="ml-auto text-xs text-slate-400 dark:text-slate-500 font-medium">{t('nav.worldwide')}</span>
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/notes"
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                isActive('/notes')
                  ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <StickyNote className="w-4 h-4" />
              {t('nav.notes')}
            </Link>
            <Link
              to="/faq"
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                isActive('/faq')
                  ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              {t('nav.faq')}
            </Link>
            {user && (
              <Link
                to="/dashboard"
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                  isActive('/dashboard')
                    ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                {t('nav.myBookings')}
              </Link>
            )}
          </div>

          {/* Desktop Right Side: Theme Toggle + Language + Auth */}
          <div className="hidden md:flex items-center gap-1.5">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-all duration-200"
              aria-label={isDark ? t('theme.light') : t('theme.dark')}
              title={isDark ? t('theme.light') : t('theme.dark')}
            >
              <div className="relative">
                {isDark ? (
                  <Sun className="w-4 h-4 transition-all duration-300 hover:rotate-45" />
                ) : (
                  <Moon className="w-4 h-4 transition-all duration-300" />
                )}
              </div>
            </button>

            {/* Language Switcher */}
            <div className="relative" ref={langDropdownRef}>
              <button
                onClick={() => setLangOpen(prev => !prev)}
                className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-all duration-200"
                aria-label="Language"
              >
                <Languages className="w-4 h-4" />
              </button>

              {langOpen && (
                <div className="absolute top-full right-0 mt-2 w-36 bg-white/90 backdrop-blur-xl dark:bg-slate-800/90 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-slate-200/50 dark:border-slate-700/50 py-1.5 z-50 animate-fade-in-up">
                  <button
                    onClick={() => changeLanguage('en')}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-all duration-200 mx-1.5 rounded-xl ${
                      currentLang === 'en'
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    🇬🇧 English
                  </button>
                  <button
                    onClick={() => changeLanguage('fr')}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-all duration-200 mx-1.5 rounded-xl ${
                      currentLang === 'fr'
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    🇫🇷 Français
                  </button>
                  <button
                    onClick={() => changeLanguage('ar')}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-all duration-200 mx-1.5 rounded-xl ${
                      currentLang === 'ar'
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    🇸🇦 العربية
                  </button>
                </div>
              )}
            </div>

            {/* Auth */}
            {user ? (
              <div className="flex items-center gap-2 ml-2">
                <div className="flex items-center gap-2.5 px-3.5 py-1.5 bg-primary-50 dark:bg-primary-900/20 rounded-2xl border border-primary-100 dark:border-primary-800/30">
                  <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center shadow-inner">
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-primary-800 dark:text-primary-300">{user.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200"
                >
                  <LogIn className="w-4 h-4" />
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  <UserPlus className="w-4 h-4" />
                  {t('nav.createAccount')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center gap-1">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              aria-label={isDark ? t('theme.light') : t('theme.dark')}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Language Toggle */}
            <div className="relative" ref={mobileLangDropdownRef}>
              <button
                onClick={() => setMobileLangOpen(prev => !prev)}
                className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              >
                <Languages className="w-4 h-4" />
              </button>

              {mobileLangOpen && (
                <div className="absolute top-full right-0 mt-2 w-36 bg-white/90 backdrop-blur-xl dark:bg-slate-800/90 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-slate-200/50 dark:border-slate-700/50 py-1.5 z-50 animate-fade-in-up">
                  <button
                    onClick={() => { changeLanguage('en'); setMobileLangOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-all duration-200 mx-1.5 rounded-xl ${
                      currentLang === 'en'
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    🇬🇧 English
                  </button>
                  <button
                    onClick={() => { changeLanguage('fr'); setMobileLangOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-all duration-200 mx-1.5 rounded-xl ${
                      currentLang === 'fr'
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    🇫🇷 Français
                  </button>
                  <button
                    onClick={() => { changeLanguage('ar'); setMobileLangOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-all duration-200 mx-1.5 rounded-xl ${
                      currentLang === 'ar'
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
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
              className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
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
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden animate-fade-in" onClick={() => setMobileOpen(false)} />
          <div className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white/90 backdrop-blur-2xl dark:bg-slate-900/95 z-50 shadow-2xl animate-slide-up md:hidden border-l border-white/20 dark:border-slate-700/30">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between px-6 h-[72px] border-b border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-lg">TravelBook</span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
                <p className="px-3 pb-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.08em]">{t('nav.menu')}</p>

                <Link to="/" onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3.5 px-3 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                    isActive('/')
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                  }`}>
                  <Plane className="w-5 h-5" />
                  {t('nav.home')}
                </Link>

                <Link to="/destinations" onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3.5 px-3 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                    isActive('/destinations')
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                  }`}>
                  <Globe className="w-5 h-5" />
                  {t('nav.allDestinations')}
                </Link>

                <Link to="/destinations?country=maroc" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3.5 px-3 py-3 rounded-2xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white transition-all duration-200">
                  <span className="text-lg">🇲🇦</span>
                  {t('nav.morocco')}
                </Link>

                <Link to="/notes" onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3.5 px-3 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                    isActive('/notes')
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                  }`}>
                  <StickyNote className="w-5 h-5" />
                  {t('nav.notes')}
                </Link>

                <Link to="/faq" onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3.5 px-3 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                    isActive('/faq')
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                  }`}>
                  <HelpCircle className="w-5 h-5" />
                  {t('nav.faq')}
                </Link>

                {user && (
                  <>
                    <div className="pt-6 pb-1">
                      <p className="px-3 pb-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.08em]">{t('nav.account')}</p>
                    </div>
                    <Link to="/dashboard" onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3.5 px-3 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                        isActive('/dashboard')
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                      }`}>
                      <LayoutDashboard className="w-5 h-5" />
                      {t('nav.myBookings')}
                    </Link>
                  </>
                )}
              </div>

              <div className="px-4 py-6 border-t border-slate-100 dark:border-slate-800/50 mt-auto">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3.5 px-1">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-inner">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</p>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('nav.signedIn')}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { logout(); setMobileOpen(false); }}
                      className="flex items-center gap-3.5 w-full px-3 py-3 rounded-2xl text-sm font-semibold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                    >
                      <LogOut className="w-5 h-5" />
                      {t('nav.logout')}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3.5 px-3 py-3 rounded-2xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white transition-all duration-200"
                    >
                      <LogIn className="w-5 h-5" />
                      {t('nav.login')}
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2.5 w-full px-5 py-3 text-sm font-bold text-white bg-gradient-to-r from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 rounded-2xl shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                    >
                      <UserPlus className="w-5 h-5" />
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
