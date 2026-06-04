import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getDestinations } from '../services/api';
import DestinationCard from '../components/DestinationCard';
import useScrollReveal from '../hooks/useScrollReveal';
import {
  Search, Compass, Globe, Map, Sparkles, ArrowRight, Building2,
  Shield, Award, Headphones, ChevronRight, Star,
} from 'lucide-react';
import { Link } from 'react-router-dom';

function SectionTitle({ children, icon: Icon }) {
  const { ref, className } = useScrollReveal();
  return (
    <div ref={ref} className={`flex items-center gap-2 mb-6 ${className}`}>
      <div className="w-8 h-8 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
        <Icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
      </div>
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">{children}</h2>
      </div>
    </div>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const sectionReveal = useScrollReveal({ threshold: 0.1 });
  const featuresReveal = useScrollReveal({ threshold: 0.1 });

  useEffect(() => {
    getDestinations()
      .then(setDestinations)
      .catch(() => setError('Failed to load destinations'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = destinations.filter((d) => {
    const q = search.toLowerCase();
    return (
      d.name?.toLowerCase().includes(q) ||
      d.country?.toLowerCase().includes(q) ||
      d.city?.toLowerCase().includes(q) ||
      d.description?.toLowerCase().includes(q)
    );
  });

  function FeatureCard({ feature, t }) {
    const cardReveal = useScrollReveal({ threshold: 0.1, animation: 'animate-fade-in-up' });
    const Icon = feature.icon;
    return (
      <div
        ref={cardReveal.ref}
        className={`border border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center hover:border-primary-200 dark:hover:border-primary-600 hover:shadow-booking-card-hover dark:hover:shadow-primary-900/30 transition-all duration-300 hover:-translate-y-1 ${cardReveal.className}`}
      >
        <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-2">{t(feature.titleKey)}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{t(feature.descKey)}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Map className="w-8 h-8 text-red-500 dark:text-red-400" />
          </div>
          <p className="text-gray-800 dark:text-gray-200 font-semibold text-lg mb-1">{t('destinationDetails.oops')}</p>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">{t('destinationDetails.tryAgain')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      {/* === HERO === */}
      <section className="relative hero-gradient text-white overflow-hidden">
        {/* Animated orbs */}
        <div className="hero-orb" />
        <div className="hero-orb" />
        <div className="hero-orb" />

        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1920&q=80')] bg-cover bg-center opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/40 via-transparent to-primary-950/40" />
        </div>

        <div className="relative page-container py-16 sm:py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-500 text-gray-900 rounded-sm text-xs font-bold uppercase tracking-wider mb-5 animate-fade-in-down">
              <Sparkles className="w-3.5 h-3.5" />
              {t('hero.aiPowered')}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight mb-3 animate-fade-in-up">
              {t('hero.findYourStay')}
            </h1>
            <p className="text-base sm:text-lg text-blue-100/80 mb-8 max-w-xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              {t('hero.searchDeals')}
            </p>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-xl shadow-2xl max-w-2xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-2 bg-white rounded-lg p-1">
                <div className="flex-1 flex items-center gap-1.5 px-3 py-2">
                  <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t('hero.whereGoing')}
                    className="w-full text-sm text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent"
                  />
                </div>
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 transition-colors"
                  >
                    {t('hero.clear')}
                  </button>
                )}
                <button className="btn-primary rounded-lg px-6 py-2.5 text-sm flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5" />
                  {t('hero.search')}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Link to="/destinations" className="group flex items-center gap-1 text-xs text-blue-200 hover:text-white transition-colors">
                {t('hero.browseAll')}
                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <span className="text-blue-300/30">|</span>
              <Link to="/destinations?country=maroc" className="text-xs text-blue-200 hover:text-white transition-colors">
                🇲🇦 {t('nav.morocco')}
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 dark:from-gray-950 to-transparent" />
      </section>

      {/* === TRUST BANNER === */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors duration-200">
        <div className="page-container py-3">
          <div className="flex items-center justify-center sm:justify-start gap-6 sm:gap-8 text-xs text-gray-500 dark:text-gray-400 overflow-x-auto scrollbar-hide">
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <Shield className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
              {t('trust.freeCancellation')}
            </span>
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <Award className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
              {t('trust.bestPrice')}
            </span>
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <Headphones className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
              {t('trust.support')}
            </span>
          </div>
        </div>
      </div>

      {/* === DESTINATIONS GRID === */}
      <section className="page-container py-8 sm:py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="h-48 skeleton" />
                <div className="p-4 space-y-2">
                  <div className="h-4 skeleton w-3/4" />
                  <div className="h-3 skeleton w-1/2" />
                  <div className="h-3 skeleton w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Map className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">{t('destinations.noDestinations')}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              {search ? t('destinations.noDestinationsMsg') : t('destinations.noDestinationsAvail')}
            </p>
            {search && (
              <button onClick={() => setSearch('')} className="btn-secondary text-sm">{t('destinations.clearSearch')}</button>
            )}
            <Link to="/destinations" className="btn-primary text-sm ml-2">
              <Globe className="w-4 h-4" />
              {t('destinations.browseAllBtn')}
            </Link>
          </div>
        ) : (
          <>
            <div ref={sectionReveal.ref} className={`flex items-center justify-between mb-6 ${sectionReveal.className}`}>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">{t('destinations.popular')}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{filtered.length} {t('destinations.propertiesFound')}</p>
              </div>
              <Link to="/destinations" className="group text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors flex items-center gap-1">
                {t('destinations.viewAll')}
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.slice(0, 6).map((d) => (
                <DestinationCard key={d._id} destination={d} />
              ))}
            </div>

            {filtered.length > 6 && (
              <div className="text-center mt-8">
                <Link to="/destinations" className="btn-secondary text-sm group">
                  <Globe className="w-4 h-4" />
                  {t('destinations.showAll')} {filtered.length} {t('destinations.destinationsFound')}
                </Link>
              </div>
            )}
          </>
        )}
      </section>

      {/* === FEATURES === */}
      {!search && filtered.length > 0 && (
        <section className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-12 sm:py-16 transition-colors duration-200">
          <div className="page-container">
            <div ref={featuresReveal.ref} className={`text-center mb-10 ${featuresReveal.className}`}>
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-50 dark:bg-primary-900/30 rounded-xl mb-4">
                <Star className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">{t('common.whyBook')}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
                Everything you need for the perfect trip
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                {
                  icon: Sparkles,
                  titleKey: 'common.features.aiTitle',
                  descKey: 'common.features.aiDesc',
                  color: 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300',
                  delay: 0,
                },
                {
                  icon: Globe,
                  titleKey: 'common.features.curatedTitle',
                  descKey: 'common.features.curatedDesc',
                  color: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300',
                  delay: 0.1,
                },
                {
                  icon: Building2,
                  titleKey: 'common.features.easyBookingTitle',
                  descKey: 'common.features.easyBookingDesc',
                  color: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
                  delay: 0.2,
                },
              ].map((feature, idx) => (
                <FeatureCard key={feature.titleKey} feature={feature} index={idx} t={t} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
