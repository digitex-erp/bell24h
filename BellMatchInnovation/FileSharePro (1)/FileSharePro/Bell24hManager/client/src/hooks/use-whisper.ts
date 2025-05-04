import { useState, useCallback } from 'react';

export const useWhisper = () => {
  const [language, setLanguage] = useState('en-IN');

  const updateLanguage = useCallback((newLanguage: string) => {
    setLanguage(newLanguage);
  }, []);

  const transcribe = useCallback(async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('language', language);

    try {
      const response = await fetch('/api/whisper/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      return data.text;
    } catch (error) {
      console.error('Transcription error:', error);
      return '';
    }
  }, [language]);

  return {
    transcribe,
    updateLanguage,
    currentLanguage: language
  };
};