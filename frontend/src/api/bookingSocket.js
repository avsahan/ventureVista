import { io } from 'socket.io-client';
import { SOCKET_ORIGIN } from './config';

export function openBookingSocket() {
  return io(SOCKET_ORIGIN, {
    withCredentials: true,
  });
}
