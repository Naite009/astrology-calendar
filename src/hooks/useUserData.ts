import { useState, useEffect } from 'react';

export interface UserData {
  name: string;
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  timezone: string;
  birthTimeApproximate?: boolean;
}

export const useUserData = () => {
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('astroUserData');
    if (saved) {
      setUserData(JSON.parse(saved));
    }
  }, []);

  const saveUserData = (data: UserData) => {
    localStorage.setItem('astroUserData', JSON.stringify(data));
    setUserData(data);
  };

  const clearUserData = () => {
    localStorage.removeItem('astroUserData');
    setUserData(null);
  };

  return { userData, saveUserData, clearUserData };
};
