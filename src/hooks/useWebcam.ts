import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Live preview of the person camera for the operator panel.
 * Frames are only shown on screen — never recorded or uploaded.
 */
export function useWebcam() {
  const [on, setOn] = useState(false);
  const [error, setError] = useState('');
  const stream = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const stop = useCallback(() => {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    setOn(false);
  }, []);

  const toggle = useCallback(() => {
    if (stream.current) return stop();
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera not available in this browser.');
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((s) => {
        stream.current = s;
        setOn(true);
        setError('');
      })
      .catch(() => setError('Camera permission denied.'));
  }, [stop]);

  // Re-attach the stream whenever the <video> element (re)mounts.
  useEffect(() => {
    const v = videoRef.current;
    if (v && stream.current && v.srcObject !== stream.current) v.srcObject = stream.current;
  });

  useEffect(() => stop, [stop]);

  return { on, error, toggle, videoRef };
}
