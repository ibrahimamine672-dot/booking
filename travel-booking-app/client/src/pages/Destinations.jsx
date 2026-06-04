import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getDestinations } from '../services/api';
import useScrollReveal from '../hooks/useScrollReveal';
import { Globe, Map, Compass, SlidersHorizontal } from 'lucide-react';
import DestinationCard from '../components/DestinationCard';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=400&fit=crop';

function formatPrice(price, country) {
  if (price == null) return null;
  const num = Number(price);
  if (isNaN(num)) return null;
  const isMorocco = (country || '').toLowerCase().includes('maroc') || (country || '').toLowerCase().includes('morocco');
  if (isMorocco) return `${num.toLocaleString()} DH`;
  return `$${num.toLocaleString()}`;
}

export default function Destinations() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const headerReveal = useScrollReveal({ threshold: 0.05 });

  const countryParam = searchParams.get('country');
  const activeFilter = countryParam === 'maroc' ? 'maroc' : 'all';

  useEffect(() => {
    getDestinations()
      .then(setDestinations)
      .catch(() => setError('Failed to load destinations'))
      .finally(() => setLoading(false));
  }, []);

  const handleFilterChange = (key) => {
    if (key === 'maroc') {
      setSearchParams({ country: 'maroc' });
    } else {
      setSearchParams({});
    }
  };

  const filtered = destinations.filter((d) => {
    if (activeFilter === 'maroc') {
      const country = (d.country || '').toLowerCase();
      return country.includes('maroc') || country.includes('morocco');
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
    if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
    return 0;
  });

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
      {/* === Header === */}
      <div className="hero-gradient text-white relative overflow-hidden">
        <div className="hero-orb" />
        <div className="hero-orb" />
        <div className="page-container py-8 sm:py-10 relative">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-sm text-[0.625rem] font-semibold uppercase tracking-wider mb-3">
            <Compass className="w-3 h-3" />
            {t('destinations.accommodation')}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-1">{t('destinations.findYourStay')}</h1>
          <p className="text-blue-200/80 text-sm max-w-xl">{t('destinations.findStay')}</p>
        </div>
      </div>

      {/* === Filter & Sort Bar === */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-14 z-30 transition-colors duration-200">
        <div className="page-container py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleFilterChange('all')}
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                  activeFilter === 'all'
                    ? 'bg-primary-800 dark:bg-primary-700 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Globe className="w-3 h-3 inline mr-1" />
                {t('destinations.all')}
              </button>
              <button
                onClick={() => handleFilterChange('maroc')}
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                  activeFilter === 'maroc'
                    ? 'bg-primary-800 dark:bg-primary-700 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                🇲🇦 {t('nav.morocco')}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs border border-gray-300 dark:border-gray-600 rounded-sm px-2 py-1.5 text-gray-600 dark:text-gray-300 dark:bg-gray-700 focus:outline-none focus:border-primary-600 dark:focus:border-primary-400 transition-colors"
              >
                <option value="popular">{t('destinations.mostPopular')}</option>
                <option value="rating">{t('destinations.highestRated')}</option>
                <option value="price-low">{t('destinations.priceLowHigh')}</option>
                <option value="price-high">{t('destinations.priceHighLow')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* === Content === */}
      <section className="page-container py-6 sm:py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="h-44 skeleton" />
                <div className="p-4 space-y-2">
                  <div className="h-4 skeleton w-3/4" />
                  <div className="h-3 skeleton w-1/2" />
                  <div className="h-3 skeleton w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-16 max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Map className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">{t('destinations.noProperties')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {activeFilter === 'maroc'
                ? t('destinations.noPropertiesMorocco')
                : t('destinations.noDestinationsAvail')}
            </p>
            {activeFilter === 'maroc' && (
              <button onClick={() => handleFilterChange('all')} className="btn-secondary text-sm">
                {t('destinations.viewAllDestinations')}
              </button>
            )}
          </div>
        ) : (
          <>
            <div ref={headerReveal.ref} className={`flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-5 ${headerReveal.className}`}>
              <Compass className="w-4 h-4" />
              <span>{sorted.length} {t('destinations.destinationsFound')}
                {activeFilter === 'maroc' ? ` ${t('destinations.inMorocco')}` : ''}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {sorted.map((destination) => (
                <DestinationCard key={destination._id} destination={destination} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
