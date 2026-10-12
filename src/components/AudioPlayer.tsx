import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Repeat,
  Download,
  X,
  Music,
  FileText,
} from 'lucide-react';
import { MusicMaterial } from '../types/material';

interface AudioPlayerProps {
  currentTrack: MusicMaterial | null;
  onClose: () => void;
  onDownload: (material: MusicMaterial) => void;
  onOpenLyrics?: (material: MusicMaterial) => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  currentTrack,
  onClose,
  onDownload,
  onOpenLyrics,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [showLyricsPopover, setShowLyricsPopover] = useState<boolean>(false);

  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => {
          console.warn('Audio auto-play blocked or error:', e);
          setIsPlaying(false);
        });
    }
  }, [currentTrack]);

  if (!currentTrack) return null;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const skipSeconds = (sec: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(
        0,
        Math.min(audioRef.current.currentTime + sec, duration)
      );
    }
  };

  const changeSpeed = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      if (val === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
      }
    }
  };

  const formatTime = (timeInSec: number) => {
    if (isNaN(timeInSec)) return '00:00';
    const mins = Math.floor(timeInSec / 60);
    const secs = Math.floor(timeInSec % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-teal-200/80 shadow-xl px-4 py-3">
      <audio
        ref={audioRef}
        src={currentTrack.fileUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          if (!isLooping) setIsPlaying(false);
        }}
        loop={isLooping}
      />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Track info */}
        <div className="flex items-center gap-3 w-full md:w-1/4 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-teal-700/20">
            <Music className="w-5 h-5 animate-pulse" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate" title={currentTrack.title}>
              {currentTrack.title}
            </h4>
            <p className="text-[11px] text-teal-700 truncate font-medium">
              {currentTrack.author} · MN Hải Tân
            </p>
          </div>
          {currentTrack.lyrics && (
            <button
              onClick={() => setShowLyricsPopover(!showLyricsPopover)}
              className="p-1.5 rounded-lg text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors shrink-0"
              title="Xem nhanh lời bài hát"
            >
              <FileText className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Player controls & seekbar */}
        <div className="flex flex-col items-center gap-1.5 w-full md:w-2/4">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Speed controller */}
            <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
              {[0.75, 1, 1.25].map((rate) => (
                <button
                  key={rate}
                  onClick={() => changeSpeed(rate)}
                  className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                    playbackRate === rate
                      ? 'bg-teal-700 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={rate === 0.75 ? 'Tốc độ chậm (tập hát)' : rate === 1.25 ? 'Tốc độ nhanh' : 'Tốc độ chuẩn'}
                >
                  {rate}x
                </button>
              ))}
            </div>

            {/* Skip back 5s */}
            <button
              onClick={() => skipSeconds(-5)}
              className="p-1.5 text-slate-600 hover:text-teal-700 transition-colors cursor-pointer"
              title="Lùi 5 giây"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-teal-700 hover:bg-teal-800 text-white flex items-center justify-center shadow-md shadow-teal-700/20 active:scale-95 transition-all cursor-pointer"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>

            {/* Skip forward 5s */}
            <button
              onClick={() => skipSeconds(5)}
              className="p-1.5 text-slate-600 hover:text-teal-700 transition-colors cursor-pointer"
              title="Tiến 5 giây"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Loop */}
            <button
              onClick={() => setIsLooping(!isLooping)}
              className={`p-1.5 transition-colors cursor-pointer rounded-lg ${
                isLooping ? 'text-teal-700 bg-teal-50' : 'text-slate-400 hover:text-slate-600'
              }`}
              title={isLooping ? 'Đang lặp lại bài hát' : 'Bật lặp lại'}
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Seekbar */}
          <div className="w-full flex items-center gap-2 text-[11px] text-slate-500 font-mono">
            <span className="w-10 text-right">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
            <span className="w-10">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume & Actions */}
        <div className="flex items-center justify-end gap-3 w-full md:w-1/4">
          {/* Volume */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleMute}
              className="text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-500" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
          </div>

          {/* Download */}
          <button
            onClick={() => onDownload(currentTrack)}
            className="p-2 rounded-lg text-teal-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
            title="Tải bài hát này về máy"
          >
            <Download className="w-4 h-4 text-emerald-700" />
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            title="Đóng phát nhạc"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Popover lyrics preview */}
      {showLyricsPopover && currentTrack.lyrics && (
        <div className="absolute bottom-full mb-2 left-4 right-4 md:left-auto md:right-8 md:w-96 bg-white rounded-2xl border border-teal-200 shadow-2xl p-4 max-h-72 overflow-y-auto z-50">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
            <h5 className="font-bold text-xs text-teal-800">Lời bài hát: {currentTrack.title}</h5>
            <button
              onClick={() => setShowLyricsPopover(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed italic bg-amber-50/50 p-3 rounded-xl border border-amber-100">
            {currentTrack.lyrics}
          </p>
        </div>
      )}
    </div>
  );
};
