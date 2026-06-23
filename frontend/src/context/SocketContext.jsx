import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";

export function SocketProvider({ children }) {
  const socketRef   = useRef(null);
  const [connected, setConnected] = useState(false);
  const [error,     setError]     = useState(null);

  useEffect(() => {
    const s = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
      timeout: 10000,
    });
    socketRef.current = s;

    s.on("connect",            () => { setConnected(true);  setError(null); });
    s.on("disconnect",         () => setConnected(false));
    s.on("connect_error", (e) => { setError(e.message); setConnected(false); });
    s.on("reconnect",          () => setConnected(true));

    return () => { s.removeAllListeners(); s.disconnect(); };
  }, []);

  const emit = useCallback((event, data) => {
    socketRef.current?.emit(event, data);
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected, error, emit }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() { return useContext(SocketContext); }
