import { useEffect, useRef, useState, useCallback } from "react";

export function useWebcam({ audio = true, video = true } = {}) {
  const videoRef  = useRef(null);
  const streamRef = useRef(null);
  const [status,  setStatus]  = useState("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff,setIsCamOff] = useState(false);
  const [error,   setError]   = useState(null);

  const attachStream = useCallback((el) => {
    if (el && streamRef.current) {
      el.srcObject = streamRef.current;
    }
  }, []);

  // Stable ref callback so callers can re-attach on re-render
  const setVideoRef = useCallback((el) => {
    videoRef.current = el;
    attachStream(el);
  }, [attachStream]);

  useEffect(() => {
    let cancelled = false;
    async function start() {
      setStatus("requesting");
      setError(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: audio ? { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 } : false,
          video: video ? { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" } : false,
        });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStatus("active");
      } catch (err) {
        if (cancelled) return;
        setError(err.message);
        setStatus(err.name === "NotAllowedError" ? "denied" : "error");
      }
    }
    start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    };
  }, []);

  const toggleMute = useCallback(() => {
    streamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setIsMuted(m => !m);
  }, []);

  const toggleCamera = useCallback(() => {
    streamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    setIsCamOff(c => !c);
  }, []);

  // Returns the raw MediaStream for WebRTC peer connections
  const getStream = useCallback(() => streamRef.current, []);

  return { videoRef, setVideoRef, status, error, isMuted, isCamOff, toggleMute, toggleCamera, getStream };
}
