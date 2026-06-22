// Production: uses VITE_API_URL from .env or Vercel dashboard.
// Local dev: falls back to localhost:3000 (where the Express backend runs).
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getToken = () => localStorage.getItem('token');

let onAuthError = null;
export function setOnAuthError(handler) {
  onAuthError = handler;
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  } catch (err) {
    throw new Error('Network error — check your connection');
  }

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error('Server returned an invalid response');
  }

  if (!res.ok) {
    // Clear invalid/expired tokens and notify the app
    if (res.status === 401 && token) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (onAuthError) onAuthError(data.message || 'Session expired');
    }
    throw new Error(data.message || data.error || 'Request failed');
  }
  return data;
}

// Auth
export const register = (data) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) });
export const login = (data) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(data) });
export const forgotPassword = (email) => request('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
export const resetPassword = (token, password) => request('/api/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) });

// Destinations
export const getDestinations = () => request('/api/destinations');
export const getDestination = (id) => request(`/api/destinations/${id}`);
export const createDestination = (data) => request('/api/destinations', { method: 'POST', body: JSON.stringify(data) });
export const deleteDestination = (id) => request(`/api/destinations/${id}`, { method: 'DELETE' });

// Bookings
export const getBookings = () => request('/api/bookings');
export const createBooking = (data) => request('/api/bookings', { method: 'POST', body: JSON.stringify(data) });

// AI Chat — OpenAI (requires API credits)
export const chatAI = (message) => request('/api/ai/chat', { method: 'POST', body: JSON.stringify({ message }) });

// AI Chat — Groq (free tier, llama-3.3-70b)
export const chatFree = (message) => request('/api/ai/chat/free', { method: 'POST', body: JSON.stringify({ message }) });

// Notes
export const getNotes = () => request('/api/notes');
export const createNote = (content) => request('/api/notes', { method: 'POST', body: JSON.stringify({ content }) });

// FAQ / Contact
export const sendFAQContact = (data) => request('/api/faq/ask', { method: 'POST', body: JSON.stringify(data) });

// Payment Checkout
export const checkout = (items, totalAmount, currency = 'USD') =>
  request('/api/payment/checkout', {
    method: 'POST',
    body: JSON.stringify({ items, totalAmount, currency }),
  });
