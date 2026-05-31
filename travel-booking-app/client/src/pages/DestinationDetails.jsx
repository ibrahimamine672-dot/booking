import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getDestination, createBooking, checkout } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MapPin, Star, ArrowLeft, Calendar, Users, Plane, CheckCircle, CreditCard, Loader2, XCircle } from 'lucide-react';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=500&fit=crop';

export default function DestinationDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState({ date: '', persons: 1 });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'loading' | 'success' | 'error'
  const [paymentError, setPaymentError] = useState('');

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

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">⚠️ {error || 'Destination not found'}</p>
          <Link to="/" className="text-blue-600 hover:underline">← Back to destinations</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      {/* Hero Image */}
      <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
        <img
          src={destination.image || DEFAULT_IMAGE}
          alt={destination.name}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <Link to="/" className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to destinations
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 animate-fadeIn">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{destination.name}</h1>
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span>{destination.city}, {destination.country}</span>
                  </div>
                </div>
                {destination.rating > 0 && (
                  <div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-full">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-amber-700">{destination.rating}</span>
                  </div>
                )}
              </div>

              {destination.description && (
                <p className="text-gray-600 leading-relaxed text-base">{destination.description}</p>
              )}

              {destination.price && (
                <div className="mt-6 inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-semibold">
                  <Plane className="w-4 h-4" />
                  From ${destination.price} per person
                </div>
              )}
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24 animate-slideUp">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Book This Trip</h3>

              {bookingSuccess ? (
                <div className="text-center py-4">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-1">Booking Confirmed! 🎉</h4>
                  <p className="text-sm text-gray-500 mb-4">Your trip has been booked successfully.</p>

                  {/* Payment Status Feedback */}
                  {paymentStatus === 'success' && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <p className="text-xs text-green-700 font-medium">
                        Payment successful! Confirmation sent.
                      </p>
                    </div>
                  )}

                  {paymentStatus === 'error' && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <div className="text-left">
                        <p className="text-xs text-red-700 font-medium">Payment failed</p>
                        <p className="text-xs text-red-500">{paymentError}</p>
                      </div>
                    </div>
                  )}

                  {destination.price && paymentStatus !== 'success' && (
                    <button
                      onClick={handlePayment}
                      disabled={paymentStatus === 'loading'}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm mb-3"
                    >
                      {paymentStatus === 'loading' ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5" />
                          Pay ${destination.price * booking.persons}
                        </>
                      )}
                    </button>
                  )}

                  <Link
                    to="/dashboard"
                    className="inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    View My Bookings →
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleBooking} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Travel Date
                    </label>
                    <input
                      type="date"
                      value={booking.date}
                      onChange={(e) => setBooking(prev => ({ ...prev, date: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      required
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <Users className="w-4 h-4 inline mr-1" />
                      Travelers
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setBooking(prev => ({ ...prev, persons: Math.max(1, prev.persons - 1) }))}
                        className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
                      >
                        -
                      </button>
                      <span className="w-10 text-center font-semibold text-gray-900">{booking.persons}</span>
                      <button
                        type="button"
                        onClick={() => setBooking(prev => ({ ...prev, persons: Math.min(10, prev.persons + 1) }))}
                        className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {destination.price && (
                    <div className="border-t border-gray-100 pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-600">Total</span>
                        <span className="text-xl font-bold text-blue-600">
                          ${destination.price * booking.persons}
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
                  >
                    {bookingLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : !user ? (
                      'Sign in to Book'
                    ) : (
                      'Book Now'
                    )}
                  </button>

                  {!user && (
                    <p className="text-xs text-gray-400 text-center">
                      You need to be signed in to make a booking.
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
