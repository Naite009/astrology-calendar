import { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Mic, Upload, X, FileAudio } from 'lucide-react';
import { MemoCategory, validateAudioFile, formatFileSize, getCategoryLabel, getCategoryColor } from '@/hooks/useVoiceMemos';
import { cn } from '@/lib/utils';

interface VoiceMemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  onSave: (
    date: string,
    title: string,
    category: MemoCategory,
    audioBlob: Blob,
    duration: number,
    fileType: string
  ) => Promise<boolean>;
}

const CATEGORIES: MemoCategory[] = [
  'transit-notes',
  'reading-notes',
  'daily-reflection',
  'dream-journal',
  'other',
];

export const VoiceMemoModal = ({ isOpen, onClose, date, onSave }: VoiceMemoModalProps) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MemoCategory>('transit-notes');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dateString = date.toISOString().split('T')[0];
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleFileSelect = useCallback((file: File) => {
    setError(null);
    
    const validation = validateAudioFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    // Get audio duration
    const audio = new Audio();
    audio.src = URL.createObjectURL(file);
    audio.onloadedmetadata = () => {
      setAudioDuration(audio.duration);
      URL.revokeObjectURL(audio.src);
    };
    audio.onerror = () => {
      setError('Could not read audio file');
      URL.revokeObjectURL(audio.src);
    };

    setSelectedFile(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleSave = async () => {
    if (!selectedFile) {
      setError('Please select an audio file');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: selectedFile.type });
      
      const success = await onSave(
        dateString,
        title,
        category,
        blob,
        audioDuration,
        selectedFile.type
      );

      if (success) {
        handleClose();
      } else {
        setError('Failed to save memo');
      }
    } catch (err) {
      console.error('Error saving memo:', err);
      setError('Failed to save memo');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setCategory('transit-notes');
    setSelectedFile(null);
    setAudioDuration(0);
    setError(null);
    setIsSaving(false);
    onClose();
  };

  const removeFile = () => {
    setSelectedFile(null);
    setAudioDuration(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-serif text-xl">
            <Mic className="h-5 w-5 text-primary" />
            Add Voice Memo
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            For: {formattedDate}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* File Upload Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'relative cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-all',
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-secondary/50',
              selectedFile && 'border-primary/30 bg-primary/5'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".m4a,.mp3,.wav,.ogg,.aac,.webm,audio/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
              className="hidden"
            />

            {selectedFile ? (
              <div className="flex items-center justify-center gap-3">
                <FileAudio className="h-8 w-8 text-primary" />
                <div className="text-left">
                  <p className="font-medium text-foreground">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                    {audioDuration > 0 && ` • ${Math.floor(audioDuration / 60)}:${Math.floor(audioDuration % 60).toString().padStart(2, '0')}`}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="ml-auto h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-2 font-medium text-foreground">
                  Upload Audio File
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Click or drag .m4a, .mp3, .wav, .ogg
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Max 50MB
                </p>
              </>
            )}
          </div>

          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="memo-title">Title (optional)</Label>
            <Input
              id="memo-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for this memo..."
              maxLength={100}
            />
          </div>

          {/* Category Selection */}
          <div className="space-y-3">
            <Label>Category</Label>
            <RadioGroup
              value={category}
              onValueChange={(val) => setCategory(val as MemoCategory)}
              className="space-y-2"
            >
              {CATEGORIES.map((cat) => (
                <div key={cat} className="flex items-center space-x-3">
                  <RadioGroupItem value={cat} id={cat} />
                  <Label
                    htmlFor={cat}
                    className="flex cursor-pointer items-center gap-2 font-normal"
                  >
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: getCategoryColor(cat) }}
                    />
                    {getCategoryLabel(cat)}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={!selectedFile || isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Memo'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
