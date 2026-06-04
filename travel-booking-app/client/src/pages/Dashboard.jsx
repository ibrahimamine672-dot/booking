import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getBookings } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Calendar, Users, MapPin, Plane, AlertCircle,
  LayoutDashboard, Compass, ChevronRight, Building2,
} from 'lucide-react';

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getBookings()
      .then(setBookings)
      .catch((err) => setError(err?.message || 'Failed to load bookings'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 sm:py-10 transition-colors duration-200">
      <div className="page-container">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-primary-800 dark:bg-primary-700 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('dashboard.title')}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.subtitle')}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 skeleton rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 skeleton w-1/3" />
                    <div className="h-3 skeleton w-1/2" />
                    <div className="h-3 skeleton w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-10 text-center">
            <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-7 h-7 text-red-500 dark:text-red-400" />
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-medium">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-secondary mt-4 text-sm">{t('destinationDetails.tryAgain')}</button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plane className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">{t('dashboard.noBookingsYet')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
              {t('dashboard.noBookingsMsg')}
            </p>
            <Link to="/" className="btn-primary text-sm">
              <Compass className="w-4 h-4" />
              {t('dashboard.exploreDestinations')}
            </Link>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[
                { labelKey: 'dashboard.totalBookings', value: bookings.length, icon: Calendar, color: 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' },
                { labelKey: 'dashboard.upcomingTrips', value: bookings.filter(b => new Date(b.date) >= new Date()).length, icon: Plane, color: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
                { labelKey: 'dashboard.totalTravelers', value: bookings.reduce((sum, b) => sum + (b.persons || 0), 0), icon: Users, color: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
              ].map((stat) => (
                <div key={stat.labelKey} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{stat.value}</p>
                    <p className="text-[0.625rem] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">{t(stat.labelKey)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bookings List */}
            <div className="space-y-3">
              {bookings.map((booking) => {
                const isUpcoming = new Date(booking.date) >= new Date();
                const destName = typeof booking.destination === 'object' && booking.destination?.name
                  ? booking.destination.name
                  : typeof booking.destination === 'string'
                    ? `Destination #${booking.destination.slice(-6)}`
                    : 'Destination';

                return (
                  <div key={booking._id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-primary-200 dark:hover:border-primary-600 hover:shadow-booking-card-hover dark:hover:shadow-primary-900/30 transition-all duration-200">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isUpcoming ? 'bg-primary-50 dark:bg-primary-900/30' : 'bg-gray-100 dark:bg-gray-700'
                        }`}>
                          <Plane className={`w-5 h-5 ${isUpcoming ? 'text-primary-700 dark:text-primary-300' : 'text-gray-400 dark:text-gray-500'}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm truncate">{destName}</h3>
                            <span className={`text-[0.625rem] font-semibold px-1.5 py-0.5 rounded-sm ${
                              isUpcoming ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                            }`}>
                              {isUpcoming ? t('dashboard.upcoming') : t('dashboard.completed')}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(booking.date).toLocaleDateString(i18n.language, {
                                weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {booking.persons} {booking.persons !== 1 ? t('destinationDetails.guests_plural') : t('destinationDetails.guest')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0 mt-2" />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
