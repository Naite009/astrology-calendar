import { useCallback } from 'react';
import html2canvas from 'html2canvas';

export const useDownloadImage = () => {
  const downloadAsImage = useCallback(async (
    element: HTMLElement | null,
    filename: string
  ) => {
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#1a1a1a',
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
      });

      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
    }
  }, []);

  return { downloadAsImage };
};
