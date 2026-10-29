import { io } from 'socket.io-client';

export function openBookingSocket() {
  return io(import.meta.env.VITE_SOCKET_URL || window.location.origin, {
    withCredentials: true,
  });
}
