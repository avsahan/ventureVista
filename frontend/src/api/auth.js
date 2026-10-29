const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const API_ORIGIN = (configuredApiUrl || (import.meta.env.DEV
  ? 'http://localhost:5000'
  : 'https://rpv01-backend-1.onrender.com')).replace(/\/+$/, '');
const API_BASE = `${API_ORIGIN}/api/v1`;

export const getAssetUrl = (path) => {
  if (!path) return '';
  return /^https?:\/\//i.test(path)
    ? path
    : `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
};

function apiError(message, status = 0, details) {
  const error = new Error(message || 'The request could not be completed.');
  error.status = status;
  error.details = details;
  return error;
}

async function requestApi(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
    });
  } catch {
    throw apiError('Unable to reach the server. Check your connection and try again.');
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw apiError(
      payload?.message || 'The request could not be completed.',
      response.status,
      payload?.details,
    );
  }

  return payload && typeof payload === 'object' ? payload : {};
}

const requestAuth = (path, options) => requestApi(`/auth${path}`, options);

function post(path, data) {
  return requestAuth(path, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export const registerTraveler = (data) => post('/register/traveler', data);
export const registerGuide = (data, profilePhoto) => {
  const body = new FormData();
  body.append('profile', JSON.stringify(data));
  if (profilePhoto) body.append('profilePhoto', profilePhoto);
  return requestAuth('/register/guide', { method: 'POST', body });
};
export const login = (data) => post('/login', data);
export const getCurrentUser = () => requestAuth('/me');
export const getGuides = () => requestAuth('/guides');
export const logout = () => post('/logout', {});
export const getTrips = () => requestApi('/trips');
export const createTrip = (data) => requestApi('/trips', { method: 'POST', body: JSON.stringify(data) });
export const updateTrip = (tripId, data) => requestApi(`/trips/${tripId}`, { method: 'PATCH', body: JSON.stringify(data) });
export const getBookings = () => requestApi('/bookings');
export const createBooking = (tripId, data) => requestApi(`/trips/${tripId}/bookings`, { method: 'POST', body: JSON.stringify(data) });
export const updateBooking = (bookingId, data) => requestApi(`/bookings/${bookingId}`, { method: 'PATCH', body: JSON.stringify(data) });
export const respondToCounterOffer = (bookingId, status) => requestApi(`/bookings/${bookingId}/respond`, { method: 'PATCH', body: JSON.stringify({ status }) });
export const getBookingMessages = (bookingId) => requestApi(`/bookings/${bookingId}/messages`);
export const sendBookingMessage = (bookingId, body) => requestApi(`/bookings/${bookingId}/messages`, { method: 'POST', body: JSON.stringify({ body }) });

export const submitPermissionRequest = (data) => requestApi('/permissions', { method: 'POST', body: JSON.stringify(data) });
export const getPermissions = (params = {}) => {
  const qs = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))).toString();
  return requestApi(`/permissions${qs ? `?${qs}` : ''}`);
};
export const getPermissionStats = () => requestApi('/permissions/stats');
export const reviewPermission = (id, data) => requestApi(`/permissions/${id}/review`, { method: 'PATCH', body: JSON.stringify(data) });
