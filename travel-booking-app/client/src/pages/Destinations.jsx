import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getDestinations } from '../services/api';
import { Globe, Map, Compass, Filter, MapPin, Star, ChevronRight, Store } from 'lucide-react';
import LocalMarketplace from '../components/LocalMarketplace';

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=400&fit=crop';

const FILTERS = [
  { key: 'all', label: 'Tout le monde', icon: Globe, country: null },
  { key: 'maroc', label: 'Maroc', country: 'maroc' },
];

function matchesCountry(destination, filterCountry) {
  if (!filterCountry) return true;
  const country = (destination.country || '').toLowerCase();
  return country.includes('maroc') || country.includes('morocco');
}

function formatPrice(price, country) {
  if (price == null) return null;
  const num = Number(price);
  if (isNaN(num)) return null;
  // Use DH for Moroccan destinations, $ for the rest
  const isMorocco = (country || '').toLowerCase().includes('maroc') || (country || '').toLowerCase().includes('morocco');
  if (isMorocco) {
    return `${num.toLocaleString()} DH`;
  }
  return `$${num.toLocaleString()}`;
}

export default function Destinations() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('destinations');

  // Read initial filter from URL query param
  const countryParam = searchParams.get('country');
  const [activeFilter, setActiveFilter] = useState(
    countryParam === 'maroc' ? 'maroc' : 'all'
  );

  useEffect(() => {
    getDestinations()
      .then(setDestinations)
      .catch(() => setError('Failed to load destinations'))
      .finally(() => setLoading(false));
  }, []);

  // Sync URL when filter changes
  const handleFilterChange = (key) => {
    setActiveFilter(key);
    if (key === 'maroc') {
      setSearchParams({ country: 'maroc' });
    } else {
      setSearchParams({});
    }
  };

  const activeFilterConfig = FILTERS.find((f) => f.key === activeFilter);

  const filtered = destinations.filter((d) =>
    matchesCountry(d, activeFilterConfig?.country)
  );

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-2">⚠️ {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:underline text-sm"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Header Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1920&q=80')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-blue-700/80 to-indigo-800/90" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Globe className="w-7 h-7 text-blue-200" />
              <span className="text-blue-200 font-medium tracking-wider uppercase text-sm">
                Destinations
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
              Explore the World
            </h1>
            <p className="text-base sm:text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Browse our curated collection of breathtaking destinations and find
              your perfect getaway.
            </p>

            {/* Filter Buttons */}
            <div className="flex items-center justify-center gap-3">
              <div className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-1.5 shadow-lg">
                <Filter className="w-4 h-4 text-blue-200 ml-2" />
                {FILTERS.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => handleFilterChange(key)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      activeFilter === key
                        ? 'bg-white text-blue-700 shadow-md'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {key === 'maroc' ? (
                      <span className="text-lg leading-none">🇲🇦</span>
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

      {/* Section Toggle */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="flex items-center gap-1 bg-white rounded-2xl shadow-lg border border-gray-100 p-1.5 w-fit mx-auto">
          <button
            onClick={() => setActiveSection('destinations')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeSection === 'destinations'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Globe className="w-4 h-4" />
            Destinations
          </button>
          <button
            onClick={() => setActiveSection('market')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeSection === 'market'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Store className="w-4 h-4" />
            Marché local
          </button>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 relative z-10">
        {activeSection === 'market' ? (
          <div className="mt-8">
            <LocalMarketplace />
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden shadow-md animate-pulse"
              >
                <div className="h-52 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Map className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No destinations found
            </h3>
            <p className="text-gray-500">
              {activeFilter === 'maroc'
                ? 'No destinations available in Morocco yet.'
                : 'No destinations available yet.'}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-gray-500">
                <Compass className="w-5 h-5" />
                <span className="text-sm">
                  {filtered.length} destination
                  {filtered.length !== 1 ? 's' : ''} found
                  {activeFilter === 'maroc' ? ' in Morocco' : ''}
                </span>
              </div>
            </div>

            {/* Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filtered.map((destination) => {
                const {
                  _id,
                  name,
                  country,
                  city,
                  description,
                  image,
                  price,
                  rating,
                } = destination;
                const formattedPrice = formatPrice(price, country);

                return (
                  <Link
                    key={_id}
                    to={`/destinations/${_id}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fadeIn"
                  >
                    {/* Image */}
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={image || DEFAULT_IMAGE}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = DEFAULT_IMAGE;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                      {/* Rating Badge */}
                      {rating > 0 && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-sm font-semibold text-amber-600 shadow-sm">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          {rating}
                        </div>
                      )}

                      {/* Price Badge */}
                      {formattedPrice && (
                        <div className="absolute bottom-3 left-3 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg">
                          {formattedPrice}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>
                          {city}
                          {city && country ? ', ' : ''}
                          {country}
                        </span>
                      </div>
                      {description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                          {description}
                        </p>
                      )}
                      <div className="flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700">
                        View Details
                        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

