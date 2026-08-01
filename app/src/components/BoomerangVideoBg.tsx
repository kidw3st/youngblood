import { useEffect, useRef, useState } from 'react';
import { pingPongIndex } from '../lib/pingPong';

const MAX_WIDTH = 960;
const PLAYBACK_FPS = 30;

interface BoomerangVideoBgProps {
  src?: string;
}

export function BoomerangVideoBg({ src = '/hero-loop.mp4' }: BoomerangVideoBgProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLCanvasElement[]>([]);
  const rafHandleRef = useRef<number | null>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const [playingFrames, setPlayingFrames] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const captureFrame = () => {
      if (video.videoWidth === 0) return;
      const scale = Math.min(1, MAX_WIDTH / video.videoWidth);
      const w = Math.round(video.videoWidth * scale);
      const h = Math.round(video.videoHeight * scale);
      const frame = document.createElement('canvas');
      frame.width = w;
      frame.height = h;
      const ctx = frame.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, w, h);
        framesRef.current.push(frame);
      }
    };

    const supportsRvfc = 'requestVideoFrameCallback' in video;

    const scheduleNext = () => {
      if (supportsRvfc) {
        (
          video as HTMLVideoElement & {
            requestVideoFrameCallback: (cb: () => void) => number;
          }
        ).requestVideoFrameCallback(() => {
          captureFrame();
          scheduleNext();
        });
      } else {
        rafHandleRef.current = requestAnimationFrame(() => {
          captureFrame();
          scheduleNext();
        });
      }
    };

    const handleEnded = () => {
      if (!supportsRvfc && rafHandleRef.current !== null) {
        cancelAnimationFrame(rafHandleRef.current);
        rafHandleRef.current = null;
      }
      setPlayingFrames(true);
    };

    const handleError = () => setVideoFailed(true);

    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('loadedmetadata', scheduleNext, { once: true });

    video.play().catch(() => setVideoFailed(true));

    return () => {
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadedmetadata', scheduleNext);
      if (rafHandleRef.current !== null) {
        cancelAnimationFrame(rafHandleRef.current);
      }
    };
  }, [src]);

  useEffect(() => {
    if (!playingFrames) return;
    const canvas = canvasRef.current;
    const frames = framesRef.current;
    if (!canvas || frames.length < 2) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = frames[0].width;
    canvas.height = frames[0].height;

    let step = 0;
    const interval = window.setInterval(() => {
      const idx = pingPongIndex(step, frames.length);
      ctx.drawImage(frames[idx], 0, 0);
      step += 1;
    }, 1000 / PLAYBACK_FPS);

    return () => window.clearInterval(interval);
  }, [playingFrames]);

  return (
    <div className="absolute inset-0 z-0 scale-[1.08] origin-center overflow-hidden">
      {!videoFailed && !playingFrames && (
        <video
          ref={videoRef}
          src={src}
          muted
          playsInline
          crossOrigin="anonymous"
          className="h-full w-full object-cover"
        />
      )}
      {!videoFailed && playingFrames && (
        <canvas ref={canvasRef} className="h-full w-full object-cover" />
      )}
      {videoFailed && <div className="h-full w-full bg-gradient-to-b from-[#0d0d0d] to-black" />}
    </div>
  );
}
