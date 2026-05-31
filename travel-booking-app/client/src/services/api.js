const API_BASE = '/api';

const getToken = () => localStorage.getItem('token');

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

  if (!res.ok) throw new Error(data.message || data.error || 'Request failed');
  return data;
}

// Auth
export const register = (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) });
export const login = (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) });

// Destinations
export const getDestinations = () => request('/destinations');
export const getDestination = (id) => request(`/destinations/${id}`);
export const createDestination = (data) => request('/destinations', { method: 'POST', body: JSON.stringify(data) });
export const deleteDestination = (id) => request(`/destinations/${id}`, { method: 'DELETE' });

// Bookings
export const getBookings = () => request('/bookings');
export const createBooking = (data) => request('/bookings', { method: 'POST', body: JSON.stringify(data) });

// AI Chat
export const chatAI = (message) => request('/ai/chat', { method: 'POST', body: JSON.stringify({ message }) });

// Payment Checkout
export const checkout = (items, totalAmount, currency = 'USD') =>
  request('/payment/checkout', {
    method: 'POST',
    body: JSON.stringify({ items, totalAmount, currency }),
  });
