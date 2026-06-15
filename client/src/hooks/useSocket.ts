import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { getToken } from '../services/auth';
import type { Message } from '../types';

// Socket server is the API origin without the trailing /api path.
const SOCKET_URL = (import.meta.env['VITE_API_URL'] ?? 'http://localhost:5000/api').replace(
  /\/api\/?$/,
  '',
);

/**
 * Opens an authenticated Socket.IO connection for the lifetime of the calling
 * component and invokes `onMessage` for every `message:new` event. The handler
 * is kept in a ref so changing it does not reconnect the socket.
 */
export function useSocket(onMessage: (msg: Message) => void): void {
  const handlerRef = useRef(onMessage);
  handlerRef.current = onMessage;

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const socket: Socket = io(SOCKET_URL, { auth: { token } });
    const handler = (msg: Message): void => handlerRef.current(msg);
    socket.on('message:new', handler);

    return () => {
      socket.off('message:new', handler);
      socket.disconnect();
    };
  }, []);
}
