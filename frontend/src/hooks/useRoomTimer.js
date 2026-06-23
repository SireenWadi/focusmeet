import { useEffect, useState, useRef, useCallback } from "react";

export function useRoomTimer(socket, roomId) {
  const [remaining, setRemaining] = useState(null);
  const [total,     setTotal]     = useState(null);
  const [running,   setRunning]   = useState(false);
  const [ended,     setEnded]     = useState(false);
  const localRef = useRef(null);

  const stopLocal = () => { if (localRef.current) { clearInterval(localRef.current); localRef.current = null; } };
  const startLocal = () => {
    stopLocal();
    localRef.current = setInterval(() => setRemaining(r => (r !== null && r > 0) ? r - 1 : r), 1000);
  };

  useEffect(() => {
    if (!socket) return;
    socket.on("timer:state", ({ remaining: r, total: t, running: run }) => {
      setRemaining(r); setTotal(t); setRunning(run);
      run ? startLocal() : stopLocal();
    });
    socket.on("timer:tick", ({ remaining: r, total: t }) => {
      setRemaining(r); setTotal(t); setRunning(true);
    });
    socket.on("timer:ended", () => {
      setRemaining(0); setRunning(false); setEnded(true); stopLocal();
    });
    return () => {
      socket.off("timer:state"); socket.off("timer:tick"); socket.off("timer:ended");
      stopLocal();
    };
  }, [socket]);

  const start = useCallback(() => socket?.emit("timer:start", { roomId }), [socket, roomId]);
  const pause = useCallback(() => socket?.emit("timer:pause", { roomId }), [socket, roomId]);
  const reset = useCallback(() => { socket?.emit("timer:reset", { roomId }); setEnded(false); }, [socket, roomId]);

  const fmt = useCallback((s) => {
    if (s === null || s === undefined) return "--:--";
    const m = Math.floor(Math.max(0, s) / 60);
    const sec = Math.max(0, s) % 60;
    return `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
  }, []);

  const pct = (total && remaining !== null) ? Math.max(0, Math.min(1, remaining / total)) : 1;

  return { remaining, total, running, ended, start, pause, reset, fmt, pct };
}
