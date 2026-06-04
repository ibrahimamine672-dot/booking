import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getDestination, createBooking, checkout } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  MapPin, Star, ArrowLeft, Calendar, Users, Plane, CheckCircle,
  CreditCard, Loader2, XCircle, ChevronLeft, Shield, Building2,
  Wifi, Coffee, Car, Dumbbell, ChevronRight, X, Image,
} from 'lucide-react';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=500&fit=crop';

const GALLERY_IMAGES = [
  'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=500&fit=crop',
];

function getReviewScoreClass(rating) {
  if (rating >= 4.5) return 'review-score-excellent';
  if (rating >= 3.5) return 'review-score-good';
  if (rating >= 2.5) return 'review-score-fair';
  if (rating > 0) return 'review-score-poor';
  return 'review-score-none';
}

function getReviewLabel(rating) {
  if (rating >= 4.5) return 'Excellent';
  if (rating >= 3.5) return 'Good';
  if (rating >= 2.5) return 'Fair';
  if (rating > 0) return 'Poor';
  return '';
}

export default function DestinationDetails() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState({ date: '', persons: 1 });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentError, setPaymentError] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    getDestination(id)
      .then(setDestination)
      .catch(() => setError('Destination not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    if (!booking.date) return;

    setBookingLoading(true);
    try {
      await createBooking({
        destination: destination._id,
        date: booking.date,
        persons: booking.persons,
      });
      setBookingSuccess(true);
    } catch (err) {
      setError(err.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  const handlePayment = async () => {
    setPaymentStatus('loading');
    setPaymentError('');
    try {
      await checkout(
        [{ name: destination.name, price: destination.price }],
        destination.price * booking.persons,
        'USD'
      );
      setPaymentStatus('success');
    } catch (err) {
      setPaymentStatus('error');
      setPaymentError(err.message || 'Payment failed');
    }
  };

  const destinationImages = destination?.images?.length
    ? destination.images
    : GALLERY_IMAGES;

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const today = new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-10 h-10 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-950">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-red-500 dark:text-red-400" />
          </div>
          <p className="text-gray-800 dark:text-gray-200 font-semibold text-lg mb-1">{t('destinationDetails.notFound')}</p>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
          <Link to="/" className="btn-primary">
            <ChevronLeft className="w-4 h-4" />
            {t('destinationDetails.backToDestinations')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      {/* === LIGHTBOX === */}
      {lightboxOpen && (
        <div className="lightbox-overlay" onClick={() => setLightboxOpen(false)}>
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex(prev => (prev - 1 + destinationImages.length) % destinationImages.length);
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <img
            src={destinationImages[lightboxIndex]}
            alt={`${destination.name} photo ${lightboxIndex + 1}`}
            className="lightbox-image"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex(prev => (prev + 1) % destinationImages.length);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {destinationImages.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === lightboxIndex ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* === Hero Image Gallery === */}
      <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
        <div className="grid grid-cols-4 grid-rows-1 h-full gap-1">
          {/* Main large image */}
          <div
            className="col-span-2 row-span-1 relative overflow-hidden cursor-pointer group"
            onClick={() => openLightbox(0)}
          >
            <img
              src={destination.image || destinationImages[0]}
              alt={destination.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>
          {/* Side images */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`relative overflow-hidden cursor-pointer group ${i >= destinationImages.length ? 'hidden' : 'hidden sm:block'}`}
              onClick={() => openLightbox(i)}
            >
              <img
                src={destinationImages[i] || destinationImages[0]}
                alt={`${destination.name} view ${i + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              {/* Last image overlay */}
              {i === 3 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-white text-sm font-semibold flex items-center gap-1.5">
                    +{destinationImages.length - 3}
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm border border-white/20 text-white hover:text-white rounded-lg text-xs font-medium transition-all hover:bg-white/30"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('destinationDetails.back')}</span>
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 z-10">
          <div className="page-container">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 drop-shadow-lg">
                  {destination.name}
                </h1>
                <div className="flex items-center gap-1.5 text-white/80 text-sm">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{destination.city}, {destination.country}</span>
                </div>
              </div>
              {destination.rating > 0 && (
                <div className="flex flex-col items-end flex-shrink-0">
                  <div className={`review-score ${getReviewScoreClass(destination.rating)} w-10 h-10 text-sm`}>
                    {destination.rating}
                  </div>
                  <span className="text-xs text-white/60 mt-0.5 font-medium">{t(`destinations.${getReviewLabel(destination.rating).toLowerCase()}`)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Photo count badge */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
          <button
            onClick={() => openLightbox(0)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm border border-white/20 text-white rounded-lg text-xs font-medium transition-all hover:bg-white/30"
          >
            <Image className="w-3.5 h-3.5" />
            {destinationImages.length} photos
          </button>
        </div>
      </div>

      {/* === Content === */}
      <div className="page-container -mt-4 relative z-10 pb-12 sm:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">
                {destination.name}
              </h2>
              {destination.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{destination.description}</p>
              )}
              {destination.price && (
                <div className="mt-4 inline-flex items-center gap-2 bg-primary-50 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 px-3 py-2 rounded-sm text-sm font-semibold">
                  <Plane className="w-4 h-4" />
                  {t('destinations.from')} ${destination.price} {t('destinations.perPerson')}
                </div>
              )}
            </div>

            {/* Highlights */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">{t('destinationDetails.highlights')}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: MapPin, labelKey: 'destinationDetails.location', value: `${destination.city}, ${destination.country}` },
                  { icon: Star, labelKey: 'destinationDetails.rating', value: destination.rating > 0 ? `${destination.rating} / 5` : 'Not rated' },
                  { icon: Users, labelKey: 'destinationDetails.groupSize', value: t('destinationDetails.upToTravelers') },
                  { icon: Shield, labelKey: 'destinationDetails.safety', value: t('destinationDetails.travelerFriendly') },
                ].map((item) => (
                  <div key={item.labelKey} className="bg-gray-50 dark:bg-gray-700/50 rounded-sm p-3 text-center">
                    <div className="w-8 h-8 bg-primary-50 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                      <item.icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    </div>
                    <p className="text-[0.625rem] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t(item.labelKey)}</p>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">{t('destinationDetails.popularAmenities')}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { icon: Wifi, labelKey: 'destinationDetails.freeWifi' },
                  { icon: Coffee, labelKey: 'destinationDetails.breakfastIncluded' },
                  { icon: Car, labelKey: 'destinationDetails.freeParking' },
                  { icon: Dumbbell, labelKey: 'destinationDetails.fitnessCenter' },
                  { icon: Shield, labelKey: 'destinationDetails.security' },
                  { icon: Plane, labelKey: 'destinationDetails.airportShuttle' },
                ].map((amenity) => (
                  <div key={amenity.labelKey} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <amenity.icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    <span>{t(amenity.labelKey)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* === Booking Card === */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 sticky top-20 transition-colors duration-200">
              {destination.price && (
                <div className="mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">${destination.price}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">{t('destinationDetails.perNight')}</span>
                </div>
              )}

              {bookingSuccess ? (
                <div className="text-center py-4">
                  <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-7 h-7 text-green-600 dark:text-green-400" />
                  </div>
                  <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-1">{t('destinationDetails.bookingConfirmed')}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('destinationDetails.tripBooked')}</p>

                  {paymentStatus === 'success' && (
                    <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-sm flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <div className="text-left">
                        <p className="text-sm font-semibold text-green-800 dark:text-green-300">{t('destinationDetails.paymentSuccessful')}</p>
                        <p className="text-xs text-green-600 dark:text-green-400">{t('destinationDetails.confirmationSent')}</p>
                      </div>
                    </div>
                  )}

                  {paymentStatus === 'error' && (
                    <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-sm flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="text-left">
                        <p className="text-sm font-semibold text-red-800 dark:text-red-300">{t('destinationDetails.paymentFailed')}</p>
                        <p className="text-xs text-red-600 dark:text-red-400">{paymentError}</p>
                      </div>
                    </div>
                  )}

                  {destination.price && paymentStatus !== 'success' && (
                    <button
                      onClick={handlePayment}
                      disabled={paymentStatus === 'loading'}
                      className="btn-primary w-full mb-2 bg-green-600 hover:bg-green-700 text-sm"
                    >
                      {paymentStatus === 'loading' ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> {t('destinationDetails.processing')}</>
                      ) : (
                        <><CreditCard className="w-4 h-4" /> {t('destinationDetails.payNow')} ${destination.price * booking.persons}</>
                      )}
                    </button>
                  )}

                  {paymentStatus === 'success' && (
                    <Link to="/dashboard" className="btn-primary w-full text-sm">{t('destinationDetails.viewMyBookings')}</Link>
                  )}
                </div>
              ) : (
                <form onSubmit={handleBooking} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">{t('destinationDetails.checkIn')}</label>
                    <input
                      type="date"
                      value={booking.date}
                      onChange={(e) => setBooking(prev => ({ ...prev, date: e.target.value }))}
                      min={today}
                      required
                      className="booking-input text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">{t('destinationDetails.guests')}</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setBooking(prev => ({ ...prev, persons: Math.max(1, prev.persons - 1) }))}
                        className="w-10 h-10 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors text-lg font-medium"
                      >
                        −
                      </button>
                      <div className="flex-1 text-center">
                        <span className="text-xl font-bold text-gray-800 dark:text-gray-100">{booking.persons}</span>
                        <p className="text-[0.625rem] text-gray-400 dark:text-gray-500">{booking.persons !== 1 ? t('destinationDetails.guests_plural') : t('destinationDetails.guest')}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setBooking(prev => ({ ...prev, persons: Math.min(10, prev.persons + 1) }))}
                        className="w-10 h-10 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors text-lg font-medium"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {destination.price && (
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-3 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">${destination.price} x {booking.persons} {booking.persons !== 1 ? t('destinationDetails.guests_plural') : t('destinationDetails.guest')}</span>
                        <span className="text-gray-800 dark:text-gray-200 font-medium">${destination.price * booking.persons}</span>
                      </div>
                      <div className="flex justify-between font-bold text-base pt-1">
                        <span className="text-gray-800 dark:text-gray-100">{t('destinationDetails.total')}</span>
                        <span className="text-primary-800 dark:text-primary-400">${destination.price * booking.persons}</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="btn-primary w-full text-sm"
                  >
                    {bookingLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> {t('destinationDetails.processing')}</>
                    ) : !user ? (
                      t('destinationDetails.signInToBook')
                    ) : (
                      t('destinationDetails.reserve')
                    )}
                  </button>

                  {!user && (
                    <p className="text-[0.625rem] text-gray-400 dark:text-gray-500 text-center">
                      {t('destinationDetails.signInToBookMsg')}
                    </p>
                  )}

                  <p className="text-[0.625rem] text-gray-400 dark:text-gray-500 text-center flex items-center justify-center gap-1">
                    <Shield className="w-3 h-3" />
                    {t('destinationDetails.freeCancellationMsg')}
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
