import { useState, useEffect } from 'react';

export interface NotesState {
  weekNotes: Record<string, string>;
  dayNotes: Record<string, string>;
}

export const useNotes = () => {
  const [weekNotes, setWeekNotes] = useState<Record<string, string>>({});
  const [dayNotes, setDayNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    const savedWeekNotes = localStorage.getItem('weekNotes');
    if (savedWeekNotes) setWeekNotes(JSON.parse(savedWeekNotes));

    const savedDayNotes = localStorage.getItem('dayNotes');
    if (savedDayNotes) setDayNotes(JSON.parse(savedDayNotes));
  }, []);

  const saveWeekNotes = (weekKey: string, notes: string) => {
    const updated = { ...weekNotes, [weekKey]: notes };
    setWeekNotes(updated);
    localStorage.setItem('weekNotes', JSON.stringify(updated));
  };

  const saveDayNotes = (dateKey: string, notes: string) => {
    const updated = { ...dayNotes, [dateKey]: notes };
    setDayNotes(updated);
    localStorage.setItem('dayNotes', JSON.stringify(updated));
  };

  return { weekNotes, dayNotes, saveWeekNotes, saveDayNotes };
};
