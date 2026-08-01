import { useEffect, useRef, useState } from 'react';
import { BarChart3, Heart } from 'lucide-react';
import { formatTime } from '../lib/formatTime';
import { startDemoBeat, stopDemoBeat } from '../lib/demoBeat';

interface Track {
  artist: string;
  title: string;
  durationSeconds: number;
}

const TRACKS: Track[] = [
  { artist: 'FLEXY', title: 'Ночная смена', durationSeconds: 161 },
  { artist: 'MAYOT', title: 'Район', durationSeconds: 175 },
  { artist: 'YUNGWAY', title: 'На волне', durationSeconds: 153 },
];

const START_ELAPSED = 33;

export function NowPlayingWidget() {
  const [trackIndex, setTrackIndex] = useState(0);
  const [elapsed, setElapsed] = useState(START_ELAPSED);
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const beatTimerRef = useRef<number | null>(null);

  const track = TRACKS[trackIndex];

  useEffect(() => {
    if (!playing) return;
    const tick = window.setInterval(() => {
      setElapsed((prev) => {
        if (prev + 1 >= track.durationSeconds) {
          setPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => window.clearInterval(tick);
  }, [playing, track.durationSeconds]);

  useEffect(() => {
    if (playing) {
      if (!audioCtxRef.current) {
        const AudioCtx =
          window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      beatTimerRef.current = startDemoBeat(audioCtxRef.current);
    } else if (beatTimerRef.current !== null) {
      stopDemoBeat(beatTimerRef.current);
      beatTimerRef.current = null;
    }
    return () => {
      if (beatTimerRef.current !== null) {
        stopDemoBeat(beatTimerRef.current);
        beatTimerRef.current = null;
      }
    };
  }, [playing]);

  function changeTrack(direction: 1 | -1) {
    setPlaying(false);
    setElapsed(0);
    setTrackIndex((i) => (i + direction + TRACKS.length) % TRACKS.length);
  }

  const progressPercent = Math.round((elapsed / track.durationSeconds) * 100);
  const remaining = elapsed - track.durationSeconds;

  return (
    <div className="animate-fade-up delay-5 absolute bottom-4 right-4 z-20 w-[270px] sm:bottom-6 sm:right-6 sm:w-72 md:bottom-8 md:right-10">
      <div className="rounded-2xl bg-white p-2.5 pr-4 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? 'Пауза' : 'Слушать демо-бит'}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-accent transition-transform duration-200 hover:scale-105 active:scale-95"
          >
            <BarChart3 size={20} strokeWidth={2.5} className="text-black" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-gray-900">
              {track.artist} — {track.title}
            </p>
            <div className="mt-1.5 h-1 rounded-full bg-gray-200">
              <div className="h-1 rounded-full bg-accent" style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-gray-500">
              <span>{formatTime(elapsed)}</span>
              <span>{formatTime(remaining)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => changeTrack(-1)}
          className="flex-1 rounded-2xl bg-white py-2 text-sm text-gray-900 shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95"
        >
          Назад
        </button>
        <button
          type="button"
          onClick={() => setLiked((l) => !l)}
          aria-label={liked ? 'Убрать из избранного' : 'В избранное'}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-lg transition-transform duration-200 hover:scale-110 active:scale-95"
        >
          <Heart size={16} className={liked ? 'fill-accent text-accent' : 'text-accent'} />
        </button>
        <button
          type="button"
          onClick={() => changeTrack(1)}
          className="flex-1 rounded-2xl bg-white py-2 text-sm text-gray-900 shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95"
        >
          Вперёд
        </button>
      </div>
    </div>
  );
}
