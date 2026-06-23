import { useRef, useState, useCallback } from "react";

export function useScreenRecorder() {
  const mediaRecorderRef = useRef(null);
  const chunksRef        = useRef([]);
  const [recording,  setRecording]  = useState(false);
  const [blobUrl,    setBlobUrl]    = useState(null);
  const [error,      setError]      = useState(null);
  const [duration,   setDuration]   = useState(0);
  const timerRef = useRef(null);

  const startRecording = useCallback(async (webcamStream = null) => {
    setError(null);
    setBlobUrl(null);
    chunksRef.current = [];
    try {
      // Capture the whole screen
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: "screen", width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: true,
      });

      // Mix webcam audio with screen capture if available
      let finalStream = screenStream;
      if (webcamStream) {
        const ctx    = new AudioContext();
        const dest   = ctx.createMediaStreamDestination();
        const tracks = [...screenStream.getTracks()];
        webcamStream.getAudioTracks().forEach(t => {
          ctx.createMediaStreamSource(new MediaStream([t])).connect(dest);
          tracks.push(t.clone());
        });
        screenStream.getAudioTracks().forEach(t => {
          ctx.createMediaStreamSource(new MediaStream([t])).connect(dest);
        });
        finalStream = new MediaStream([...screenStream.getVideoTracks(), ...dest.stream.getAudioTracks()]);
      }

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
        ? "video/webm;codecs=vp9,opus"
        : "video/webm";

      const recorder = new MediaRecorder(finalStream, { mimeType, videoBitsPerSecond: 2500000 });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = e => { if (e.data?.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        clearInterval(timerRef.current);
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setBlobUrl(URL.createObjectURL(blob));
        setRecording(false);
        finalStream.getTracks().forEach(t => t.stop());
      };
      recorder.onerror = (e) => { setError(e.error?.message || "Recording error"); setRecording(false); };

      // Stop recording when user stops screen share
      screenStream.getVideoTracks()[0].addEventListener("ended", () => {
        if (recorder.state !== "inactive") recorder.stop();
      });

      recorder.start(1000); // collect chunks every 1s
      setRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    } catch (err) {
      setError(err.name === "NotAllowedError" ? "Screen share was denied." : err.message);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    clearInterval(timerRef.current);
  }, []);

  const downloadRecording = useCallback((filename = "focusmeet-recording.webm") => {
    if (!blobUrl) return;
    const a = document.createElement("a");
    a.href = blobUrl; a.download = filename; a.click();
  }, [blobUrl]);

  const fmtDur = (s) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  return { recording, blobUrl, error, duration, fmtDur, startRecording, stopRecording, downloadRecording };
}
