import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VoiceMemo, formatDuration, getCategoryColor, getCategoryLabel } from '@/hooks/useVoiceMemos';
import { cn } from '@/lib/utils';

interface VoiceMemoPlayerProps {
  memo: VoiceMemo;
  onDelete: (id: string) => void;
  onDownload: (memo: VoiceMemo) => void;
  compact?: boolean;
}

export const VoiceMemoPlayer = ({ memo, onDelete, onDownload, compact = false }: VoiceMemoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(memo.duration || 0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Create object URL for audio
  useEffect(() => {
    const url = URL.createObjectURL(memo.audioBlob);
    setAudioUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [memo.audioBlob]);

  // Set up audio element
  useEffect(() => {
    if (!audioUrl) return;
    
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onloadedmetadata = () => {
      setDuration(audio.duration);
    };

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.onerror = () => {
      console.error('Error loading audio');
    };

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (compact) {
    return (
      <div className="flex items-center gap-2 rounded-md bg-secondary/50 px-2 py-1.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={togglePlay}
        >
          {isPlaying ? (
            <Pause className="h-3 w-3" />
          ) : (
            <Play className="h-3 w-3" />
          )}
        </Button>
        <span
          className="h-2 w-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: getCategoryColor(memo.category) }}
        />
        <span className="flex-1 truncate text-xs font-medium">{memo.title}</span>
        <span className="text-[10px] text-muted-foreground">
          {formatDuration(currentTime)} / {formatDuration(duration)}
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: getCategoryColor(memo.category) }}
          />
          <div>
            <h4 className="font-medium text-foreground">{memo.title}</h4>
            <p className="text-xs text-muted-foreground">
              {getCategoryLabel(memo.category)} • {formatDuration(memo.duration)}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onDownload(memo)}
            title="Download"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(memo.id)}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Player Controls */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 flex-shrink-0"
          onClick={togglePlay}
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 ml-0.5" />
          )}
        </Button>

        <div className="flex-1">
          {/* Progress Bar */}
          <div className="relative h-2 w-full rounded-full bg-secondary">
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </div>
          {/* Time Display */}
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>{formatDuration(currentTime)}</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
