import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Plane,
  Compass,
  Calendar,
  Globe,
  LogOut,
  LogIn,
  UserPlus,
  User,
  ChevronDown,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [destinationsOpen, setDestinationsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDestinationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setDestinationsOpen(false);
  }, [location.pathname, location.search]);

  const isActive = (path) =>
    location.pathname === path
      ? 'text-blue-600 border-b-2 border-blue-600'
      : 'text-gray-600 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-400';

  const linkClass = (path) =>
    `flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all duration-200 ${isActive(path)}`;

  const isDestinationsActive = location.pathname === '/destinations';

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Plane className="w-6 h-6" />
            <span>TravelBook</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className={linkClass('/')}>
              <Compass className="w-4 h-4" />
              Home
            </Link>

            {/* Destinations Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDestinationsOpen((prev) => !prev)}
                onMouseEnter={() => setDestinationsOpen(true)}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all duration-200 border-b-2 ${
                  isDestinationsActive
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-600 hover:text-blue-600 border-transparent hover:border-blue-400'
                }`}
              >
                <Globe className="w-4 h-4" />
                Destinations
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    destinationsOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {destinationsOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fadeIn"
                  onMouseLeave={() => setDestinationsOpen(false)}
                >
                  {/* Dropdown header */}
                  <div className="px-4 py-1.5 mb-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Explore by country
                    </p>
                  </div>

                  <Link
                    to="/destinations?country=maroc"
                    onClick={() => setDestinationsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-150 rounded-lg mx-1"
                  >
                    <span className="text-lg leading-none">🇲🇦</span>
                    <span className="font-medium">Maroc</span>
                  </Link>

                  <div className="mx-3 my-1.5 border-t border-gray-100" />

                  <Link
                    to="/destinations"
                    onClick={() => setDestinationsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-150 rounded-lg mx-1"
                  >
                    <Globe className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">Tout le monde</span>
                    <span className="ml-auto text-xs text-gray-400">All</span>
                  </Link>
                </div>
              )}
            </div>

            {user && (
              <Link to="/dashboard" className={linkClass('/dashboard')}>
                <Calendar className="w-4 h-4" />
                My Bookings
              </Link>
            )}
          </div>

          {/* Auth */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500 mr-2">
                  <User className="w-4 h-4" />
                  {user.name}
                </span>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 shadow-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
