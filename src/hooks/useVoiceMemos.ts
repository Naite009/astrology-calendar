import { useState, useEffect, useCallback } from 'react';
import { openDB, DBSchema, IDBPDatabase } from 'idb';

export type MemoCategory = 'transit-notes' | 'reading-notes' | 'daily-reflection' | 'dream-journal' | 'other';

export interface VoiceMemo {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  category: MemoCategory;
  audioBlob: Blob;
  duration: number; // seconds
  fileType: string;
  fileSize: number; // bytes
  createdAt: number; // timestamp
}

interface VoiceMemosDB extends DBSchema {
  voiceMemos: {
    key: string;
    value: VoiceMemo;
    indexes: {
      'by-date': string;
      'by-category': MemoCategory;
      'by-createdAt': number;
    };
  };
}

const DB_NAME = 'astro-calendar-voice-memos';
const DB_VERSION = 1;

const CATEGORY_COLORS: Record<MemoCategory, string> = {
  'transit-notes': '#8E24AA',
  'reading-notes': '#1976D2',
  'daily-reflection': '#43A047',
  'dream-journal': '#00897B',
  'other': '#9E9E9E',
};

const CATEGORY_LABELS: Record<MemoCategory, string> = {
  'transit-notes': 'Transit Notes',
  'reading-notes': 'Reading Notes',
  'daily-reflection': 'Daily Reflection',
  'dream-journal': 'Dream Journal',
  'other': 'Other',
};

export const getCategoryColor = (category: MemoCategory): string => CATEGORY_COLORS[category];
export const getCategoryLabel = (category: MemoCategory): string => CATEGORY_LABELS[category];

const VALID_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/m4a',
  'audio/x-m4a',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/ogg',
  'audio/aac',
  'audio/webm',
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const validateAudioFile = (file: File): { valid: boolean; error?: string } => {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File too large. Maximum size is 50MB.' };
  }
  
  // Check MIME type or extension
  const isValidType = VALID_AUDIO_TYPES.includes(file.type) || 
    /\.(m4a|mp3|wav|ogg|aac|webm)$/i.test(file.name);
  
  if (!isValidType) {
    return { valid: false, error: 'Invalid file type. Accepted: .m4a, .mp3, .wav, .ogg, .aac, .webm' };
  }
  
  return { valid: true };
};

export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const useVoiceMemos = () => {
  const [db, setDb] = useState<IDBPDatabase<VoiceMemosDB> | null>(null);
  const [memos, setMemos] = useState<VoiceMemo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize database
  useEffect(() => {
    const initDB = async () => {
      try {
        const database = await openDB<VoiceMemosDB>(DB_NAME, DB_VERSION, {
          upgrade(db) {
            if (!db.objectStoreNames.contains('voiceMemos')) {
              const store = db.createObjectStore('voiceMemos', { keyPath: 'id' });
              store.createIndex('by-date', 'date');
              store.createIndex('by-category', 'category');
              store.createIndex('by-createdAt', 'createdAt');
            }
          },
        });
        setDb(database);
        
        // Load all memos
        const allMemos = await database.getAll('voiceMemos');
        setMemos(allMemos.sort((a, b) => b.createdAt - a.createdAt));
        setIsLoading(false);
      } catch (error) {
        console.error('[VoiceMemos] Failed to initialize database:', error);
        setIsLoading(false);
      }
    };
    
    initDB();
  }, []);

  // Add a new memo
  const addMemo = useCallback(async (
    date: string,
    title: string,
    category: MemoCategory,
    audioBlob: Blob,
    duration: number,
    fileType: string
  ): Promise<VoiceMemo | null> => {
    if (!db) return null;
    
    const memo: VoiceMemo = {
      id: crypto.randomUUID(),
      date,
      title: title.trim() || `Voice Memo - ${new Date().toLocaleTimeString()}`,
      category,
      audioBlob,
      duration,
      fileType,
      fileSize: audioBlob.size,
      createdAt: Date.now(),
    };
    
    try {
      await db.put('voiceMemos', memo);
      setMemos(prev => [memo, ...prev]);
      return memo;
    } catch (error) {
      console.error('[VoiceMemos] Failed to save memo:', error);
      return null;
    }
  }, [db]);

  // Delete a memo
  const deleteMemo = useCallback(async (id: string): Promise<boolean> => {
    if (!db) return false;
    
    try {
      await db.delete('voiceMemos', id);
      setMemos(prev => prev.filter(m => m.id !== id));
      return true;
    } catch (error) {
      console.error('[VoiceMemos] Failed to delete memo:', error);
      return false;
    }
  }, [db]);

  // Get memos for a specific date
  const getMemosForDate = useCallback((date: string): VoiceMemo[] => {
    return memos.filter(m => m.date === date);
  }, [memos]);

  // Get all dates that have memos
  const getDatesWithMemos = useCallback((): Set<string> => {
    return new Set(memos.map(m => m.date));
  }, [memos]);

  // Search memos by title
  const searchMemos = useCallback((query: string): VoiceMemo[] => {
    const lowerQuery = query.toLowerCase();
    return memos.filter(m => 
      m.title.toLowerCase().includes(lowerQuery)
    );
  }, [memos]);

  // Filter by category
  const filterByCategory = useCallback((category: MemoCategory | 'all'): VoiceMemo[] => {
    if (category === 'all') return memos;
    return memos.filter(m => m.category === category);
  }, [memos]);

  // Download a memo
  const downloadMemo = useCallback((memo: VoiceMemo) => {
    const url = URL.createObjectURL(memo.audioBlob);
    const a = document.createElement('a');
    a.href = url;
    const ext = memo.fileType.split('/')[1] || 'mp3';
    a.download = `${memo.title.replace(/[^a-z0-9]/gi, '-')}-${memo.date}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return {
    memos,
    isLoading,
    addMemo,
    deleteMemo,
    getMemosForDate,
    getDatesWithMemos,
    searchMemos,
    filterByCategory,
    downloadMemo,
    getCategoryColor,
    getCategoryLabel,
  };
};
